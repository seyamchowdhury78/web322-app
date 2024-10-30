const fs = require("fs");
let items = [];
let categories = [];

module.exports = {
  initialize() {
    return new Promise((resolve, reject) => {
      fs.readFile("./data/items.json", "utf8", (err, data) => {
        if (err) {
          reject("unable to read file");
        } else {
          items = JSON.parse(data);
          fs.readFile("./data/categories.json", "utf8", (err, data) => {
            if (err) {
              reject("unable to read file");
            } else {
              categories = JSON.parse(data);
              resolve();
            }
          });
        }
      });
    });
  },

  getAllItems() {
    return new Promise((resolve, reject) => {
      if (items.length > 0) {
        resolve(items);
      } else {
        reject("no results returned");
      }
    });
  },

  getPublishedItems() {
    return new Promise((resolve, reject) => {
      const publishedItems = items.filter((item) => item.published === true);
      if (publishedItems.length > 0) {
        resolve(publishedItems);
      } else {
        reject("no results returned");
      }
    });
  },

  getCategories() {
    return new Promise((resolve, reject) => {
      if (categories.length > 0) {
        resolve(categories);
      } else {
        reject("no results returned");
      }
    });
  },
  getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
      const itemsByCategory = items.filter((item) => item.category == category);
      if (itemsByCategory.length > 0) resolve(itemsByCategory);
      else reject("no results returned");
    });
  },
  getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
      const minDate = new Date(minDateStr);
      const itemsByDate = items.filter(
        (item) => new Date(item.postDate) >= minDate
      );
      if (itemsByDate.length > 0) resolve(itemsByDate);
      else reject("no results returned");
    });
  },
  getItemById(id) {
    return new Promise((resolve, reject) => {
      const item = items.find((item) => item.id == id);
      if (item) resolve(item);
      else reject("no result returned");
    });
  },
  addItem(itemData) {
    return new Promise((resolve) => {
      itemData.published = itemData.published || false;
      itemData.id = items.length + 1;
      items.push(itemData);
      resolve(itemData);
    });
  },
};
