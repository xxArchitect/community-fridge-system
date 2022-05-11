const express = require("express");
const path = require("path");
let router = express.Router();
const app = express();

const fridges = require("./fridges.js"); // import custom module

// function for creating errors
function createError(errorCode, errorMessage) {
  let error = new Error();
  error.status = errorCode;
  error.message = errorMessage;
  return error;
}

// GET /fridges -> Return view_pickup.html OR comm-fridge-data.json
router.get("/", async (req, res, next) => {
  try {
    // determine content-type requested by the client
    if (req.accepts("text/html")) {
      // read view_pickup.html
      let viewAndPickup = await fridges.readFile("./public/view_pickup.html");

      if (viewAndPickup) {
        // send back HTML file
        res.status(200).set("Content-Type", "text/html").send(viewAndPickup);
      } else {
        // didn't find view_pickup.html
        next(
          createError(
            404,
            `404 ERROR: The requested page at /fridges was not found on the server.`
          )
        );
      }
    } else if (req.accepts("application/json")) {
      // read comm-fridge-data.json
      let fridgeData = await fridges.getData("./data/comm-fridge-data.json");

      if (fridgeData instanceof Error) {
        // didn't find comm-fridge-data.json
        next(
          createError(
            404,
            `404 ERROR: The requested resource at /fridges was not found on the server.`
          )
        );
      } else {
        // send back JSON file
        res
          .status(200)
          .set("Content-Type", "application/json")
          .json(fridgeData);
      }
    } else {
      // the content-type requested by the user doesn't match the type of the server resources
      next(createError(500, "500 ERROR: Internal server error."));
    }
  } catch (err) {
    // something else went wrong
    next(createError(500, "500 ERROR: Internal server error."));
  }
});

// POST /fridges -> Add new fridge
router.post("/", express.json(), async (req, res, next) => {
  try {
    // check received data
    let data = req.body;
    let result = await fridges.addFridge(data);
    // check if the fridge was added successfully
    if (result instanceof Error) {
      // something went wrong
      next(createError(500, "500 ERROR: Internal server error."));
    } else if (result) {
      // fridge was successfully added
      res.status(200).set("Content-Type", "application/json").json(result);
    } else {
      // some fields in the client's request were missing
      next(createError(400, "400 ERROR: Malformed or illegal request."));
    }
  } catch (err) {
    next(createError(500, "500 ERROR: Internal server error."));
  }
});

// GET /fridges/addFridge -> Return addFridge.html
router.get("/addFridge", async (req, res, next) => {
  try {
    if (req.accepts("text/html")) {
      // read addFridge.html
      let addFridge = await fridges.readFile("./public/addFridge.html");

      if (addFridge) {
        // send back HTML file
        res.status(200).set("Content-Type", "text/html").send(addFridge);
      } else {
        // didn't find addFridge.html
        next(
          createError(
            404,
            `404 ERROR: The requested page at /fridges${req.url} was not found on the server.`
          )
        );
      }
    } else {
      // the content-type requested by the user doesn't match the type of the server resources
      next(createError(500, "500 ERROR: Internal server error."));
    }
  } catch (err) {
    // something else went wrong
    next(createError(500, "500 ERROR: Internal server error."));
  }
});

// GET /fridges/editFridge -> Return editFridge.html
router.get("/editFridge", async (req, res, next) => {
  try {
    if (req.accepts("text/html")) {
      // read editFridge.html
      let editFridge = await fridges.readFile("./public/editFridge.html");

      if (editFridge) {
        // send back HTML file
        res.status(200).set("Content-Type", "text/html").send(editFridge);
      } else {
        // didn't find editFridge.html
        next(
          createError(
            404,
            `404 ERROR: The requested page at /fridges${req.url} was not found on the server.`
          )
        );
      }
    } else {
      // the content-type requested by the user doesn't match the type of the server resources
      next(createError(500, "500 ERROR: Internal server error."));
    }
  } catch (err) {
    // something else went wrong
    next(createError(500, "500 ERROR: Internal server error."));
  }
});

