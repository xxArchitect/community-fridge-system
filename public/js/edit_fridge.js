let xhttp;
let selectedFridge;
let fridgeID;
// import functions from other JS files
import { checkInput, collectInput, displayMessage } from "./add_fridge.js";

// get the requested fridge ID
window.onload = () => {
  let currentURL = window.location.href;
  // extract fridge from the URL of the current page
  fridgeID = currentURL.substring(currentURL.indexOf("=") + 1);
  let URL = "http://localhost:8000/fridges/" + fridgeID;
  requestFridgeData(URL); // send a request to receive data
};

// Request data from the server
function requestFridgeData(URL) {
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = processFridgeData;
  xhttp.open("GET", URL, true);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.send();
}

// data processing function for fridge information
function processFridgeData() {
  if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
    let fridgeData = xhttp.responseText; // Data returned by the AJAX request
    selectedFridge = JSON.parse(fridgeData); // Convert the JSON data to a JavaScript object
    fillPage(selectedFridge); // fill page with the fridge information
  } else {
    console.log("There was a problem with the request.");
  }
}

// fill page with information about the selected fridge
function fillPage(fridge) {
  // update section header
  document.querySelector("#section_header").textContent = `Edit ${fridge.name}`;
  // fill form fields
  document.querySelector("#fridge_name").value = fridge.name;
  document.querySelector("#num_items_accepted").value = fridge.can_accept_items;
  let acceptedTypes = document.querySelector("#accepted_types");
  // select all accepted types in the multiple select box
  for (let i = 0; i < acceptedTypes.length; ++i) {
    if (fridge.accepted_types.includes(acceptedTypes.options[i].value)) {
      acceptedTypes.options[i].selected = true;
    }
  }
  document.querySelector("#contact_person").value = fridge.contact_person;
  document.querySelector("#contact_phone").value = fridge.contact_phone;
  document.querySelector("#street_name").value = fridge.address.street;
  document.querySelector("#postal_code").value = fridge.address.postal_code;
  document.querySelector("#city").value = fridge.address.city;
  document.querySelector("#province").value = fridge.address.province;
}

// configure edit fridge button
document
  .querySelector("#edit_fridge_btn")
  .addEventListener("click", (event) => {
    event.preventDefault(); // prevent default submit action
    checkInput(sendFridgeData); // check input
  });

// send updated fridge data
function sendFridgeData(data) {
  let URL = `http://localhost:8000/fridges/${fridgeID}`;
  xhttp = new XMLHttpRequest(); // create a XMLHttpRequest object
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === XMLHttpRequest.DONE) {
      if (xhttp.status === 200) {
        // show success message
        displayMessage(
          `${selectedFridge.name} was successfully updated!`,
          true
        );
      } else {
        // show error message
        displayMessage(xhttp.responseText, false);
      }
    }
  };
  xhttp.open("PUT", URL, true); // open the connection to the server using PUT method
  xhttp.setRequestHeader("Content-Type", "application/json"); // set appropriate request header
  xhttp.send(data); // send data to the server
}
