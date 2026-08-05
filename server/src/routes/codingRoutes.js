import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getComplexity, getExercises, getHint, runCode } from "../controllers/codingController.js";

const router = Router();

router.use(protect);

router.get("/exercises", getExercises);
router.post("/execute", runCode);
router.post("/hint", getHint);
router.post("/complexity", getComplexity);

export default router;
