let xhttp;
let fridges; // store information about the fridges
let selectedFridge; // store the selected fridge object
let itemsList; // store the list of items
let cartList; // helper array to keep track of the cart items
// hold values of the URLs for each request
const URL_fridge_data = "http://localhost:8000/fridges";
const URL_items_list = "http://localhost:8000/fridges/itemsList";

window.onload = () => {
  // request data after the page has been loaded
  requestData(URL_fridge_data, processFridgeData);
};

// if item selection page is loaded
if (document.querySelector("body").id === "fridge_viewing_selection") {
  // add events listener to the "Pick up items" button
  document
    .querySelector("#pick_up_btn")
    .addEventListener("click", pickUpBtnHandler);
}

// Receiving and Processing Data
/**
 * This function sends an AJAX request to the server to obtain a specific JSON file.
 *
 * param[in] URL Address of the JSON file on the server
 */
function requestData(URL, callback) {
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = callback;
  xhttp.open("GET", URL, true);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.send();
}

/**
 * This function parses the JSON object received the server and assigns it to the fridge.
 */
function returnFridgeData() {
  if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
    let data = xhttp.responseText;
    selectedFridge = JSON.parse(data); // Convert JSON data to the JS data and assign it to variable
    fillViewingSection(selectedFridge); // Fill the fridge viewing page
  } else {
    console.log("There was a problem with the request.");
  }
}

/**
 * This function parses the received JSON files to extract information about fridges.
 */
function processFridgeData() {
  if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
    let data = xhttp.responseText;
    fridges = JSON.parse(data); // Convert JSON data to the array of JavaScript objects
    // fill fridge viewing page only if we are on the viewing and selection page
    if (document.querySelector("body").id === "fridge_viewing_selection") {
      fillFridgePage();
    }
    // request items list
    requestData(URL_items_list, processItemsList);
  } else {
    console.log("There was a problem with the request.");
  }
}

/**
 * This function parses the received JSON files to extract items list.
 */
function processItemsList() {
  if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
    let data = xhttp.responseText;
    itemsList = Object.values(JSON.parse(data)); // Convert JSON data to the array of JavaScript objects
    // fill the dropdown list in the drop-off page only if we are on the adding item page
    if (document.querySelector("body").id === "add_items") {
      fillDropdownList();
    }
  } else {
    console.log("There was a problem with the request.");
  }
}

// Sending Data
/**
 * This function sends the updated information about the fridges or item list to the server
 *
 * param[in] data Information about the updated fridge
 * param[in] URL Address of the HTML page
 */
function sendData(URL, data, kind) {
  xhttp = new XMLHttpRequest(); // create a XMLHttpRequest object
  // update either item list or fridge data after receiving response from the server
  if (kind === "fridgeData") {
    xhttp.onreadystatechange = processFridgeData;
  } else {
    xhttp.onreadystatechange = processItemsList;
  }

  xhttp.open("POST", URL, true); // open the connection to the server using POST method

  if (kind === "fridgeData") {
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  } else {
    xhttp.setRequestHeader("Content-Type", "application/json");
  }
  xhttp.send(data); // set the request to the server
}

// Removing Data
/**
 * This function sends which items should be removed
 *
 * param[in] URL Address of the HTML page along with the query string specifying which items must be removed
 */
function deleteData(URL, callback) {
  xhttp = new XMLHttpRequest(); // create a XMLHttpRequest object
  xhttp.onreadystatechange = callback; // assign callback function;
  xhttp.open("DELETE", URL, true); // open the connection to the server using DELETE method
  xhttp.send(); // set the request to the server
}

// Populating "Choose a Fridge" Page
/**
 * This function extracts information from each fridge in the array
 * and it to the webpage by changing the HTML content of the fridge
 * container element.
 */
