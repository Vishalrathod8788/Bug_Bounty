import Submission from "../models/Submission.js";
import Bug from "../models/Bug.js";
import User from "../models/User.js";

// Submit Solution (Only for Developers/Users)
export const submitSolution = async (req, res) => {
  try {
    const { bug_id, solution_description, proof_link } = req.body;

    // Create submission
    const newSubmission = await Submission.create({
      bug_id: bug_id,
      submitted_by: req.user._id,
      solution_description: solution_description,
      proof_link: proof_link,
    });

    //Update bug status to "in_review"
    const bug = await Bug.findById(bug_id);
    if (bug && bug.status === "open") {
      bug.status = "in_review";
      await bug.save();
    }

    res.status(201).json({
      message: "Solution submitted successfully!",
      newSubmission,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting solution" });
  }
};

// Get Submissions for a Bug
export const getSubmissionsForBug = async (req, res) => {
  try {
    const { bugId } = req.params;

    const submissions = await Submission.find({ bug_id: bugId })
      .populate("submitted_by", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions" });
  }
};

// Approve Submission (Only for Company/Bug Creator)
export const approveSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    const bug = await Bug.findById(submission.bug_id);

    if (bug.posted_by.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to approve this" });
    }

    if (bug.status === "closed") {
      return res.status(400).json({ message: "Bug is already closed" });
    }

    // Update submission status
    submission.status = "approved";
    await submission.save();

    // Update bug status to "closed"
    bug.status = "closed";
    bug.winner = submission.submitted_by;
    await bug.save();

    // bounty amount add in developer balance
    const developer = await User.findById(submission.submitted_by);
    developer.balance = developer.balance + bug.bounty_amount;
    await developer.save();

    // bounty amount minus in company balance
    const company = await User.findById(req.user._id);
    company.balance = company.balance - bug.bounty_amount;
    await company.save();

    res.json({ message: "Winner approved and reward sent!", bug });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving submission", error: error.message });
  }
};

// Reject Submission (Only for Company/Bug Creator)
export const rejectSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    const bug = await Bug.findById(submission.bug_id);

    if (bug.posted_by.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to reject this" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Submission already processed" });
    }

    // Update status to rejected
    submission.status = "rejected";
    await submission.save();

    // Check if all submissions are rejected
    const allSubmissions = await Submission.find({ bug_id: bug._id });
    const allRejected = allSubmissions.every(
      (sub) => sub.status === "rejected",
    );

    // If all rejected, set status back to 'open'
    if (allRejected && bug.status === "in_review") {
      bug.status = "open";
      await bug.save();
    }

    res.json({ message: "Submission rejected", submission });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting submission", error: error.message });
  }
};
