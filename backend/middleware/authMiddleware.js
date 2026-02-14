import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // if token is not provided
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// middleware to check if user is a company
export const isCompany = (req, res, next) => {
  if (req.user && req.user.role === "company") {
    next();
  } else {
    res.status(403).json({ message: "Only companies can perform this action" });
  }
};
