import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { aiRateLimit } from "../middleware/rateLimitMiddleware.js";
import {
  analyzeSessionResume,
  createSession,
  deleteSession,
  evaluateQuestion,
  explainQuestion,
  generateMoreQuestions,
  getSessionById,
  getSessions,
  getUserAnalytics,
  togglePin
} from "../controllers/sessionController.js";

const router = Router();

router.use(protect);

router.get("/", getSessions);
router.get("/analytics", getUserAnalytics);
router.post("/", aiRateLimit, upload.single("resume"), createSession);
router.get("/:sessionId", getSessionById);
router.delete("/:sessionId", deleteSession);
router.post("/:sessionId/analyze-resume", aiRateLimit, analyzeSessionResume);
router.post("/:sessionId/questions/generate-more", aiRateLimit, generateMoreQuestions);
router.patch("/:sessionId/questions/:questionId/pin", togglePin);
router.post("/:sessionId/questions/:questionId/explain", aiRateLimit, explainQuestion);
router.post("/:sessionId/questions/:questionId/evaluate", aiRateLimit, evaluateQuestion);

export default router;
