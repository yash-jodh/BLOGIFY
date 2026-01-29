const { Router } = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

/* ================================
   ✅ CLOUDINARY CONFIG
================================ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================================
   ✅ MULTER (MEMORY STORAGE)
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
});

/* ================================
   ADD BLOG PAGE
================================ */
router.get("/add-new", (req, res) => {
  res.render("addBlog", { user: req.user });
});

/* ================================
   SINGLE BLOG PAGE
================================ */
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );

  res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

/* ================================
   ADD COMMENT
================================ */
router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });

  res.redirect(`/blog/${req.params.blogId}`);
});

/* ================================
   ✅ CREATE BLOG (CLOUDINARY)
================================ */
router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  let imageURL = "/images/default.png";
  let imagePublicId = null;

  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "blogify" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    imageURL = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: imageURL,
    coverImagePublicId: imagePublicId, // ✅ IMPORTANT
  });

  res.redirect("/");
});

/* ================================
   ✅ DELETE BLOG
================================ */
router.post("/delete/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) return res.status(404).send("Blog not found");

  // ✅ Only owner can delete
  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("Unauthorized");
  }

  // ✅ Delete image from Cloudinary
  if (blog.coverImagePublicId) {
    await cloudinary.uploader.destroy(blog.coverImagePublicId);
  }

  // ✅ Delete blog from DB
  await Blog.findByIdAndDelete(req.params.id);

  res.redirect("/");
});

module.exports = router;
