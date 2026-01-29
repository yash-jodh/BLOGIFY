const { Schema, model, models } = require("mongoose");

const blogSchema = new Schema(
  {
    title: String,
    body: String,
    coverImageURL: {
      type: String,
      default: "/Images/default.png",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = models.Blog || model("Blog", blogSchema);
