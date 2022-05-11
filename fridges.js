const file = require("fs");

// reads data from the specified file
const readFile = async function (pathname) {
  try {
    // file was successfully found and read
    let contents = await file.readFileSync(pathname);
    return String(contents);
  } catch (err) {
    return undefined; // file not found
  }
};

// writes data to the specified file
const updateFile = async function (data, pathname) {
  try {
    file.writeFileSync(pathname, JSON.stringify(data));
    return true;
  } catch (err) {
    return undefined; // something went wrong
  }
};

// return data from the specified JSON file
const getData = async function (pathname) {
  // read information from the specified file
  let data = await readFile(pathname);
  // return parse data from JSON file
  if (data) return JSON.parse(data);
  // couldn't read file
  else return new Error();
};

// add new fridge to the array if all necessary fields are present
exports.addFridge = async function (data) {
  // check for presence of necessary fields
  if (
    !("name" in data) ||
    !("can_accept_items" in data) ||
    !("accepted_types" in data) ||
    !("contact_person" in data) ||
    !("contact_phone" in data) ||
    !("address" in data) ||
    !("street" in data.address) ||
    !("postal_code" in data.address) ||
    !("city" in data.address) ||
    !("province" in data.address)
  )
    return undefined;

  // get fridge information
  let fridges = await getData("./data/comm-fridge-data.json");
  if (fridges instanceof Error) return new Error(); // couldn't get fridge information from the file

  // generate new fridge id
  let newId = 1;
  for (let fridge of fridges) {
    // extract the number in the id of the fridge
    let curId = parseInt(fridge.id.charAt(fridge.id.length - 1));
    // update the id of the new fridge to make it unique
    if (curId === newId) ++newId;
  }

  // make a string for the new fridge id
  let newIdString = "fg-" + newId;

  // create new fridge object and populate its fields
  let newFridge = {};
  newFridge.id = newIdString;
  newFridge.name = data.name;
  newFridge.num_items_accepted = 0;
  newFridge.can_accept_items = data.can_accept_items;
  newFridge.accepted_types = data.accepted_types;
  newFridge.contact_person = data.contact_person;
  newFridge.contact_phone = data.contact_phone;
  newFridge.address = data.address;
  newFridge.address.country = "Canada";
  newFridge.items = [];

  // add new fridge
  fridges.push(newFridge);
  // write changes to the file and return new fridge object
  if (await updateFile(fridges, "./data/comm-fridge-data.json"))
    return newFridge;
  else return new Error(); // something went wrong
};

// get information about a specific fridge
const getFridgeInfo = async function (fridgeID) {
  // check if the user has provided correct format for the fridgeID
  let correctFormat = fridgeID.match(/[a-z]+[\W]*[0-9]+/);
  if (!correctFormat) {
    let error = new Error();
    error.status = 400;
    error.message = "400 ERROR: Improperly formatted fridgeID.";
    return error;
  }

  // get fridge information
  let fridges = await getData("./data/comm-fridge-data.json");
  if (fridges instanceof Error) {
    let error = new Error();
    error.status = 500;
    error.message = "500 ERROR: Internal server error.";
    return error; // couldn't get fridge information from the file
  }

  // search for the specific fridge
  for (let fridge of fridges) {
    if (fridge.id === fridgeID) {
      return fridge; // return if found
    }
  }
  return undefined; // requested fridge was not found
};

