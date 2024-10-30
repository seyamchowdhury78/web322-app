/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Seyam Chowdhury
Student ID: 116805227
Date: 30/10/24
Replit Web App URL: https://replit.com/@schowdhury78/web322-app?v=1
GitHub Repository URL: https://github.com/seyamchowdhury78/web322-app

********************************************************************************/

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

const storeService = require("./store-service");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.listen(PORT, () => {
  console.log(`Express http server listening on port ${PORT}`);
});

app.get("/items/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addItem.html"));
});

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: "dshdzqvuc",
  api_key: "237179616144659",
  api_secret: "F-Bg8AKs2_WEwqzJSy6xqzOm9yA",
  secure: true,
});

const upload = multer();

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
