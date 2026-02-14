import Bug from "../models/Bug.js";
import User from "../models/User.js";

export const createBug = async (req, res) => {
  const { title, description, bounty_amount } = req.body;

  try {
    // check company balance
    const user = await User.findById(req.user._id);

    if (user.balance < bounty_amount) {
      return res.status(400).json({
        message: `Insufficient balance! your balance is ₹${user.balance}, and your bounty is ₹${bounty_amount}.`,
      });
    }

    // if balance is sufficient, create the bug
    const bug = await Bug.create({
      title,
      description,
      bounty_amount,
      posted_by: req.user._id,
    });

    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({
      message: "Error creating bug",
      error: error.message,
    });
  }
};

export const getBugs = async (req, res) => {
  try {
    const bugs = await Bug.find().populate("posted_by", "name email");
    res.json(bugs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bugs", error: error.message });
  }
};

export const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id).populate("posted_by", "name");

    if (bug) {
      res.json(bug);
    } else {
      res.status(404).json({ message: "Bug not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
