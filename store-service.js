const Sequelize = require("sequelize");

// Setup Sequelize connection
const sequelize = new Sequelize("web322", "user", "password", {
  host: "host",
  dialect: "postgres",
  port: 5432,
  dialectOptions: { ssl: { rejectUnauthorized: false } },
  query: { raw: true },
});

// Define Models
const Item = sequelize.define("Item", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE,
});

const Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

Item.belongsTo(Category, { foreignKey: "category" });

module.exports = {
  initialize() {
    return new Promise((resolve, reject) => {
      sequelize
        .sync()
        .then(() => resolve("Database synced"))
        .catch((err) => reject("Unable to sync the database: " + err));
    });
  },

  getAllItems() {
    return new Promise((resolve, reject) => {
      Item.findAll()
        .then((data) => resolve(data))
        .catch(() => reject("No results returned"));
    });
  },

  getPublishedItems() {
    return new Promise((resolve, reject) => {
      Item.findAll({ where: { published: true } })
        .then((data) => resolve(data))
        .catch(() => reject("No results returned"));
    });
  },

  getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
      Item.findAll({ where: { published: true, category } })
        .then((data) => resolve(data))
        .catch(() => reject("No results returned"));
    });
  },

  getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
      Item.findAll({ where: { category } })
        .then((data) => resolve(data))
        .catch(() => reject("No results returned"));
    });
  },

  getItemsByMinDate(minDateStr) {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
      Item.findAll({ where: { postDate: { [gte]: new Date(minDateStr) } } })
        .then((data) => resolve(data))
        .catch(() => reject("No results returned"));
    });
  },

  getItemById(id) {
    return new Promise((resolve, reject) => {
      Item.findByPk(id)
        .then((data) => resolve(data))
        .catch(() => reject("No results returned"));
    });
  },

  addItem(itemData) {
    return new Promise((resolve, reject) => {
      itemData.published = !!itemData.published;
      itemData.postDate = new Date();
      for (const prop in itemData) {
        if (itemData[prop] === "") itemData[prop] = null;
      }

      Item.create(itemData)
        .then(() => resolve("Item created successfully"))
        .catch(() => reject("Unable to create item"));
    });
  },

  getCategories() {
    return new Promise((resolve, reject) => {
      Category.findAll()
        .then((data) => resolve(data))
        .catch(() => reject("No results returned"));
    });
  },

  addCategory(categoryData) {
    return new Promise((resolve, reject) => {
      for (const prop in categoryData) {
        if (categoryData[prop] === "") categoryData[prop] = null;
      }

      Category.create(categoryData)
        .then(() => resolve("Category created successfully"))
        .catch(() => reject("Unable to create category"));
    });
  },

  deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
      Category.destroy({ where: { id } })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) resolve("Category deleted");
          else reject("No category found to delete");
        })
        .catch(() => reject("Unable to delete category"));
    });
  },

  deleteItemById(id) {
    return new Promise((resolve, reject) => {
      Item.destroy({ where: { id } })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) resolve("Item deleted");
          else reject("No item found to delete");
        })
        .catch(() => reject("Unable to delete item"));
    });
  },
};