function fillFridgePage() {
  // get the container element for fridges
  let fridgeContainer = document.getElementById("fridge_container");

  // create an HTML content for the fridge container
  let htmlFridgeContainer = "";

  // add information about each fridge to the page
  fridges.forEach((fridge) => {
    htmlFridgeContainer += `<div class='fridge' name="${fridge.name}" title="${fridge.id}">
    <img src='images/fridge.svg' alt='Fridge Icon' width='200' height='300' class='fridge_icon'/>
    <p class='fridge_name'>${fridge.name}</p>
    <p class='address'>${fridge.address.street}</p>
    <p class='telephone'>${fridge.contact_phone}</p>
    <button class="edit_fridge_btn">Edit fridge</button>
	</div>`;
  });

  // add HTML content to the fridge container
  fridgeContainer.innerHTML = htmlFridgeContainer;

  let selectionSection = document.querySelector("#fridge_selection");
  let itemViewSection = document.querySelector("#viewing_items");

  // get all current displayed fridges
  let fridgeElements = fridgeContainer.childNodes;

  // add event listeners to current fridges
  for (let fridge of fridgeElements) {
    fridge.addEventListener("click", function (event) {
      if (event.currentTarget.tagName !== "BUTTON") {
        // add event listeners to all children except the "Edit fridge" button
        // change which section is visible
        selectionSection.style.display = "none";
        itemViewSection.style.display = "flex";

        // record which fridge was selected
        let fridgeID = event.currentTarget.getAttribute("title");

        // request data for selected fridge
        requestData(
          `http://localhost:8000/fridges/${fridgeID}`,
          returnFridgeData
        );
      }
    });
  }

  // add event listeners for the edit fridge button
  let editFridgeBtns = document.querySelectorAll(".edit_fridge_btn");
  for (let btn of editFridgeBtns) {
    btn.addEventListener("click", editFridgeHandler);
  }
}

// Populating "Drop off an Item" Page
/**
 * This function extracts information from the itemsList array
 * and populates the dropdown list in the "Drop off an Item" page.
 */
function fillDropdownList() {
  let htmlContent = ""; // string for storing HTML content
  // create dropdown list using
  for (let item of itemsList) {
    htmlContent += `<option value="${item.name}">${item.name}</option>`;
  }
  // update HTML content of the dropdown list
  document.querySelector("#grocery_items").innerHTML = htmlContent;

  // add event listener to the dropdown list
  document.querySelector("select").addEventListener("input", checkInput);
  // add a separate event listener to the add item option
  let addItem = document.querySelector("#add_item_option");
  addItem.removeEventListener("input", checkInput);
  addItem.addEventListener("click", addingItem);
  // add event listener to the input field
  document.querySelector("input").addEventListener("input", checkInput);
  // add event listener to the submit button
  document.querySelector("#find_btn").addEventListener("click", showFridges);
}

// Populating Item Selection Page
/**
 * This functions computes the fridge capacity.
 */
function getFridgeCapacity(fridge) {
  return Math.round((fridge.items.length / fridge.can_accept_items) * 100);
}

/**
 * This function calls helper functions to fill the
 * page that lists contents of the selected fridge.
 */
function fillViewingSection(fridge) {
  // hide add fridge button
  document.querySelector("#add_fridge").style.display = "none";

  // modify page
  updateHeader(fridge);

  // get the number in each category
  let categories = categoryBreakdown(fridge);

  // populate fridge summary on the left side
  updateFridgeSummary(fridge, categories);

  // populate the middle column
  listItems(fridge);

  // helper array to keep track of the cart items
  cartList = extractItems(fridge);
  // refresh cart list
  updateCart();
  // hide pick up items button
  displayPickUpBtn();

  // add event handlers to add buttons
  let addButtons = document.querySelectorAll(".add");
  for (let button of addButtons) {
    button.addEventListener("click", function (event) {
      // retrieve the grand-grandparent
      let itemID =
        event.target.parentNode.parentNode.parentNode.getAttribute("title");

      // update quantities in the fridge and cart list
      changeQuantity(itemID, fridge, true);
    });
  }

  // add event handlers to remove buttons
  let removeButtons = document.querySelectorAll(".remove");
  for (let button of removeButtons) {
    button.addEventListener("click", function (event) {
      // retrieve the grand-grandparent
      let itemID =
        event.target.parentNode.parentNode.parentNode.getAttribute("title");

      // update quantities in the fridge and cart list
      changeQuantity(itemID, fridge, false);
    });
  }

  // add event handlers to the category selector in the fridge summary
  let categoryFilters = document.querySelectorAll(".category");
  for (let filter of categoryFilters) {
    filter.addEventListener("click", function (event) {
      // apply filter to the list of items
      filterByCategory(event, categories);
    });
  }
}

/***************************************************
 Helper functions for fridge selection page
 */

// event listener for edit fridge button
function editFridgeHandler(event) {
  // prevent default event
  event.stopPropagation();
  // obtain the fridgeID that was clicked
  let fridgeID = event.target.parentNode.getAttribute("title");
  // add fridgeID to the query string
  document.location.href = `/fridges/editFridge/?fridgeID=${fridgeID}`;
}