// GET /fridges/itemsList -> Return list of items with the data for each item
router.get("/itemsList", express.json(), async (req, res, next) => {
  try {
    // determine content-type requested by the client
    if (req.accepts("application/json")) {
      // get items list
      let itemsList = await fridges.getData("./data/comm-fridge-items.json");

      if (itemsList) {
        // send back JSON file
        res.status(200).set("Content-Type", "application/json").json(itemsList);
      } else {
        // didn't find the requested
        next(
          createError(
            404,
            `404 ERROR: The requested resource was not found on the server.`
          )
        );
      }
    } else {
      // the content-type requested by the user doesn't match the accepted return type
      next(createError(400, "400 ERROR: Malformed or illegal request."));
    }
  } catch (err) {
    // something else went wrong
    next(createError(500, "500 ERROR: Internal server error."));
  }
});

// GET /fridges/:fridgeID -> Return information about a fridge with the specified ID
router.get("/:fridgeID", async (req, res, next) => {
  try {
    // determine content-type requested by the client
    if (req.accepts("application/json")) {
      // get information about the requested fridge
      let fridgeID = req.params.fridgeID;
      let fridgeData = await fridges.getFridgeInfo(fridgeID);

      if (fridgeData instanceof Error) {
        // error reading comm-fridge-data.json
        next(fridgeData);
      } else if (fridgeData) {
        // send back JSON file
        res
          .status(200)
          .set("Content-Type", "application/json")
          .json(fridgeData);
      } else {
        // didn't find fridge with the specified ID
        next(
          createError(
            404,
            `404 ERROR: Fridge with the ID ${fridgeID} was not found on the server.`
          )
        );
      }
    } else {
      // the content-type requested by the user doesn't match the accepted return type
      next(createError(400, "400 ERROR: Malformed or illegal request."));
    }
  } catch (err) {
    // something else went wrong
    next(createError(500, "500 ERROR: Internal server error."));
  }
});

// PUT /fridges/:fridgeID -> Update information about a fridge with the specified ID
router.put("/:fridgeID", express.json(), async (req, res, next) => {
  try {
    // get information about the requested fridge
    let fridgeID = req.params.fridgeID;
    // update fridge info
    let result = await fridges.updateFridgeInfo(fridgeID, req.body);

    if (result instanceof Error) {
      // forward error to the error handler
      next(result);
    } else {
      // fridge was successfully updated
      res.status(200).set("Content-Type", "application/json").json(result);
    }
  } catch (err) {
    // something else went wrong
    next(createError(500, "500 ERROR: Internal server error."));
  }
});

// POST /fridges/:fridgeID/items -> Add item to the fridge
router.post("/:fridgeID/items", express.json(), async (req, res, next) => {
  try {
    let fridgeID = req.params.fridgeID; // get fridgeID
    let result = await fridges.addItem(fridgeID, req.body); // add new item to the fridge
    if (result instanceof Error) {
      next(result); // forward error to the error handler
    } else {
      // new item was successfully added to the fridge
      res.status(200).set("Content-Type", "application/json").json(result);
    }
  } catch (err) {
    // something else went wrong
    next(createError(500, "500 ERROR: Internal server error."));
  }
});

// DELETE /fridges/:fridgeID/items -> Delete items specified in the query string
//                                 OR delete all items from the fridge
router.delete("/:fridgeID/items", async (req, res, next) => {
  try {
    let fridgeID = req.params.fridgeID; // get fridgeID
    // remove specified items from the fridge
    let result = await fridges.removeItems(fridgeID, req.query);

    if (result instanceof Error) {
      next(result); // forward error to the error handler
    } else {
      // items were successfully removed from the fridge
      res.status(200).set("Content-Type", "text/html").send();
    }
  } catch (err) {
    // something else went wrong
    next(createError(500, "500 ERROR: Internal server error.")); // something went wrong
  }
});

// DELETE /fridges/:fridgeID/:itemID -> Server should remove specified item from the fridge
router.delete("/:fridgeID/:itemID", async (req, res, next) => {
  try {
    // extract item and fridge ID
    let fridgeID = req.params.fridgeID;
    let itemID = req.params.itemID;
    // remove item from the fridge
    let result = await fridges.removeItem(fridgeID, itemID);

    if (result instanceof Error) {
      next(result); // forward error to the error handler
    } else {
      // items were successfully removed from the fridge
      res.status(200).set("Content-Type", "text/html").send();
    }
  } catch (err) {
    next(createError(500, "500 ERROR: Internal server error.")); // something went wrong
  }
});

module.exports = router;
