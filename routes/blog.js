const { Router } = require("express");
const mongoose = require("mongoose");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

/* ------------------ Safe MongoDB Connect ------------------ */
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected (blog routes)");
  } catch (err) {
    console.error("MongoDB error (blog routes):", err);
    throw err;
  }
};

/* ------------------ ADD BLOG PAGE ------------------ */
router.get("/add-new", async (req, res) => {
  try {
    await connectDB();
    return res.render("addBlog", {
      user: req.user || null,
    });
  } catch (err) {
    console.error("Add blog page error:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* ------------------ BLOG DETAILS ------------------ */
router.get("/:id", async (req, res) => {
  try {
    await connectDB();

    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({
      blogId: req.params.id,
    }).populate("createdBy");

    if (!blog) return res.status(404).send("Blog not found");

    return res.render("blog", {
      user: req.user || null,
      blog,
      comments,
    });
  } catch (err) {
    console.error("Blog detail error:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* ------------------ ADD COMMENT ------------------ */
router.post("/comment/:blogId", async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/signin");

    await connectDB();

    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });

    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* ------------------ CREATE BLOG ------------------ */
router.post("/", async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/signin");

    await connectDB();

    const { title, body } = req.body;

    await Blog.create({
      title,
      body,
      createdBy: req.user._id,
    });

    return res.redirect("/");
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
