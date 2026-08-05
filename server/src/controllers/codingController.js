import CodingExercise from "../models/CodingExercise.js";
import { executeCode } from "../services/codingExecutionService.js";
import { analyzeComplexity, generateHint } from "../services/codingAIService.js";

export async function getExercises(req, res, next) {
  try {
    const { role, difficulty } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const exercises = await CodingExercise.find(query).sort({ createdAt: 1 });
    res.json({ exercises });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/coding/execute
 * Run candidate code against the exercise test cases via Piston API.
 */
export async function runCode(req, res, next) {
  try {
    const { code, language = "javascript", exerciseId } = req.body;

    if (!code || !exerciseId) {
      res.status(400);
      throw new Error("code and exerciseId are required.");
    }

    const exercise = await CodingExercise.findById(exerciseId);

    if (!exercise) {
      res.status(404);
      throw new Error("Exercise not found.");
    }

    const results = await executeCode({
      code,
      language,
      functionName: exercise.functionName,
      testCases: exercise.testCases
    });

    const passedCount = results.filter((r) => r.passed).length;

    res.json({
      results,
      summary: {
        total: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
        allPassed: passedCount === results.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/coding/hint
 * Get a progressive contextual AI hint for a coding exercise.
 */
export async function getHint(req, res, next) {
  try {
    const { code, language = "javascript", exerciseId, hintIndex = 0 } = req.body;

    if (!exerciseId) {
      res.status(400);
      throw new Error("exerciseId is required.");
    }

    const exercise = await CodingExercise.findById(exerciseId);

    if (!exercise) {
      res.status(404);
      throw new Error("Exercise not found.");
    }

    const hint = await generateHint({
      prompt: exercise.prompt,
      code: code || "",
      language,
      hintIndex: Number(hintIndex)
    });

    res.json({ hint, maxHints: 3 });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/coding/complexity
 * Analyze the time and space complexity of submitted code via Gemini.
 */
export async function getComplexity(req, res, next) {
  try {
    const { code, language = "javascript", exerciseId } = req.body;

    if (!code) {
      res.status(400);
      throw new Error("code is required.");
    }

    let prompt = "";

    if (exerciseId) {
      const exercise = await CodingExercise.findById(exerciseId);
      if (exercise) {
        prompt = exercise.prompt;
      }
    }

    const analysis = await analyzeComplexity({ code, language, prompt });

    res.json({ analysis });
  } catch (error) {
    next(error);
  }
}
