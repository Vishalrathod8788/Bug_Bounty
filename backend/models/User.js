import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // every email should be unique in the database
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // for security reasons
    },
    role: {
      type: String,
      enum: ["company", "developer"], // only these two roles allowed
      default: "developer",
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
