const ANGLE_TYPE_MAP = {
  fundamentals: "Technical",
  debugging: "Technical",
  tradeoff: "System Design",
  project: "Behavioral",
  design: "System Design"
};

const interviewAngles = [
  {
    id: "fundamentals",
    title: "Fundamentals Check",
    buildQuestion: ({ topic, role, experience }) =>
      `What is ${topic}, and why does it matter for a ${role} with ${experience} years of experience?`,
    buildAnswer: ({ topic, role, experience }) =>
      `A strong candidate answer would start by defining ${topic} in plain engineering language, then explain why it matters in the real work of a ${role}. The next part should connect the concept to implementation decisions, maintainability, performance, product quality, or reliability. For someone with ${experience} years of experience, the interviewer expects both conceptual clarity and evidence that the idea has shaped real design or coding choices.\n\nAfter the definition, a strong answer should include a practical example. For example, the candidate might describe a feature or system where ${topic} affected how data was structured, how components communicated, how requests were handled, or how edge cases were managed. This helps the answer sound grounded rather than theoretical.\n\nA polished answer should also mention tradeoffs or limitations. Interviewers generally respond better when a candidate explains not only why ${topic} is useful, but also when it becomes hard to manage, when an alternative might be better, and how to validate that the chosen approach is working in production.`,
    buildExplanation: ({ topic, role }) =>
      `Core Idea\nStart by defining ${topic} in plain language and explain what engineering problem it helps solve.\n\nWhy Interviewers Ask This\nFor a ${role}, this question checks whether you understand both the theory and the real-world use of ${topic}. The interviewer wants proof that you can connect the concept to implementation choices rather than reciting a definition.\n\nHow To Answer Well\nA strong answer moves in three steps: define the concept, explain where it shows up in real work, and give one concrete example from a feature or system. Stronger candidates also mention tradeoffs, limitations, or failure cases.\n\nPractical Example\nThink about a situation where ${topic} affected design, debugging, or maintainability. If you can describe what changed in the system because of that concept, your answer becomes much more convincing.`
  },
  {
    id: "debugging",
    title: "Debugging Scenario",
    buildQuestion: ({ topic, role }) =>
      `Suppose a feature related to ${topic} is behaving incorrectly in production. How would you debug the issue step by step as a ${role}?`,
    buildAnswer: ({ topic, role }) =>
      `A strong candidate answer would walk through a structured debugging path: first reproduce the problem, then narrow the failure surface, inspect the right signals, validate assumptions, and isolate the root cause. For ${topic}, a good answer should explain whether the first checks belong in logs, browser tools, API responses, state transitions, database records, or infrastructure metrics.\n\nInterviewers like to hear a hypothesis-driven workflow. That means the candidate should explain what they would test first, what result would confirm or reject the hypothesis, and how they would keep the system safe while investigating. For example, they might mention feature flags, limited rollbacks, guardrails, or temporary observability improvements.\n\nThe strongest answers end with prevention. After fixing the immediate bug, a good candidate should mention regression tests, stronger monitoring, clearer error handling, or architectural improvements that reduce the chance of similar failures in the future.`,
    buildExplanation: ({ topic }) =>
      `This question is testing structured debugging judgment.\n\nFor ${topic}, the interviewer wants to hear how you reduce uncertainty, verify hypotheses, and move from symptoms to root cause.\n\nA great answer sounds methodical: reproduce, inspect, isolate, confirm, fix, and add prevention.`
  },
  {
    id: "tradeoff",
    title: "Tradeoff Discussion",
    buildQuestion: ({ topic, role }) =>
      `What tradeoffs would you consider when choosing one approach over another for ${topic} in a ${role} interview setting?`,
    buildAnswer: ({ topic }) =>
      `A strong candidate answer should make it clear that there is rarely one universally correct solution for ${topic}. Instead, the right decision depends on scale, maintainability, delivery speed, performance, team familiarity, reliability requirements, and how expensive mistakes would be. The answer should compare at least two reasonable approaches instead of speaking as if the choice is obvious.\n\nA polished response explains what each option optimizes for. One option may be simpler to ship and easier for the team to maintain, while another might support more scale or flexibility at the cost of complexity. Interviewers want to hear that you understand these tradeoffs and that you can choose based on constraints, not habit.\n\nThe best ending is situational. A strong candidate would say something like: if the problem is small and fast-moving, I would optimize for simplicity first; if the system is already large or high-risk, I would accept more structure to reduce long-term cost. That kind of reasoning sounds much more senior in an interview.`,
    buildExplanation: ({ topic }) =>
      `Interviewers ask this to see whether you can reason instead of recite.\n\nFor ${topic}, they want evidence that you understand competing priorities, such as simplicity versus flexibility or speed versus correctness.\n\nIf your answer explains why a decision changes under different constraints, it will sound much stronger.`
  },
  {
    id: "project",
    title: "Project-Based Follow-Up",
    buildQuestion: ({ topic, role, resumeProfile }) =>
      resumeProfile?.projects?.length
        ? `On your resume, you mention work that likely touches ${topic}. How would you describe a real project where you applied ${topic} as a ${role}?`
        : `Describe a project where you applied ${topic} as a ${role}. What problem were you solving, and what was your contribution?`,
    buildAnswer: ({ topic }) =>
      `A strong candidate answer should tell a clear project story: what the problem was, what constraints existed, what part of the work they owned, how ${topic} shaped the technical decisions, and what happened after the solution shipped. The answer should make the candidate's contribution specific instead of hiding behind "we" language the whole time.\n\nInterviewers usually care less about buzzwords and more about judgment. A good answer should therefore explain why a certain implementation was chosen, what risks were considered, and what changed because of that decision. Metrics, user impact, reliability gains, or delivery improvements all make the story stronger.\n\nThe best version of this answer ends with reflection. If the candidate can say what they learned, what they would improve next time, or how the project influenced later architectural choices, the answer feels more mature and credible.`,
    buildExplanation: ({ topic }) =>
      `This is a practical credibility question.\n\nFor ${topic}, the interviewer wants proof that you have used the concept in real project work and can explain your own contribution clearly.\n\nA clean structure is: context, challenge, action, result, and what you learned.`
  },
  {
    id: "design",
    title: "Design and Scalability",
    buildQuestion: ({ topic, role }) =>
      `If you had to design or improve a system involving ${topic}, what architecture or implementation choices would you make first as a ${role}?`,
    buildAnswer: ({ topic, role }) =>
      `A strong candidate answer should begin with requirements and constraints before naming any tools or patterns. For ${topic}, the interviewer expects the candidate to talk through scale, latency, ownership boundaries, observability, maintainability, and what could fail first. This shows structured design thinking instead of technology name-dropping.\n\nA good response then moves into the architecture itself: what the main components are, how data flows between them, where state lives, what gets cached or persisted, and what tradeoffs are being accepted. For a ${role}, this is where the candidate shows that they can reason about systems instead of only individual functions or screens.\n\nThe strongest answers also explain validation. A candidate should mention how they would monitor success, what metrics they would watch, how they would roll the design out safely, and what would trigger a redesign later if the constraints changed.`,
    buildExplanation: ({ topic }) =>
      `This question checks whether you can think beyond isolated features.\n\nFor ${topic}, the interviewer wants to hear how you move from requirements to design choices, what bottlenecks you expect, and how you would validate the solution after implementation.\n\nA strong answer names components, data flow, tradeoffs, and failure modes.`
  }
];

