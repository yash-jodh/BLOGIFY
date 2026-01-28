const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

/* ✅ MULTER CONFIG */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("./public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ADD BLOG PAGE */
router.get("/add-new", (req, res) => {
  res.render("addBlog", { user: req.user });
});

/* SINGLE BLOG PAGE */
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id })
    .populate("createdBy");

  res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

/* ADD COMMENT */
router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });

  res.redirect(`/blog/${req.params.blogId}`);
});

/* ✅ CREATE BLOG (IMAGE FIX HERE) */
router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: req.file
      ? `/uploads/${req.file.filename}`
      : "/images/default.png",
  });

  res.redirect("/");
});

module.exports = router;