/***************************************************
 Helper functions for populating item selection page
 */

// get information about the fridge item

// find the fridge by name
function findFridge(fridgeName) {
  for (let i = 0; i < fridges.length; ++i) {
    if (fridges[i].name === fridgeName) {
      return i;
    }
  }
  return -1;
}

function updateHeader(fridge) {
  let header = document.querySelector("#section_header");
  header.innerText = "Items in the " + fridge.name;
}

// calculate number of items in each category
function categoryBreakdown(fridge) {
  let categories = [
    { type: "produce", number: 0 },
    { type: "dairy", number: 0 },
    { type: "bakery", number: 0 },
    { type: "frozen", number: 0 },
    { type: "pantry", number: 0 },
  ];

  // calculate number of items in each category
  for (let item of Object.values(fridge.items)) {
    // obtain item info from the items list
    let itemInfo = itemsList[parseInt(item.id)];
    if (itemInfo.type === "produce") categories[0].number++;
    else if (itemInfo.type === "dairy") categories[1].number++;
    else if (itemInfo.type === "bakery") categories[2].number++;
    else if (itemInfo.type === "frozen") categories[3].number++;
    else if (itemInfo.type === "pantry") categories[4].number++;
  }

  // return filled array
  return categories;
}

// update left side with the fridge info and item categories
function updateFridgeSummary(fridge, categories) {
  let fridgeSummary = document.querySelector("#fridge_summary");
  let fridgeCapacity = getFridgeCapacity(fridge);
  fridgeSummary.innerHTML = `
      <h2 id="fridge_name1">${fridge.name}</h2>
      <p class="fridge_info">${fridge.contact_phone}</p>
      <p class="fridge_info">${fridge.address.street}</p>
      <div id="scale"><div style="width: ${
        fridgeCapacity > 94 ? 94 : fridgeCapacity
      }%;" id="inner_bar">${fridgeCapacity}%</div></div>
      <p class="category produce">Produce (${categories[0].number})</p>
      <p class="category dairy">Dairy (${categories[1].number})</p>
      <p class="category bakery">Bakery (${categories[2].number})</p>
      <p class="category frozen">Frozen (${categories[3].number})</p>
      <p class="category pantry">Pantry (${categories[4].number})</p>
  `;
}

// fill the list with items in the middle column
function listItems(fridge) {
  let htmlContent = "";

  for (let item of Object.values(fridge.items)) {
    // obtain item info from the items list
    let itemInfo = itemsList[parseInt(item.id)];
    // list only selected category of items
    htmlContent += `
      <div class="item ${itemInfo.type}" title="${item.id}">
          <img src="${itemInfo.img}" width="125" height="125" />
          <div class="middle">
            <div class="item_name">${itemInfo.name}</div>
            <div class="quantity">Quantity: ${item.quantity}</div>
            <div class="pickup">Pickup item:</div>
          </div>
          <div class="right">
            <div class="space_filler">&nbsp;</div>
            <div class="space_filler">&nbsp;</div>
            <div class="add_rem">
              <button class="remove">-</button>
              <div class="number">0</div>
              <button class="add">+</button>
            </div>
          </div>
        </div>
    `;
  }

  // update HTML content of the middle column
  document.querySelector("#items_list").innerHTML = htmlContent;
}

// extract items from the fridge
function extractItems(fridge) {
  // create helper array
  let cartList = [];

  for (let item of Object.values(fridge.items)) {
    let itemObj = {
      id: item.id,
      quantity: 0, // initialize selected quantity to zero
    };
    cartList.push(itemObj);
  }

  return cartList; // return helper array
}

// update quantity of items
function changeQuantity(itemID, fridge, add) {
  // retrieve the item from the fridge
  let fridgeItem = {};
  for (let item of Object.values(fridge.items)) {
    if (item.id == itemID) {
      fridgeItem = item;
      break;
    }
  }

  // retrieve item from the cart list
  let cartItem = {};
  for (let item of cartList) {
    if (item.id == itemID) {
      cartItem = item;
      break;
    }
  }

  // adding items to the cart
  if (add) {
    // update the quantity in the fridge and cartList
    if (fridgeItem.quantity > 0) {
      cartItem.quantity++;
      fridgeItem.quantity--;
    }
  } else {
    // removing items from the cart
    if (cartItem.quantity > 0) {
      cartItem.quantity--;
      fridgeItem.quantity++;
    }
  }

  // update displayed quantity
  updateDisplayedQuantity(itemID, cartItem.quantity);
  // update list of items in the cart
  updateCart();
  // hide and show pick up items button
  displayPickUpBtn(fridge);
}

