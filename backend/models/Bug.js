import mongoose from "mongoose";

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bounty_amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_review", "closed"],
      default: "open",
    },
    posted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Company that posted the bug
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Developer who won the bounty
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Bug = mongoose.model("Bug", bugSchema);
export default Bug;