// update information about a fridge
exports.updateFridgeInfo = async function (fridgeID, data) {
  // create error object for potential errors
  let error = new Error();

  // check if the user has provided correct format for the fridgeID
  let correctFormat = fridgeID.match(/[a-z]+[\W]*[0-9]+/);
  if (!correctFormat) {
    let error = new Error();
    error.status = 404;
    error.message = `404 ERROR: Fridge with the ID ${fridgeID} was not found on the server.`;
    return error;
  }

  // get fridge information
  let fridges = await getData("./data/comm-fridge-data.json");
  if (fridges instanceof Error) {
    // couldn't get fridge information from the file
    error.status = 500;
    error.message = "500 ERROR: Internal server error.";
    return error;
  }

  // check for the presence of fridge
  let selectedFridge = undefined;
  for (let fridge of fridges) {
    if (fridge.id === fridgeID) {
      selectedFridge = fridge; // record matching fridge
      break;
    }
  }
  // fridge with the specified ID doesn't exist
  if (selectedFridge === undefined) {
    error.status = 404;
    error.message = `404 ERROR: Fridge with the ID ${fridgeID} was not found on the server.`;
    return error;
  }

  // check for presence of necessary fields
  if (
    !("name" in data) &&
    !("can_accept_items" in data) &&
    !("accepted_types" in data) &&
    !("contact_person" in data) &&
    !("contact_phone" in data) &&
    !("address" in data)
  ) {
    // invalid client request
    error.status = 400;
    error.message = "400 ERROR: Malformed or illegal request.";
    return error;
  }

  // if the data contains address information,
  // check for validity of the address information
  if ("address" in data) {
    if (
      !("street" in data.address) &&
      !("postal_code" in data.address) &&
      !("city" in data.address) &&
      !("province" in data.address)
    ) {
      // invalid client request
      error.status = 400;
      error.message = "400 ERROR: Malformed or illegal request.";
      return error;
    }
  }

  // update fields in the fridge
  for (let key of Object.keys(data)) {
    if (key === "address") {
      // update individual fields in the address attribute
      for (let addressKey of Object.keys(data.address)) {
        selectedFridge[key][addressKey] = data[key][addressKey];
      }
    } else {
      // update other fields as usual
      selectedFridge[key] = data[key];
    }
  }

  // write changes to the file and return newly added information
  if (updateFile(fridges, "./data/comm-fridge-data.json").then()) return data;
  else {
    // couldn't update file
    error.status = 500;
    error.message = "500 ERROR: Internal server error.";
    return error;
  }
};

exports.addItem = async function (fridgeID, data) {
  // error object for returning errors to the router
  let error = new Error();

  // check if the user has provided correct format for the fridgeID
  let correctFormat = fridgeID.match(/[a-z]+[\W]*[0-9]+/);
  if (!correctFormat) {
    error.status = 404;
    error.message = `404 ERROR: Fridge with the ID ${fridgeID} was not found on the server.`;
    return error;
  }

  // check the validity of data
  if (
    !("id" in data) ||
    !("quantity" in data) ||
    Object.keys(data).length !== 2 ||
    data.quantity < 1 // cannot add zero or negative numbers of items
  ) {
    // invalid client request
    error.status = 400;
    error.message = "400 ERROR: Malformed or illegal request.";
    return error;
  }

  // get fridge information
  let fridges = await getData("./data/comm-fridge-data.json");
  if (fridges instanceof Error) {
    // couldn't get fridge information from the file
    error.status = 500;
    error.message = "500 ERROR: Internal server error.";
    return error;
  }

  // get information from the comm-fridge-items.json
  let itemsList = await getData("./data/comm-fridge-items.json");
  if (itemsList instanceof Error) {
    // couldn't get information from the file
    error.status = 500;
    error.message = "500 ERROR: Internal server error.";
    return error;
  }

  // check if the item is present in the items list
  if (itemsList[data.id] === undefined) {
    error.status = 404;
    error.message = `404 ERROR: Item with the ID ${data.id} was not found on the server.`;
    return error;
  }

  // find corresponding fridge
  for (let fridge of fridges) {
    if (fridge.id === fridgeID) {
      // check if the item already exists in the fridge
      for (let item of fridge.items) {
        // give an error if the item with the specified ID already exists in the fridge
        if (item.id === data.id) {
          error.status = 409;
          error.message = `409 ERROR: Item with the ID ${data.id} already exists in the fridge with ID ${fridgeID}.`;
          return error;
        }
      }
      // add new item
      fridge.items.push(data);

      // write changes to the file and return newly added item
      if (await updateFile(fridges, "./data/comm-fridge-data.json"))
        return data;
      else {
        // couldn't update file
        error.status = 500;
        error.message = "500 ERROR: Internal server error.";
        return error;
      }
    }
  }

  // fridge with the specified ID doesn't exist
  error.status = 404;
  error.message = `404 ERROR: Fridge with the ID ${fridgeID} was not found on the server.`;
  return error;
};

