import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET || "interview_prep_ai_fallback_secret_key_change_in_prod";

export default function generateToken(userId) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}