function updateDisplayedQuantity(itemID, newQuantity) {
  // get the displayed quantities
  let quantities = document.querySelectorAll(".number");

  // search for item in the cart list and update its quantity
  for (let quantity of quantities) {
    if (
      quantity.parentNode.parentNode.parentNode.getAttribute("title") == itemID
    ) {
      quantity.textContent = newQuantity;
    }
  }
}

function updateCart() {
  // get cart element
  let cart = document.querySelector("#cart_items");

  let htmlContent = "";

  for (let item of cartList) {
    // obtain item info from the items list
    let itemInfo = itemsList[parseInt(item.id)];
    // add item to the cart
    if (item.quantity > 0) {
      htmlContent += `<li>${item.quantity} x ${itemInfo.name}</li>`;
    }
  }

  // update HTML content of the cart
  cart.innerHTML = htmlContent;
}

// fill the item list in the middle
function hideItems(category) {
  // get all displayed items
  let displayedItems = document.querySelectorAll(".item");

  for (let item of displayedItems) {
    // list only selected category of items
    if (item.classList[1] === category) {
      item.style.display = "flex"; // show item that match filter
    } else {
      item.style.display = "none"; // hide the rest of items
    }
  }
}

// apply category filter on the list of items in the middle
function filterByCategory(event, categories) {
  // get the category
  let categoryFilter = event.target.classList[1];

  // check if the category has items in it
  for (let category of categories) {
    if (category.type === categoryFilter) {
      if (category.number > 0) {
        hideItems(categoryFilter);
      }
    }
  }
}

// handle press on the Pick up items button
function pickUpBtnHandler() {
  // get all selected item from the cart
  let selectedItems = cartList.filter((item) => {
    return item.quantity > 0;
  });

  // prepare query string
  let URL = `http://localhost:8000/fridges/${selectedFridge.id}/items/`;
  let data = "?";
  for (let selectedItem of selectedItems) {
    data += `itemId${selectedItem.id}=${selectedItem.quantity}`;
    // don't add & after the last item
    if (selectedItems.indexOf(selectedItem) !== selectedItems.length - 1) {
      data += "&";
    }
  }

  // Callback function for the deleteData function
  const callback = () => {
    if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
      // request data for selected fridge
      requestData(
        `http://localhost:8000/fridges/${selectedFridge.id}`,
        returnFridgeData
      );
    } else {
      console.log("There was a problem with the request.");
    }
  };

  // make request to server
  deleteData(URL + data, callback);
}

// hide and show pick up items button
function displayPickUpBtn(fridge) {
  let pickUpBtn = document.querySelector("#pick_up_btn");
  // check if cart is non-empty by looking at the quantities of the cart items
  if (
    cartList.filter((item) => {
      return item.quantity > 0;
    }).length > 0
  ) {
    pickUpBtn.classList.remove("invisible"); // show button if cart is not empty
  } else {
    pickUpBtn.classList.add("invisible"); // hide button otherwise
  }
}

/***************************************************
 Helper functions for the dropping off an item page
 */

// Checks the input for the dropdown list and input field
function checkInput() {
  // hide list of available fridges
  document.querySelector("#view_results").classList.add("invisible");
  // hide helper message
  document.querySelector("#respArea").classList.add("invisible");
  // get dropdown list element
  let dropdownList = document.querySelector("select");
  // get input field element
  let inputField = document.querySelector("input");
  // check whether the input is not empty and whether user
  // has entered a number in the text input field
  document.querySelector("#find_btn").disabled = !(
    dropdownList.value !== null &&
    dropdownList.value !== "" &&
    inputField.value !== null &&
    inputField.value !== "" &&
    !isNaN(inputField.value) &&
    inputField.value > 0
  );
}

