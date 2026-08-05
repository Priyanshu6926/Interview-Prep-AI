import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// ─── Schema Definitions ────────────────────────────────────────────────────────

const complexitySchema = {
  type: SchemaType.OBJECT,
  properties: {
    timeComplexity: { type: SchemaType.STRING },
    spaceComplexity: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
    canBeOptimized: { type: SchemaType.BOOLEAN },
    optimizationHint: { type: SchemaType.STRING }
  },
  required: ["timeComplexity", "spaceComplexity", "explanation", "canBeOptimized", "optimizationHint"]
};

const hintSchema = {
  type: SchemaType.OBJECT,
  properties: {
    hint: { type: SchemaType.STRING },
    hintLevel: { type: SchemaType.STRING }
  },
  required: ["hint", "hintLevel"]
};

// ─── Model Factories ──────────────────────────────────────────────────────────

function getComplexityModel() {
  if (!process.env.GEMINI_API_KEY) return null;
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: complexitySchema,
      temperature: 0.2
    }
  });
}

function getHintModel() {
  if (!process.env.GEMINI_API_KEY) return null;
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: hintSchema,
      temperature: 0.5
    }
  });
}

// ─── Complexity Analysis ──────────────────────────────────────────────────────

/**
 * Analyzes the time and space complexity of submitted code.
 *
 * @param {object} params
 * @param {string} params.code      - The candidate's code
 * @param {string} params.language  - Programming language
 * @param {string} params.prompt    - The exercise problem statement
 *
 * @returns {Promise<object>} { timeComplexity, spaceComplexity, explanation, canBeOptimized, optimizationHint }
 */
export async function analyzeComplexity({ code, language = "javascript", prompt }) {
  const model = getComplexityModel();

  if (!model) {
    return {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation: "Complexity analysis is not available without an AI key configured.",
      canBeOptimized: false,
      optimizationHint: ""
    };
  }

  const analysisPrompt = `
You are an expert software engineer analyzing code complexity for a coding interview evaluation tool.

Programming Language: ${language}
Problem Statement: ${prompt || "A coding challenge"}

Candidate's Code:
\`\`\`${language}
${code}
\`\`\`

Analyze the time and space complexity of this code.
- timeComplexity: Big-O notation (e.g. "O(n)", "O(n log n)", "O(n²)")
- spaceComplexity: Big-O notation (e.g. "O(1)", "O(n)")
- explanation: 2-3 sentences explaining WHY these complexities apply in plain English, referencing specific loops or data structures in the code
- canBeOptimized: true if there is a meaningfully better complexity achievable
- optimizationHint: If canBeOptimized is true, a single sentence hint about what approach could improve it (do NOT give the full solution)
`;

  try {
    const result = await model.generateContent(analysisPrompt);
    return JSON.parse(result.response.text());
  } catch {
    return {
      timeComplexity: "Unable to analyze",
      spaceComplexity: "Unable to analyze",
      explanation: "The complexity analysis encountered an error. Please try again.",
      canBeOptimized: false,
      optimizationHint: ""
    };
  }
}

// ─── Progressive Hint Generation ─────────────────────────────────────────────

const HINT_LEVELS = ["Directional", "Structural", "Implementation"];

/**
 * Generates a progressive contextual hint for the current coding exercise.
 *
 * @param {object} params
 * @param {string} params.prompt      - The exercise problem statement
 * @param {string} params.code        - Candidate's current code (to give contextual hints)
 * @param {string} params.language    - Programming language
 * @param {number} params.hintIndex   - 0, 1, or 2 (progressive depth)
 *
 * @returns {Promise<object>} { hint, hintLevel }
 */
export async function generateHint({ prompt, code, language = "javascript", hintIndex = 0 }) {
  const model = getHintModel();
  const safeIndex = Math.min(Math.max(hintIndex, 0), HINT_LEVELS.length - 1);
  const hintLevel = HINT_LEVELS[safeIndex];

  if (!model) {
    const fallbackHints = [
      "Think about what data structure would let you look up values in O(1) time.",
      "Consider storing information you've already seen as you iterate through the input.",
      "A hash map storing value → index pairs will let you find the complement in one pass."
    ];
    return {
      hint: fallbackHints[safeIndex] || fallbackHints[0],
      hintLevel
    };
  }

  const hintInstructions = {
    Directional: "Give a high-level directional hint about the APPROACH or DATA STRUCTURE to use. Do not mention specific code patterns or variable names. Just point them in the right direction.",
    Structural: "Give a structural hint about HOW to organize the code — loops, data structures, what to track. Still do not give actual implementation code.",
    Implementation: "Give a concrete implementation hint with a short pseudocode snippet (2-4 lines max). This is the last hint before the full solution."
  };

  const hintPrompt = `
You are an expert coding interview coach giving a ${hintLevel} hint.

Problem Statement: ${prompt}

Candidate's Current Code:
\`\`\`${language}
${code || "// No code written yet"}
\`\`\`

Hint Level: ${hintLevel}
Instructions: ${hintInstructions[hintLevel]}

CRITICAL RULES:
- Do NOT give the complete solution
- Do NOT write the full function body  
- Tailor the hint to what the candidate has written so far — address their specific code
- Keep the hint under 3 sentences (or under 5 lines for implementation hint with pseudocode)
- hintLevel should be exactly: "${hintLevel}"
`;

  try {
    const result = await model.generateContent(hintPrompt);
    const parsed = JSON.parse(result.response.text());
    return {
      hint: parsed.hint || "Think about what data structure would help here.",
      hintLevel: parsed.hintLevel || hintLevel
    };
  } catch {
    return {
      hint: "Think carefully about the time complexity of your current approach and whether a different data structure could improve it.",
      hintLevel
    };
  }
}
