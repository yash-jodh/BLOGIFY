const { Schema, model, models } = require("mongoose");

const commentSchema = new Schema(
  {
    content: String,
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = models.Comment || model("Comment", commentSchema);