// remove item with the specified ID from the fridge with the specified ID
exports.removeItem = async function (fridgeID, itemID) {
  // error object for returning errors to the router
  let error = new Error();

  // check if the user has provided correct format for the fridgeID
  let correctFormat = fridgeID.match(/[a-z]+[\W]*[0-9]+/);
  if (!correctFormat) {
    error.status = 404;
    error.message = `404 ERROR: Fridge with the ID ${fridgeID} was not found on the server.`;
    return error;
  } else {
    correctFormat = itemID.match(/[0-9]+/);
    if (!correctFormat) {
      error.status = 404;
      error.message = `404 ERROR: Item with the ID ${itemID} was not found in the fridge with the ID ${fridgeID}.`;
      return error;
    }
  }

  // get fridge information
  let fridges = await getData("./data/comm-fridge-data.json");
  if (fridges instanceof Error) {
    // couldn't get fridge information from the file
    error.status = 500;
    error.message = "500 ERROR: Internal server error.";
    return error;
  }

  // search for fridge ID
  for (let fridge of fridges) {
    if (fridge.id === fridgeID) {
      // search for item ID
      for (let item of fridge.items) {
        if (item.id == itemID) {
          decrementQuantity(item, fridge);
          // write changes to the file and return empty object
          if (await updateFile(fridges, "./data/comm-fridge-data.json"))
            return {};
          else {
            // couldn't update file
            error.status = 500;
            error.message = "500 ERROR: Internal server error.";
            return error;
          }
        }
      }
    }
  }

  // didn't find either fridge or item ID
  error.status = 404;
  error.message = `404 ERROR: Fridge with the ID ${fridgeID} or item with the ID ${itemID} were not found on the server.`;
  return error;
};

// remove several items from the fridge with the specified ID
exports.removeItems = async function (fridgeID, items) {
  // error object for returning errors to the router
  let error = new Error();

  // check if the user has provided correct format for the fridgeID
  let correctFormat = fridgeID.match(/[a-z]+[\W]*[0-9]+/);
  if (!correctFormat) {
    error.status = 404;
    error.message = `404 ERROR: Fridge with the ID ${fridgeID} was not found on the server.`;
    return error;
  }

  // get fridge information
  let fridges = await getData("./data/comm-fridge-data.json");
  if (fridges instanceof Error) {
    // couldn't get fridge information from the file
    error.status = 500;
    error.message = "500 ERROR: Internal server error.";
    return error;
  }

  // check whether items were successfully removed
  let itemsRemoved = false;

  // check whether query string was provided
  let itemsSpecified = Object.keys(items).length > 0;

  // search for specified fridge
  for (let fridge of fridges) {
    if (fridge.id === fridgeID) {
      // check if the query string was provided
      if (itemsSpecified) {
        for (let i = 0; i < fridge.items.length; ++i) {
          for (let key of Object.keys(items)) {
            // get the item ID and number of items to remove
            let id = key.substring(key.indexOf("Id") + 2);
            let itemsToRemove = 1;
            // check if the number of items to remove was provided
            if (items[key] !== "") {
              // get number of items that must be removed
              itemsToRemove = parseInt(items[key]);
            }

            if (fridge.items[i].id === id) {
              // delete items with matching IDs in the items list
              for (let j = 0; j < itemsToRemove; ++j)
                decrementQuantity(fridge.items[i], fridge);
              delete items[key]; // delete key from items
              itemsRemoved = true; // record successful removal
            }
          }
        }
      } else {
        // no query string -> decrement quantity of all items
        for (let i = 0; i < fridge.items.length; ++i) {
          // account for shifting indices in case if item will be removed
          let shiftIndex = false;
          if (fridge.items[i].quantity <= 1) shiftIndex = true;
          decrementQuantity(fridge.items[i], fridge);
          if (shiftIndex) --i; // shift index
        }
        itemsRemoved = true;
      }
      break;
    }
  }

  // if items were successfully removed
  if (itemsRemoved) {
    // write changes to the file and return empty object
    if (await updateFile(fridges, "./data/comm-fridge-data.json")) return {};
    else {
      // couldn't update file
      error.status = 500;
      error.message = "500 ERROR: Internal server error.";
      return error;
    }
  } else {
    // either fridgeID or itemID were not found
    error.status = 404;
    error.message = `404 ERROR: Fridge with the ID ${fridgeID} or items with the specified IDs were not found on the server.`;
    return error;
  }
};

// function which is used to decrement item quantity
function decrementQuantity(item, fridge) {
  // remove item if its quantity will become 0
  if (item.quantity <= 1) {
    let index = fridge.items.indexOf(item); // find index of item to delete
    fridge.items.splice(index, 1); // remove item
  } else {
    // decrement item quantity
    item.quantity--;
  }
}

// export functions
exports.readFile = readFile;
exports.getData = getData;
exports.getFridgeInfo = getFridgeInfo;
