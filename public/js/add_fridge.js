let xhttp;
// import function from comm-fridge.js

// add event listener to the submit button
let addFridgeBtn = document.querySelector("#add_fridge_btn");
if (addFridgeBtn) {
  addFridgeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    checkInput(sendNewFridgeData); // specify callback function for sending data
  });
}

// check form input
function checkInput(sendData) {
  // keep track if the input is ready for sending
  let correct = true;
  // obtain all text input elements
  let inputFields = document.querySelectorAll(`input[type="text"]`);
  for (let field of inputFields) {
    // check whether the fields are empty
    if (field.value == "" || field.value == null) {
      field.classList.add("error"); // highlight fields that are missing text
      correct = false;
    } else {
      field.classList.remove("error"); // remove error from correctly formatted fields
    }

    // check whether fridge name contains only alphabetical data
    if (field.id === "fridge_name") {
      let regex = /^[a-zA-Z\s]+$/; // create regex
      // check if the input matches the required format
      if (regex.test(field.value)) {
        field.classList.remove("error");
      } else {
        field.classList.add("error");
        correct = false;
      }
    }

    // check whether the field numItemsAccepted contains numbers only
    if (field.id === "num_items_accepted") {
      let regex = /^[0-9]+$/; // create regex
      // check if the input matches the required format
      if (regex.test(field.value)) {
        field.classList.remove("error");
      } else {
        field.classList.add("error");
        correct = false;
      }
    }
  }

  // check if the multiple selection form has been filled
  let acceptedTypes = document.querySelector("#accepted_types");
  if (acceptedTypes.value == "" || acceptedTypes.value == null) {
    acceptedTypes.classList.add("error");
    correct = false;
  } else {
    acceptedTypes.classList.remove("error");
  }
  // collect input from fields to make a JSON object and specify callback function
  if (correct) collectInput(acceptedTypes, sendData);
}

// collect fridge information from the input fields
function collectInput(selections, sendData) {
  // extract selected options from the multiple select list
  let acceptedTypes = [];
  for (let i = 0; i < selections.length; ++i) {
    if (selections.options[i].selected) {
      acceptedTypes.push(selections.options[i].value);
    }
  }

  let newFridge = {};
  // add populate fields in the new fridge object
  newFridge.name = document.querySelector("#fridge_name").value;
  newFridge.can_accept_items = parseInt(
    document.querySelector("#num_items_accepted").value
  );
  newFridge.accepted_types = acceptedTypes;
  newFridge.contact_person = document.querySelector("#contact_person").value;
  newFridge.contact_phone = document.querySelector("#contact_phone").value;
  newFridge.address = {
    street: document.querySelector("#street_name").value,
    postal_code: document.querySelector("#postal_code").value,
    city: document.querySelector("#city").value,
    province: document.querySelector("#province").value,
  };

  sendData(JSON.stringify(newFridge)); // invoke callback function for sending data
}

// send data to the server
function sendNewFridgeData(data) {
  let URL = "http://localhost:8000/fridges";
  xhttp = new XMLHttpRequest(); // create a XMLHttpRequest object
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === XMLHttpRequest.DONE) {
      if (xhttp.status === 200) {
        document.querySelector("form").reset(); // reset form
        // show success message
        displayMessage("New fridge was successfully added!", true);
      } else {
        // show error message
        displayMessage(xhttp.responseText, false);
      }
    }
  };
  xhttp.open("POST", URL, true); // open the connection to the server using POST method
  xhttp.setRequestHeader("Content-Type", "application/json"); // set appropriate request header
  xhttp.send(data); // send data to the server
}

// function to display message box
function displayMessage(text, success) {
  // modify message box
  let messageBox = document.querySelector("#respArea");

  // modify HTML content of the message based on which error has to be shown
  if (success) {
    messageBox.classList.add("success_msg");
    messageBox.classList.remove("error_msg");
    messageBox.innerHTML = `
    <img
      alt="Check Icon"
      height="40"
      id="check_icon"
      src="/images/check_circle_black_36dp.svg"
      width="40"
    />
    ${text}
  `;
  } else {
    messageBox.classList.add("error_msg");
    messageBox.classList.remove("success_msg");
    messageBox.innerHTML = `
    <img
      alt="Cross Icon"
      height="40"
      id="cross_icon"
      src="/images/highlight_off_black_36dp.svg"
      width="40"
    />
    ${text}
  `;
  }

  // show message after successfully dropping off an item for 5 seconds
  messageBox.classList.remove("invisible");
  setTimeout(function () {
    messageBox.classList.add("invisible");
  }, 5000);
}

export { checkInput, collectInput, displayMessage };
