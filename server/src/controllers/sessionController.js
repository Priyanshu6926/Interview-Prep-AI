import Session from "../models/Session.js";
import {
  evaluateReadiness,
  generateInterviewQuestions,
  streamQuestionExplanation
} from "../services/geminiService.js";
import { analyzeResumeMatch, parseResume } from "../services/resumeService.js";

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

    const resumeAnalysis = resumeProfile
      ? await analyzeResumeMatch({
          resumeProfile,
          role,
          experience: normalizedExperience,
          focusAreas: normalizedFocusAreas
        })
      : null;

    const session = await Session.create({
      user: req.user._id,
      role,
      experience: normalizedExperience,
      focusAreas: normalizedFocusAreas,
      resumeProfile,
      resumeAnalysis,
      questions
    });

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
}

export async function analyzeSessionResume(req, res, next) {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id });

    if (!session) {
      res.status(404);
      throw new Error("Session not found.");
    }

    if (!session.resumeProfile?.summary) {
      res.status(400);
      throw new Error("No resume uploaded for this session.");
    }

    const resumeAnalysis = await analyzeResumeMatch({
      resumeProfile: session.resumeProfile,
      role: session.role,
      experience: session.experience,
      focusAreas: session.focusAreas
    });

    session.resumeAnalysis = resumeAnalysis;
    await session.save();

    res.json({ resumeAnalysis, session });
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

    const submittedAnswer = req.body.answer || question.userAnswer;
    if (!submittedAnswer || !submittedAnswer.trim()) {
      res.status(400);
      throw new Error("An answer is required before running evaluation.");
    }

    const evaluation = await evaluateReadiness({
      question: question.question,
      answer: submittedAnswer.trim(),
      role: session.role,
      referenceAnswer: question.answer
    });

    question.userAnswer = submittedAnswer.trim();
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
      answer: submittedAnswer.trim(),
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

export async function getUserAnalytics(req, res, next) {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: 1 });

    const totalSessions = sessions.length;
    let totalQuestions = 0;
    let totalPinned = 0;
    const allAttempts = [];
    const roleStats = {};

    let techAccuracySum = 0;
    let techAccuracyCount = 0;
    let commClaritySum = 0;
    let commClarityCount = 0;
    let probSolvingSum = 0;
    let probSolvingCount = 0;
    let completenessSum = 0;
    let completenessCount = 0;

    const pinnedQuestions = [];

    sessions.forEach((session) => {
      if (!roleStats[session.role]) {
        roleStats[session.role] = { count: 0, scores: [] };
      }
      roleStats[session.role].count += 1;

      session.questions.forEach((q) => {
        totalQuestions += 1;
        if (q.isPinned) {
          totalPinned += 1;
          pinnedQuestions.push({
            sessionId: session._id,
            role: session.role,
            questionId: q._id,
            title: q.title || q.question.slice(0, 60),
            question: q.question,
            difficulty: q.difficulty,
            score: q.lastEvaluation?.overallScore ?? q.lastEvaluation?.score ?? null
          });
        }

        (q.attempts || []).forEach((attempt) => {
          const score = attempt.overallScore ?? attempt.score ?? 0;
          if (score > 0) {
            allAttempts.push({
              date: attempt.createdAt,
              score,
              role: session.role,
              questionTitle: q.title || q.question.slice(0, 45) + "..."
            });
            roleStats[session.role].scores.push(score);

            if (attempt.scoreBreakdown) {
              if (typeof attempt.scoreBreakdown.technicalAccuracy === "number") {
                techAccuracySum += attempt.scoreBreakdown.technicalAccuracy;
                techAccuracyCount += 1;
              }
              if (typeof attempt.scoreBreakdown.communicationClarity === "number") {
                commClaritySum += attempt.scoreBreakdown.communicationClarity;
                commClarityCount += 1;
              }
              if (typeof attempt.scoreBreakdown.problemSolvingStructure === "number") {
                probSolvingSum += attempt.scoreBreakdown.problemSolvingStructure;
                probSolvingCount += 1;
              }
              if (typeof attempt.scoreBreakdown.completeness === "number") {
                completenessSum += attempt.scoreBreakdown.completeness;
                completenessCount += 1;
              }
            }
          }
        });
      });
    });

    const allScores = allAttempts.map((a) => a.score);
    const averageScore = allScores.length
      ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
      : null;
    const bestScore = allScores.length ? Math.max(...allScores) : null;

    const breakdownAverages = {
      technicalAccuracy: techAccuracyCount ? Math.round(techAccuracySum / techAccuracyCount) : null,
      communicationClarity: commClarityCount ? Math.round(commClaritySum / commClarityCount) : null,
      problemSolvingStructure: probSolvingCount ? Math.round(probSolvingSum / probSolvingCount) : null,
      completeness: completenessCount ? Math.round(completenessSum / completenessCount) : null
    };

    const rolesSummary = Object.entries(roleStats).map(([role, data]) => {
      const avg = data.scores.length
        ? Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length)
        : null;
      return {
        role,
        sessionCount: data.count,
        attemptCount: data.scores.length,
        averageScore: avg
      };
    });

    res.json({
      summary: {
        totalSessions,
        totalQuestions,
        totalAttempts: allAttempts.length,
        totalPinned,
        averageScore,
        bestScore
      },
      breakdownAverages,
      rolesSummary,
      scoreHistory: allAttempts.slice(-25), // most recent 25 attempts
      pinnedQuestions: pinnedQuestions.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
}
