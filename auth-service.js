const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const mongoURI =
    "mongodb+srv://schowdhury78:p0kk3mnAsS6YBxpp@cluster0.8gedi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  
    
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  loginHistory: [
    {
      dateTime: {
        type: Date,
        default: Date.now,
      },
      userAgent: {
        type: String,
      },
    },
  ],
});

let User;

module.exports = {
  initialize: async () => {
    try {
      const db = mongoose.createConnection(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      db.on("error", (err) => {
        throw new Error("MongoDB connection error: " + err);
      });
      db.once("open", () => {
        User = db.model("users", userSchema);
        console.log("MongoDB connection successful.");
      });
    } catch (err) {
      throw new Error("Failed to connect to MongoDB: " + err);
    }
  },

  registerUser: async (userData) => {
    if (userData.password !== userData.password2) {
      throw new Error("Passwords do not match.");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    const newUser = new User({
      userName: userData.userName,
      password: userData.password,
      email: userData.email,
      loginHistory: [],
    });

    try {
      await newUser.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new Error("User name is already taken.");
      } else {
        throw new Error("Failed to create a user: " + err);
      }
    }
  },


  checkUser: async (userData) => {
    const user = await User.findOne({ userName: userData.userName });
    if (!user) {
      throw new Error("User cannot be found: " + userData.userName);
    }

    const isPasswordValid = await bcrypt.compare(
      userData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Incorrect password for user: " + userData.userName);
    }

    user.loginHistory.push({
      dateTime: new Date(),
      userAgent: userData.userAgent,
    });

    try {
      await user.save();
      return user;
    } catch (err) {
      throw new Error("Failed to update login history: " + err);
    }
  },
};