// Shows fridges where user can drop off selected item
function showFridges(event = null) {
  // prevent default action of the submit button
  if (event != null) event.preventDefault();

  // determine item name
  let itemName = document.querySelector("select").value;
  // determine the type of the item
  let itemType = findItemType(itemName);
  // determine the number of items requested
  let itemNumber = document.querySelector("input").value;

  let availableFridges = [];

  // find fridges that match criteria
  for (let fridge of fridges) {
    if (
      getFridgeCapacity(fridge) < 100 &&
      fridge.accepted_types.includes(itemType) &&
      fridge.can_accept_items >= itemNumber
    ) {
      availableFridges.push(fridge);
    }
  }

  // find best suited fridge
  let bestFridge = selectBestFridge(itemName, availableFridges);

  // add header
  let htmlContent = "<h2>Available fridges</h2>";
  // add details for each fridge and highlight the best option
  for (let fridge of availableFridges) {
    htmlContent += `
      <div title="${fridge.name}" 
      class="available_fridge${fridge === bestFridge ? " best" : ""}"> 
         <img src='images/fridge.svg' alt='Fridge Icon' width='62.5' height='125' class='fridge_icon'/>
        <p><strong>${fridge.name}</strong></p>
        <p>${fridge.address.street}</p>
        <p>${fridge.contact_phone}</p>
        <p class="fridge_capacity"><strong>Capacity:</strong> ${getFridgeCapacity(
          fridge
        )}%</p>
        <p><strong>Can accept # of items:</strong> ${
          fridge.can_accept_items
        }</p>
      </div>
    `;
  }
  // update HTML content of the view results section
  document.querySelector("#view_results").innerHTML = htmlContent;
  // make available fridges visible
  document.querySelector("#view_results").classList.remove("invisible");

  // wrapper function for dropping off an item
  function wrapper(event) {
    dropOffItem(event, itemName, parseInt(itemNumber));
  }

  for (let fridge of document.querySelectorAll(".available_fridge")) {
    fridge.addEventListener("click", wrapper);
  }
}

// returns the type of item
function findItemType(itemName) {
  // search through the items list to find item type
  for (let item of itemsList) {
    if (item.name === itemName) {
      return item.type;
    }
  }
}

// selects the fridge best suited for receiving the specified item
function selectBestFridge(itemName, availableFridges) {
  let minQuantity = Number.POSITIVE_INFINITY;
  let bestFridge = undefined;
  // search through all available fridges
  for (let fridge of availableFridges) {
    // find the item in the fridge
    for (let item of fridge.items) {
      if (item.name === itemName) {
        // update the least quantity and best suited fridge
        if (item.quantity < minQuantity) {
          minQuantity = item.quantity;
          bestFridge = fridge;
        } else if (item.quantity === minQuantity) {
          // select the fridge with the lowest capacity
          if (getFridgeCapacity(fridge) < getFridgeCapacity(bestFridge)) {
            bestFridge = fridge;
          }
        }
      }
    }
  }

  // if there are no such items yet in any of the fridges
  if (bestFridge === undefined) {
    bestFridge = availableFridges[0];
    for (let i = 1; i < availableFridges.length; ++i) {
      // select fridge with the lowest capacity
      if (availableFridges[i].capacity < getFridgeCapacity(bestFridge)) {
        bestFridge = availableFridges[i];
      }
    }
  }

  return bestFridge; // return best suited fridge
}

// process dropping-off an item into the selected fridge
function dropOffItem(event, itemName, itemNumber) {
  let el = event.target;
  // find the name of the div element if current target of the event is the child of the div
  while (el.tagName !== "DIV") {
    el = el.parentElement;
  }

  // find selected fridge in the original array
  let fridge = (() => {
    for (let fridge of fridges) {
      if (fridge.name === el.title) {
        return fridge;
      }
    }
  })();

  // store the object referring to this item
  let itemObj = undefined;
  // check for the item in the item list
  for (let item of itemsList) {
    if (item.name === itemName) {
      itemObj = item;
      break;
    }
  }

  let itemPresent = false; // check if them is present in the fridge
  // find item and update its quantity in the fridge
  for (let item of fridge.items) {
    if (item.name === itemName) {
      item.quantity += itemNumber;
      itemPresent = true; // found item
      break;
    }
  }

  // if item is not found add new item to the fridge
  if (!itemPresent && itemObj !== undefined) {
    fridge.items.push({
      name: itemName,
      quantity: itemNumber,
      type: itemObj.type,
      img: itemObj.img,
    });
  }

  // update current capacity by calculating how much
  // percentage a single item increases to the capacity

  let newFridgeCapacity =
    getFridgeCapacity(fridge) +
    Math.round(
      ((100 - getFridgeCapacity(fridge)) / fridge.can_accept_items) * itemNumber
    );
  // update other fields in the fridge
  fridge.num_items_accepted += itemNumber;
  fridge.can_accept_items -= itemNumber;

  // prepare a query string containing all data to be sent
  let URL = "http://localhost:8000/drop.html";
  let data = "?=&type=fUpdate";
  data += "&fName=" + fridge.name;
  data += "&itemAcc=" + fridge.num_items_accepted;
  data += "&canAcc=" + fridge.can_accept_items;
  data += "&itemName=" + itemName;
  data += "&itemNum=" + itemNumber;

  // include additional details about the item
  if (itemObj !== undefined) {
    data += "&itemType=" + itemObj.type;
    data += "&itemImg=" + itemObj.img;
  } else {
    data += "&itemType=" + "null";
    data += "&itemImg=" + "null";
  }

  sendData(URL, data, "fridgeData");

  // display message box
  displayMessage("The item has been successfully added to the fridge!");

  // update fridge information
  showFridges();
}

