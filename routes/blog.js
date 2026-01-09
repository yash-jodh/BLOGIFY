const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ADD BLOG PAGE
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
    console.log("blog",blog);
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    });
 });

 router.post("/comment/:blogId", async (req,res) => {
    await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
 })

// CREATE BLOG → redirect to HOME
router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });

  return res.redirect("/");  
});

// REDIRECT BLOG DETAILS TO HOME
// router.get("/:id", (req, res) => {
//   return res.redirect("/");  
// });

module.exports = router;