function normalizeQuestion(question) {
  return question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildTopics(focusAreas, count) {
  const concepts = focusAreas.length ? focusAreas : ["Core concepts", "Problem solving", "System design"];
  return Array.from({ length: count }, (_, index) => concepts[index % concepts.length]);
}

export function ensureQuestionSetQuality(
  questions,
  { role, experience, focusAreas, count = 5, existingQuestions = [], resumeProfile = null }
) {
  const normalizedExisting = new Set(existingQuestions.map(normalizeQuestion));
  const seen = new Set();
  const filtered = [];

  for (const item of questions) {
    const normalized = normalizeQuestion(item.question || "");
    if (!normalized || normalizedExisting.has(normalized) || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    filtered.push({
      ...item,
      title: item.title || "Interview Question",
      tags: Array.isArray(item.tags) ? item.tags : [role, ...(focusAreas || [])].filter(Boolean).slice(0, 3),
      isPinned: Boolean(item.isPinned),
      userAnswer: item.userAnswer || "",
      lastEvaluation: item.lastEvaluation || { score: null, feedback: "" }
    });
  }

  if (filtered.length < count) {
    const supplemental = generateFallbackQuestions({
      role,
      experience,
      focusAreas,
      count: count - filtered.length,
      existingQuestions: [...existingQuestions, ...filtered.map((item) => item.question)],
      resumeProfile
    });
    return [...filtered, ...supplemental].slice(0, count);
  }

  return filtered.slice(0, count);
}

export function generateFallbackQuestions({
  role,
  experience,
  focusAreas,
  count = 5,
  existingQuestions = [],
  resumeProfile = null
}) {
  const topics = buildTopics(focusAreas, count);
  const used = new Set(existingQuestions.map(normalizeQuestion));

  const difficultyForExperience = experience <= 1 ? "Easy" : experience <= 3 ? "Medium" : "Hard";

  const generated = topics.map((topic, index) => {
    const angle = interviewAngles[index % interviewAngles.length];
    const question = angle.buildQuestion({ topic, role, experience, resumeProfile });
    const normalized = normalizeQuestion(question);
    const uniqueIndex = existingQuestions.length + index + 1;

    if (used.has(normalized)) {
      const fallbackAngle = interviewAngles[(index + 2) % interviewAngles.length];
      const alternateQuestion = fallbackAngle.buildQuestion({ topic, role, experience, resumeProfile });
      used.add(normalizeQuestion(alternateQuestion));
      return {
        title: `${topic}: ${fallbackAngle.title}`,
        question: alternateQuestion,
        difficulty: difficultyForExperience,
        questionType: ANGLE_TYPE_MAP[fallbackAngle.id] || "Technical",
        answer: fallbackAngle.buildAnswer({ topic, role, experience, resumeProfile }),
        explanation: fallbackAngle.buildExplanation({ topic, role, experience, resumeProfile }),
        tags: [topic, fallbackAngle.id, role],
        isPinned: existingQuestions.length === 0 && index === 0,
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
      };
    }

    used.add(normalized);
    return {
      title: `${topic}: ${angle.title} ${uniqueIndex}`,
      question,
      difficulty: difficultyForExperience,
      questionType: ANGLE_TYPE_MAP[angle.id] || "Technical",
      answer: angle.buildAnswer({ topic, role, experience, resumeProfile }),
      explanation: angle.buildExplanation({ topic, role, experience, resumeProfile }),
      tags: [topic, angle.id, role],
      isPinned: existingQuestions.length === 0 && index === 0,
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
    };
  });

  return generated;
}

export function generateFallbackExplanation(question) {
  return (
    `Core Idea\n${question.question} is really testing whether you understand the concept well enough to explain both the theory and the practical engineering decisions behind it.\n\n` +
    `Why Interviewers Ask This\nInterviewers use questions like this to see whether you can move beyond a memorized definition and explain where the concept shows up in production work. They want to hear whether you understand impact, tradeoffs, constraints, and the situations where the concept becomes important.\n\n` +
    `How To Build A Strong Answer\nStart with a crisp definition in simple language. Then connect that definition to the kind of system or feature where the concept matters. After that, walk through one realistic scenario, the decision you would make, why you would make it, and what could go wrong if the concept is misunderstood. A good answer should sound like you have applied the concept, not just read about it.\n\n` +
    `Common Mistakes\nAvoid giving only a textbook definition. Avoid jumping straight into tools or buzzwords without explaining what problem the concept solves. Also avoid answers that sound absolute. Strong interview answers usually explain when an approach works well, what tradeoffs it introduces, and when another choice might be better.\n\n` +
    `Practical Example\nImagine you are asked about component state in React. A better answer is not just "state stores data." A better answer explains that state is used for data that changes over time, like form values, loading flags, or selected filters, and that updating state triggers re-renders so the UI stays in sync with user actions. You could then continue by explaining when local state is enough and when shared state becomes necessary.\n\n` +
    `Example Code\n\`\`\`jsx\nfunction SearchBox() {\n  const [query, setQuery] = useState(\"\");\n\n  return (\n    <input\n      value={query}\n      onChange={(event) => setQuery(event.target.value)}\n      placeholder=\"Search interviews\"\n    />\n  );\n}\n\`\`\`\n\n` +
    `In an interview, code like this helps because it turns an abstract concept into something concrete and easy to reason about.`
  );
}

export function generateFallbackEvaluation(answer, evaluationContext = {}) {
  const wordCount = String(answer || "").trim().split(/\s+/).filter(Boolean).length;
  const baseScore = wordCount < 20 ? 25 : wordCount < 50 ? 45 : 60;
  const score = Math.max(10, Math.min(95, baseScore));

  const feedback =
    wordCount < 20
      ? "Your answer does not seem closely connected to the actual interview question yet. To improve the score, answer the specific topic directly, use the important technical terms from the question, and explain one realistic example tied to that concept."
      : "Your answer has some useful structure, but it can be stronger. Improve it by covering the actual topic more directly, adding one specific implementation example, and explaining at least one tradeoff or practical decision.";

  return {
    // Legacy flat fields
    score,
    feedback,
    // 4-pillar scorecard
    overallScore: score,
    scoreBreakdown: {
      technicalAccuracy: score,
      communicationClarity: score,
      problemSolvingStructure: score,
      completeness: score
    },
    strengths: wordCount >= 20 ? ["You provided some content relevant to the topic"] : [],
    missingPoints: [
      "Technical depth and precision",
      "A concrete implementation example",
      "Discussion of tradeoffs or limitations"
    ],
    improvedAnswer: ""
  };
}