// function that updates the DOM to allow user to add new item
function addingItem() {
  // make popup form visible
  document.querySelector("#popup").classList.remove("invisible");
  // add event listener to the close button
  document.querySelector("#close_icon").addEventListener("click", () => {
    // hide add form
    document.querySelector("#popup").classList.add("invisible");
  });

  // check when the value of the files in the add item popup form
  document.querySelector("input[type=file]").addEventListener("input", () => {
    checkAddItemForm();
  });
}

// check input in the add item form
function checkAddItemForm() {
  // get item name
  let itemName = document.querySelector("#item_name").value;
  // get item type
  let itemType = document.querySelector("#item_type").value;
  // get input file
  let icon = document.getElementById("item_icon_upload");
  // check if the fields are empty and enable button
  if (
    itemName !== null &&
    itemName !== "" &&
    itemType !== null &&
    itemType !== "" &&
    icon !== null
  ) {
    // wrapper function
    function wrapper(event) {
      // prevent default action of the submit button
      if (event != null) event.preventDefault();
      addItemToList(itemName, itemType.toLowerCase(), icon);
    }

    // add event listener to the submit button
    document.querySelector("#add_btn").addEventListener("click", wrapper);
    // make button visible
    document.querySelector("#add_btn").disabled = false;
  }
}

// process add item popup form and send data
function addItemToList(itemName, itemType, icon) {
  // create FileReader object
  let fReader = new FileReader();
  // read the contents of the icon and create raw binary data representation
  fReader.readAsDataURL(icon.files[0]);
  fReader.onloadend = function (event) {
    // save the name of the icon
    let pathname = "images/" + icon.files[0].name;
    // obtain raw binary data
    let binaryData = fReader.result;
    binaryData = binaryData.substring(binaryData.indexOf(",") + 1);

    let itemPresent = false; // check if the item is already in the list
    // check if the added is already present in the item list
    for (let item of itemsList) {
      if (
        item.name.toLowerCase() === itemName.toLowerCase() &&
        item.type === itemType
      ) {
        itemPresent = true; // found the same item in the list
        break;
      }
    }

    // add new item if it is not present
    if (!itemPresent) {
      // add new object to the items list
      itemsList.push({
        name: itemName,
        type: itemType,
        img: pathname,
      });

      // prepare a JSON to be sent over the HTTP protocol
      let URL = "http://localhost:8000/drop.html";
      let data = JSON.stringify({
        itemName: itemName,
        itemType: itemType,
        pathname: pathname,
        image: binaryData,
      });

      sendData(URL, data, "listData");
    }

    // hide and reset add form
    document.querySelector("#popup").classList.add("invisible");
    document.querySelector("#add_item_form").reset();

    // display helper message
    displayMessage(`${itemName} was successfully added to the items list!`);
  };
}

// function to display message box
function displayMessage(text) {
  // modify message box
  let messageBox = document.querySelector("#respArea");

  // modify HTML content of the message
  messageBox.innerHTML = `
    <img
      alt="Check Icon"
      height="40"
      id="check_icon"
      src="images/check_circle_black_36dp.svg"
      width="40"
    />
    ${text}
  `;

  // show message after successfully dropping off an item for 5 seconds
  messageBox.classList.remove("invisible");
  setTimeout(function () {
    messageBox.classList.add("invisible");
  }, 5000);
}
