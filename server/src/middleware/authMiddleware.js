import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401);
    next(new Error("Authentication required."));
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "interview_prep_ai_fallback_secret_key_change_in_prod";
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      res.status(401);
      next(new Error("User not found."));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Invalid or expired token."));
  }
}
