require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { checkForAuthenticationCookie } = require("./middlewares/auth");
const Blog = require("./models/blog");

const app = express();
const PORT = process.env.PORT || 8000;

/* -------- MongoDB Safe Connection (Vercel + Local) -------- */
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected (index)");
  } catch (err) {
    console.error("MongoDB error:", err);
    throw err;
  }
};

/* ------------------ View Engine ------------------ */
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

/* ------------------ Middlewares ------------------ */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

/* ------------------ Routes ------------------ */
app.get("/", async (req, res) => {
  try {
    await connectDB();

    const allblogs = await Blog.find({});
    res.render("home", {
      user: req.user || null,
      blogs: allblogs,
    });
  } catch (err) {
    console.error("Home route error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

/* ------------------ Server ------------------ */
app.listen(PORT, () => {
  console.log(`Server started at PORT:${PORT}`);
});
