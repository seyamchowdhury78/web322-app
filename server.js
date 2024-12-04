/*********************************************************************************

WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Seyam Chowdhury
Student ID: 116805227
Date: 4/12/24
Replit Web App URL: https://replit.com/@schowdhury78/web322-app
GitHub Repository URL: https://github.com/seyamchowdhury78/web322-app

********************************************************************************/

// Import the required modules
const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const Sequelize = require("sequelize");
const storeService = require("./store-service");

cloudinary.config({
  cloud_name: "dshdzqvuc",
  api_key: "237179616144659",
  api_secret: "F-Bg8AKs2_WEwqzJSy6xqzOm9yA",
  secure: true,
});

const app = express();
const upload = multer();
const PORT = process.env.PORT || 8080;

// Handlebars Helpers
const hbsHelpers = {
  navLink: function (url, options) {
    const className =
      url === app.locals.activeRoute ? "nav-link active" : "nav-link";
    return `<li class="nav-item"><a class="${className}" href="${url}">${options.fn(
      this
    )}</a></li>`;
  },
  equal: function (lvalue, rvalue, options) {
    return lvalue === rvalue ? options.fn(this) : options.inverse(this);
  },
  safeHTML: function (context) {
    return new Handlebars.SafeString(context);
  },
  formatDate: function (dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    let day = dateObj.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
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

// Configure Handlebars
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: hbsHelpers,
  })
);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => res.redirect("/shop"));

app.get("/shop", async (req, res) => {
  try {
    const items = req.query.category
      ? await storeService.getPublishedItemsByCategory(req.query.category)
      : await storeService.getPublishedItems();
    const categories = await storeService.getCategories();
    res.render("shop", { data: { items, categories } });
  } catch (err) {
    res.render("shop", { data: { message: "No results" } });
  }
});

// Category Management
app.get("/categories", async (req, res) => {
  try {
    const categories = await storeService.getCategories();
    res.render("categories", { categories });
  } catch (err) {
    res.render("categories", { message: "No categories found" });
  }
});

app.get("/categories/add", (req, res) => res.render("addCategory"));

app.post("/categories/add", async (req, res) => {
  try {
    await storeService.addCategory(req.body);
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Unable to add category");
  }
});

app.get("/categories/delete/:id", async (req, res) => {
  try {
    await storeService.deleteCategoryById(req.params.id);
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Unable to delete category");
  }
});

// Items Management
app.get("/items", async (req, res) => {
  try {
    const items = await storeService.getAllItems();
    res.render("items", { items });
  } catch (err) {
    res.render("items", { message: "No items found" });
  }
});

app.get("/items/add", async (req, res) => {
  try {
    const categories = await storeService.getCategories();
    res.render("addItem", { categories });
  } catch (err) {
    res.render("addItem", { categories: [] });
  }
});

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload_stream(
        (error, result) => {
          if (result) imageUrl = result.url;
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadResult);
    }
    req.body.featureImage = imageUrl;
    await storeService.addItem(req.body);
    res.redirect("/items");
  } catch (err) {
    res.status(500).send("Unable to add item");
  }
});

app.get("/items/delete/:id", async (req, res) => {
  try {
    await storeService.deleteItemById(req.params.id);
    res.redirect("/items");
  } catch (err) {
    res.status(500).send("Unable to delete item");
  }
});

// Start the server
storeService
  .initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Initialization failed:", err));
