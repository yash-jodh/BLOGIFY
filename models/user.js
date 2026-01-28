const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/auth");


const userSchema = new Schema({
  fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(this.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found!");

  const userProvidedHashed = createHmac("sha256", user.salt)
    .update(password)   // ✅ FIX HERE
    .digest("hex");

  if (user.password !== userProvidedHashed) {
    throw new Error("Incorrect password");
  }

  const token = createTokenForUser(user);
  return token;

  // Remove sensitive fields
  // const userObj = user.toObject();
  // delete userObj.password;
  // delete userObj.salt;

  return userObj;
});


const User = model("User", userSchema);
module.exports = User;
