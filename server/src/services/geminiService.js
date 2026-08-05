import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import {
  ensureQuestionSetQuality,
  generateFallbackEvaluation,
  generateFallbackExplanation,
  generateFallbackQuestions
} from "../lib/fallbackQuestions.js";
import {
  buildCacheKey,
  getCachedQuestions,
  setCachedQuestions
} from "../lib/questionCache.js";

// ─── Schema Definitions ───────────────────────────────────────────────────────

const questionArraySchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING },
      question: { type: SchemaType.STRING },
      difficulty: { type: SchemaType.STRING },
      questionType: { type: SchemaType.STRING },
      answer: { type: SchemaType.STRING },
      explanation: { type: SchemaType.STRING },
      tags: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      }
    },
    required: ["title", "question", "difficulty", "questionType", "answer", "explanation", "tags"]
  }
};

const evaluationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    overallScore: { type: SchemaType.NUMBER },
    scoreBreakdown: {
      type: SchemaType.OBJECT,
      properties: {
        technicalAccuracy: { type: SchemaType.NUMBER },
        communicationClarity: { type: SchemaType.NUMBER },
        problemSolvingStructure: { type: SchemaType.NUMBER },
        completeness: { type: SchemaType.NUMBER }
      },
      required: ["technicalAccuracy", "communicationClarity", "problemSolvingStructure", "completeness"]
    },
    strengths: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    missingPoints: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    improvedAnswer: { type: SchemaType.STRING },
    feedback: { type: SchemaType.STRING }
  },
  required: ["overallScore", "scoreBreakdown", "strengths", "missingPoints", "improvedAnswer", "feedback"]
};

// ─── Model Factories ──────────────────────────────────────────────────────────

function getQuestionModel() {
  if (!process.env.GEMINI_API_KEY) return null;
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: questionArraySchema,
      temperature: 0.75
    }
  });
}

function getEvaluationModel() {
  if (!process.env.GEMINI_API_KEY) return null;
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: evaluationSchema,
      temperature: 0.4
    }
  });
}

function getExplanationModel() {
  if (!process.env.GEMINI_API_KEY) return null;
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.6
    }
  });
}

// ─── Difficulty Mapper ────────────────────────────────────────────────────────

function experienceToDifficultyHint(experience) {
  if (experience <= 1) return "Easy to Medium — suitable for junior candidates";
  if (experience <= 3) return "Medium — suitable for mid-level candidates";
  return "Medium to Hard — suitable for senior candidates";
}

// ─── Question Generation (with cache) ────────────────────────────────────────

export async function generateInterviewQuestions({
  role,
  experience,
  focusAreas,
  count = 5,
  existingQuestions = [],
  resumeProfile = null
}) {
  const model = getQuestionModel();

  if (!model) {
    return generateFallbackQuestions({ role, experience, focusAreas, count, existingQuestions, resumeProfile });
  }

  // Only cache when there is no resume and no existing questions to avoid
  // (resume sessions are always personalized; "generate more" extends an existing set)
  const isCacheable = !resumeProfile && existingQuestions.length === 0;
  const cacheKey = isCacheable ? buildCacheKey({ role, experience, focusAreas }) : null;

  if (cacheKey) {
    const cached = getCachedQuestions(cacheKey);
    if (cached) {
      // Return a fresh copy with reset user state (the cached version may have been mutated)
      return cached.map((item) => ({
        ...item,
        isPinned: false,
        userAnswer: "",
        lastEvaluation: { score: null, overallScore: null, scoreBreakdown: {}, strengths: [], missingPoints: [], improvedAnswer: "", feedback: "" }
      }));
    }
  }

  const difficultyHint = experienceToDifficultyHint(experience);

  const prompt = `
Generate exactly ${count} interview questions and complete reference answers for a ${role} with ${experience} years of experience.
Focus areas: ${focusAreas.join(", ")}.
Difficulty guidance: ${difficultyHint}.
Avoid repeating or paraphrasing these existing questions: ${existingQuestions.length ? existingQuestions.join(" | ") : "none"}.

Resume context:
${
  resumeProfile
    ? `Summary: ${resumeProfile.summary}\nSkills: ${resumeProfile.skills.join(", ")}\nProjects: ${resumeProfile.projects.join(" | ")}\nHighlights: ${resumeProfile.highlights.join(" | ")}`
    : "No resume uploaded. Generate general questions for the role and focus areas."
}

The set of ${count} questions must be diverse and must cover different interview angles:
- 1 fundamentals or core concept question
- 1 practical implementation question
- 1 debugging or troubleshooting scenario
- 1 tradeoff or comparison question
- 1 architecture, design, or project discussion question
(If count > 5, continue cycling through these angles.)

Each question must:
- Be unique and directly relevant to the role and focus areas
- Be phrased exactly like a real interviewer would ask it — not as a study prompt
- Differ in intent and angle from the others

For each question, set:
- "difficulty": one of "Easy", "Medium", or "Hard" (based on the difficulty guidance)
- "questionType": one of "Technical", "Behavioral", "System Design", or "Coding"
- "answer": an ideal candidate answer written as a complete interview response in 3 to 5 substantial paragraphs
- "explanation": a detailed teaching-style breakdown with multiple paragraphs and a code example in a fenced code block if useful
- "tags": 2 to 4 topic tags
`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    const normalized = parsed.map((item) => ({
      ...item,
      difficulty: item.difficulty || "Medium",
      questionType: item.questionType || "Technical",
      isPinned: false,
      userAnswer: "",
      lastEvaluation: {
        score: null,
        overallScore: null,
        scoreBreakdown: {},
        strengths: [],
        missingPoints: [],
        improvedAnswer: "",
        feedback: ""
      }
    }));
    const quality = ensureQuestionSetQuality(normalized, {
      role, experience, focusAreas, count, existingQuestions, resumeProfile
    });

    // Store in cache only for non-resume, non-"generate more" requests
    if (cacheKey) {
      setCachedQuestions(cacheKey, quality);
    }

    return quality;
  } catch {
    return generateFallbackQuestions({ role, experience, focusAreas, count, existingQuestions, resumeProfile });
  }
}

