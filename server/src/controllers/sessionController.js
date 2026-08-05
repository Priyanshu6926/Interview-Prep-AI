import Session from "../models/Session.js";
import {
  evaluateReadiness,
  generateInterviewQuestions,
  streamQuestionExplanation
} from "../services/geminiService.js";
import { parseResume } from "../services/resumeService.js";

export async function createSession(req, res, next) {
  try {
    const { role, experience, focusAreas = [] } = req.body;
    const normalizedExperience = Number(experience);

    if (!role || Number.isNaN(normalizedExperience)) {
      res.status(400);
      throw new Error("Role and experience are required.");
    }

    const resumeProfile = req.file ? await parseResume(req.file) : null;
    const normalizedFocusAreas = Array.isArray(focusAreas)
      ? focusAreas
      : String(focusAreas || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const questions = await generateInterviewQuestions({
      role,
      experience: normalizedExperience,
      focusAreas: normalizedFocusAreas,
      count: 5,
      existingQuestions: [],
      resumeProfile
    });

    const session = await Session.create({
      user: req.user._id,
      role,
      experience: normalizedExperience,
      focusAreas: normalizedFocusAreas,
      resumeProfile,
      questions
    });

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
}

export async function generateMoreQuestions(req, res, next) {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id });

    if (!session) {
      res.status(404);
      throw new Error("Session not found.");
    }

    const count = Number(req.body.count) || 5;
    const newQuestions = await generateInterviewQuestions({
      role: session.role,
      experience: session.experience,
      focusAreas: session.focusAreas,
      count,
      existingQuestions: session.questions.map((item) => item.question),
      resumeProfile: session.resumeProfile
    });

    session.questions.push(...newQuestions);
    await session.save();

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
}

export async function getSessions(req, res, next) {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
}

export async function getSessionById(req, res, next) {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id });

    if (!session) {
      res.status(404);
      throw new Error("Session not found.");
    }

    res.json({ session });
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.sessionId, user: req.user._id });

    if (!session) {
      res.status(404);
      throw new Error("Session not found.");
    }

    res.json({ message: "Session deleted successfully." });
  } catch (error) {
    next(error);
  }
}

export async function togglePin(req, res, next) {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id });

    if (!session) {
      res.status(404);
      throw new Error("Session not found.");
    }

    const question = session.questions.id(req.params.questionId);
    if (!question) {
      res.status(404);
      throw new Error("Question not found.");
    }

    question.isPinned = !question.isPinned;
    await session.save();

    res.json({ session });
  } catch (error) {
    next(error);
  }
}

export async function explainQuestion(req, res, next) {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id });

    if (!session) {
      res.status(404);
      throw new Error("Session not found.");
    }

    const question = session.questions.id(req.params.questionId);
    if (!question) {
      res.status(404);
      throw new Error("Question not found.");
    }

    // Stream explanation to client via SSE, then save the full text to MongoDB
    const fullExplanation = await streamQuestionExplanation(question, session.role, res);
    question.explanation = fullExplanation;
    await session.save();
    // Response is already ended by streamQuestionExplanation — do not call res.json()
  } catch (error) {
    // If headers haven't been sent yet (early errors), delegate to error middleware
    if (!res.headersSent) {
      next(error);
    } else {
      // Stream already started — try to send an error event then close
      try { res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`); res.end(); } catch {}
    }
  }
}

export async function evaluateQuestion(req, res, next) {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id });

    if (!session) {
      res.status(404);
      throw new Error("Session not found.");
    }

    const question = session.questions.id(req.params.questionId);
    if (!question) {
      res.status(404);
      throw new Error("Question not found.");
    }

    const submittedAnswer = req.body.answer || question.userAnswer || question.answer;

    const evaluation = await evaluateReadiness({
      question: question.question,
      answer: submittedAnswer,
      role: session.role,
      referenceAnswer: question.answer
    });

    question.userAnswer = submittedAnswer;
    question.lastEvaluation = {
      score: evaluation.score,
      overallScore: evaluation.overallScore,
      scoreBreakdown: evaluation.scoreBreakdown || {},
      strengths: evaluation.strengths || [],
      missingPoints: evaluation.missingPoints || [],
      improvedAnswer: evaluation.improvedAnswer || "",
      feedback: evaluation.feedback
    };
    question.attempts.push({
      answer: submittedAnswer,
      score: evaluation.score,
      overallScore: evaluation.overallScore,
      scoreBreakdown: evaluation.scoreBreakdown || {},
      strengths: evaluation.strengths || [],
      missingPoints: evaluation.missingPoints || [],
      feedback: evaluation.feedback
    });
    await session.save();

    res.json({ evaluation, session });
  } catch (error) {
    next(error);
  }
}
