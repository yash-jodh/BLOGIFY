const { Router } = require("express");
const multer = require("multer");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const connectDB = require("./db");

const router = Router();

/**
 * IMPORTANT:
 * Use memoryStorage for Vercel
 */
const upload = multer({
  storage: multer.memoryStorage(),
});

// ADD BLOG PAGE
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

// BLOG DETAILS
router.get("/:id", async (req, res) => {
  try {
    await connectDB();

    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({
      blogId: req.params.id,
    }).populate("createdBy");

    return res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// ADD COMMENT
router.post("/comment/:blogId", async (req, res) => {
  try {
    await connectDB();

    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user?._id,
    });

    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// CREATE BLOG
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    await connectDB();

    if (!req.body) {
      return res.status(400).send("Form data missing");
    }

    const { title, body } = req.body;

    await Blog.create({
      title,
      body,
      createdBy: req.user?._id,
      coverImageURL: "/default.png", // serverless-safe
    });

    return res.redirect("/");
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
