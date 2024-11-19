/*********************************************************************************

WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Seyam Chowdhury
Student ID: 116805227
Date: 19/11/24
Replit Web App URL: https://replit.com/@schowdhury78/web322-app
GitHub Repository URL: https://github.com/seyamchowdhury78/web322-app

********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const storeService = require("./store-service");

const handlebars = require("handlebars");

handlebars.registerHelper("navLink", function (url, options) {
  const { activeRoute } = options.data.root.app.locals;
  const className = url === activeRoute ? "active" : "";
  return `<li class="${className}"><a href="${url}">${options.fn(this)}</a></li>`;
});

handlebars.registerHelper("equals", function (lvalue, rvalue, options) {
  if (arguments.length < 3) {
    throw new Error("Handlebars Helper equal needs 2 parameters");
  }
  return lvalue === rvalue ? options.fn(this) : options.inverse(this);
});

const app = express();
const PORT = process.env.PORT || 8080;

// Configure express-handlebars
app.engine(".hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");

// Configure static folder
app.use(express.static("public"));

// Cloudinary configuration
cloudinary.config({
  cloud_name: "dshdzqvuc",
  api_key: "237179616144659",
  api_secret: "F-Bg8AKs2_WEwqzJSy6xqzOm9yA",
  secure: true,
});

// Multer upload middleware
const upload = multer();

// Middleware to set active route and viewing category
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/items/add", (req, res) => {
  res.render("additem"); // Render the additem.hbs view
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processItem(uploaded.url);
      })
      .catch((error) => {
        console.log("Image upload failed: ", error);
        processItem("");
      });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    req.body.published = req.body.published ? true : false;

    storeService
      .addItem(req.body)
      .then(() => res.redirect("/items"))
      .catch((err) => res.status(500).send("Unable to add item"));
  }
});

app.get("/items", (req, res) => {
  if (req.query.category) {
    storeService
      .getItemsByCategory(req.query.category)
      .then((items) => res.json(items))
      .catch((err) => res.status(404).send(err));
  } else if (req.query.minDate) {
    storeService
      .getItemsByMinDate(req.query.minDate)
      .then((items) => res.json(items))
      .catch((err) => res.status(404).send(err));
  } else {
    storeService
      .getAllItems()
      .then((items) => res.json(items))
      .catch((err) => res.status(404).send(err));
  }
});

app.get("/item/:id", (req, res) => {
  storeService
    .getItemById(req.params.id)
    .then((item) => res.json(item))
    .catch((err) => res.status(404).send(err));
});

// Start server
app.listen(PORT, () => {
  console.log(`Express http server listening on port ${PORT}`);
});
