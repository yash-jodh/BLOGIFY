require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const Blog = require("./models/blog");
const { checkForAuthenticationCookie } = require("./middlewares/auth");

const app = express();

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// MIDDLEWARE
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

// HOME ROUTE
app.get("/", async (req, res) => {
  try {
    await connectDB();

    const allblogs = await Blog.find({});
    res.render("home", {
      user: req.user,
      blogs: allblogs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTES
app.use("/user", userRoute);
app.use("/blog", blogRoute);

// ❗ IMPORTANT FOR VERCEL
module.exports = app;
