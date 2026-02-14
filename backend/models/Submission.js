import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    bug_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",
      required: true,
    },
    submitted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    solution_description: {
      type: String,
      required: true,
    },
    proof_link: {
      type: String, // e.g., GitHub repo
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