// ─── Question Explanation (SSE streaming) ────────────────────────────────────

/**
 * Streams the explanation for a question to an Express response via SSE.
 *
 * @param {object} question     - The question document
 * @param {string} role         - The interview role
 * @param {object} res          - Express response object (SSE mode)
 * @returns {Promise<string>}   - The full explanation text when streaming completes
 */
export async function streamQuestionExplanation(question, role, res) {
  const model = getExplanationModel();

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering if behind a proxy
  res.flushHeaders();

  const sendChunk = (text) => {
    // Escape newlines inside SSE data fields
    const escaped = text.replace(/\n/g, "\\n");
    res.write(`data: ${escaped}\n\n`);
  };

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  if (!model) {
    const fallback = generateFallbackExplanation(question);
    sendChunk(fallback);
    sendEvent("done", { explanation: fallback });
    res.end();
    return fallback;
  }

  const prompt = `
Explain this interview question for a ${role} candidate in a practical teaching style.
Question: ${question.question}
Reference answer: ${question.answer}

Write a detailed explanation that feels like a strong senior mentor walking the candidate through the topic.
The explanation should be richer than the reference answer and teach the topic in depth.

Required sections (use these as headings):
1. Core Idea
2. Why Interviewers Ask This
3. How to Build a Strong Answer
4. Common Mistakes
5. Practical Example

Rules:
- Be detailed and genuinely useful, not brief
- Use multiple paragraphs under each section
- If code helps explain the concept, include a short code example in a fenced code block
- Keep code focused and interview-relevant
- Use plain English and connect the explanation to the interview context
`;

  try {
    const streamResult = await model.generateContentStream(prompt);
    let fullText = "";

    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        sendChunk(chunkText);
      }
    }

    sendEvent("done", { explanation: fullText });
    res.end();
    return fullText;
  } catch {
    const fallback = generateFallbackExplanation(question);
    sendChunk(fallback);
    sendEvent("done", { explanation: fallback });
    res.end();
    return fallback;
  }
}

// ─── 4-Pillar Evaluation ──────────────────────────────────────────────────────

export async function evaluateReadiness({ question, answer, role, referenceAnswer }) {
  const model = getEvaluationModel();

  if (!model) {
    return generateFallbackEvaluation(answer, {});
  }

  const prompt = `
You are an expert technical interview coach evaluating a candidate's answer.

Role being interviewed for: ${role}
Interview Question: ${question}
Reference Answer (ideal): ${referenceAnswer}
Candidate's Answer: ${answer}

Score the candidate's answer strictly on what they actually said. Do not reward generic or unrelated content.

Provide scores from 0 to 100 for each of these four pillars:
- technicalAccuracy: How technically correct and precise is the answer?
- communicationClarity: How clearly and coherently is the answer expressed?
- problemSolvingStructure: How well does the candidate structure their reasoning and demonstrate problem-solving approach?
- completeness: How completely does the answer cover the key concepts from the reference answer?

Then compute overallScore as the weighted average:
  overallScore = round((technicalAccuracy * 0.35) + (communicationClarity * 0.20) + (problemSolvingStructure * 0.25) + (completeness * 0.20))

Also provide:
- strengths: 1 to 3 specific things the candidate did well (be concrete, not generic)
- missingPoints: 1 to 3 specific concepts or details that were missing or incorrect
- improvedAnswer: A concise rewritten version of the candidate's answer that would score 90+ (incorporate their existing good points and fill the gaps)
- feedback: 2 to 3 sentences of constructive overall feedback

Penalize answers that:
- Do not address the actual topic asked
- Avoid important technical details
- Are vague, filler-heavy, or off-topic
- Miss the main concept covered by the reference answer
`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return normalizeEvaluation(parsed);
  } catch {
    return generateFallbackEvaluation(answer, {});
  }
}

function normalizeEvaluation(raw) {
  const breakdown = raw?.scoreBreakdown || {};
  const technicalAccuracy = clamp(breakdown.technicalAccuracy ?? 50);
  const communicationClarity = clamp(breakdown.communicationClarity ?? 50);
  const problemSolvingStructure = clamp(breakdown.problemSolvingStructure ?? 50);
  const completeness = clamp(breakdown.completeness ?? 50);

  const computedOverall = Math.round(
    technicalAccuracy * 0.35 +
    communicationClarity * 0.20 +
    problemSolvingStructure * 0.25 +
    completeness * 0.20
  );

  const overallScore = clamp(
    Number.isFinite(raw?.overallScore) ? raw.overallScore : computedOverall
  );

  return {
    score: overallScore,
    overallScore,
    scoreBreakdown: { technicalAccuracy, communicationClarity, problemSolvingStructure, completeness },
    strengths: Array.isArray(raw?.strengths) ? raw.strengths.slice(0, 3) : [],
    missingPoints: Array.isArray(raw?.missingPoints) ? raw.missingPoints.slice(0, 3) : [],
    improvedAnswer: raw?.improvedAnswer || "",
    feedback: raw?.feedback || ""
  };
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

// ─── Mock Room Prompts ────────────────────────────────────────────────────────

export async function generateMockRoomPrompts({ role, experience, topic }) {
  const questions = await generateInterviewQuestions({
    role,
    experience,
    focusAreas: [topic],
    count: 3,
    existingQuestions: []
  });

  return questions.map((item) => ({
    question: item.question,
    answer: item.answer
  }));
}
