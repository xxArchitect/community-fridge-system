const express = require("express");
const path = require("path");
const app = express();

const serverRouter = require("./router.js");

// Forward all requests starting with /fridges to this router
app.use("/fridges", serverRouter);

// Serving GET request for the main page
app.get("/", handleMainPageRequest);
app.get("/index.html", handleMainPageRequest);

// function for handling the main page request
function handleMainPageRequest(req, res, next) {
  // send the HTML file
  res.sendFile(path.join(__dirname, "/public/index.html"), (err) => {
    if (err) {
      // forward error to the error handler function
      err.message = `404 ERROR: The requested page at ${req.url} was not found on the server.`;
      next(err);
    }
  });
}

// Serve static resources from the public folder, if they exist
app.use(express.static("public"));

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status).send(err.message);
});

app.listen(8000);
console.log("Server running at http://localhost:8000");
