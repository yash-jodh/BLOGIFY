const { Router } = require("express");
const multer = require("multer");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const connectDB = require("../config/db");

const router = Router();

// memory storage (Vercel safe)
const upload = multer({ storage: multer.memoryStorage() });

// ADD BLOG PAGE
router.get("/add-new", (req, res) => {
  res.render("addBlog", { user: req.user });
});

// BLOG DETAILS
router.get("/:id", async (req, res) => {
  try {
    await connectDB();

    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");

    res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// CREATE BLOG
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    await connectDB();

    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).send("Missing fields");
    }

    await Blog.create({
      title,
      body,
      createdBy: req.user?._id,
      coverImageURL: "/default.png",
    });

    res.redirect("/");
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
