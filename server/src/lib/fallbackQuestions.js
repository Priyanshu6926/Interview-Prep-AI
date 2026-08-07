const ANGLE_TYPE_MAP = {
  fundamentals: "Technical",
  debugging: "Technical",
  tradeoff: "System Design",
  project: "Behavioral",
  design: "System Design"
};

const DIFFICULTY_PROGRESSION = ["Easy", "Easy", "Medium", "Medium", "Hard"];

const interviewAngles = [
  {
    id: "fundamentals",
    title: "Core Fundamentals",
    buildQuestion: ({ topic, role, experience }) =>
      `What is ${topic}, and why is it essential for a ${role} with ${experience} years of experience?`,
    buildAnswer: ({ topic, role, experience }) =>
      `In my experience as a ${role}, ${topic} is fundamental because it provides the core building blocks for reliable software development. When explaining ${topic} in an interview, I define it in simple engineering terms: it represents the mechanism for managing state, logic, or execution flow safely.\n\nIn practical production work, understanding ${topic} helps prevent common performance bottlenecks and memory leaks. For a candidate with ${experience} years of experience, the key is demonstrating both conceptual precision and practical experience—explaining how proper application of ${topic} leads to cleaner abstractions, easier testing, and maintainable code.\n\nThe main tradeoff to keep in mind is avoiding over-engineering. While ${topic} is powerful, misapplying it can introduce unnecessary complexity or tight coupling. I always evaluate the requirements first before choosing the appropriate implementation pattern.`,
    buildExplanation: ({ topic, role }) =>
      `Core Idea\n${topic} is a foundational concept for a ${role}. Understanding this topic enables you to write clean, predictable, and robust code.\n\nWhy Interviewers Ask This\nInterviewers ask this question to verify that you possess solid theoretical knowledge and understand how ${topic} impacts daily development work.\n\nHow To Build A Strong Answer\n1. Provide a concise, clear definition of ${topic}.\n2. Explain its primary purpose in real-world application.\n3. Discuss best practices and potential pitfalls when using it.\n\nPractical Example\nWhen working on real-world projects, applying ${topic} correctly ensures that data flow remains consistent and system behavior is easy to reason about.`
  },
  {
    id: "practical",
    title: "Practical Implementation",
    buildQuestion: ({ topic, role }) =>
      `How do you implement and configure ${topic} in a production-ready ${role} project?`,
    buildAnswer: ({ topic, role }) =>
      `When implementing ${topic} in a ${role} project, I follow standard industry patterns to ensure reliability and scalability. I start by setting up modular components/modules with clear boundaries.\n\nNext, I establish proper error handling and logging around ${topic}. In production systems, silent failures or unhandled exceptions can cause catastrophic downstream issues. By adding defensive checks and structured logging, we can catch edge cases early.\n\nFinally, I write unit and integration tests covering both happy path scenarios and boundary conditions. This ensures that refactoring ${topic} later won't break existing functionality.`,
    buildExplanation: ({ topic, role }) =>
      `Core Idea\nImplementing ${topic} requires adherence to clean architecture principles, modular code organization, and defensive error handling.\n\nWhy Interviewers Ask This\nThis question evaluates your hands-on coding ability as a ${role} and whether you write production-grade code rather than theoretical scripts.\n\nHow To Build A Strong Answer\nWalk through your setup step-by-step: configuration, core logic implementation, exception handling, and automated test coverage.`
  },
  {
    id: "debugging",
    title: "Debugging Scenario",
    buildQuestion: ({ topic, role }) =>
      `Suppose a feature related to ${topic} is failing intermittently in production. How would you debug and fix the issue step by step as a ${role}?`,
    buildAnswer: ({ topic, role }) =>
      `When troubleshooting intermittent production failures in ${topic}, I follow a systematic, hypothesis-driven approach:\n\n1. **Reproduce & Observe**: I start by reviewing application logs, APM metrics, and error rates to identify correlation patterns (e.g., memory spikes, thread contention, network timeouts).\n2. **Isolate Root Cause**: I attempt to reproduce the failure in a staging environment using isolated test inputs or traffic shadowing. For ${topic}, I inspect memory allocation, state mutation, or async concurrency boundaries.\n3. **Apply & Verify Fix**: Once the bug is isolated, I implement a targeted fix, deploy it behind a feature flag or canary release, and verify that error rates return to zero.\n4. **Prevent Recurrence**: I add regression tests and update alerting rules to prevent similar issues from reoccurring in the future.`,
    buildExplanation: ({ topic }) =>
      `Core Idea\nIntermittent production bugs in ${topic} usually stem from unhandled edge cases, race conditions, resource leaks, or external dependency failures.\n\nWhy Interviewers Ask This\nInterviewers test your engineering maturity—how you remain calm, systematic, and data-driven under production outage pressure.\n\nHow To Build A Strong Answer\nStructure your answer into four clear phases: Observe & Log → Isolate Hypothesis → Fix & Validate → Add Preventive Telemetry.`
  },
  {
    id: "tradeoff",
    title: "Tradeoff & Architecture",
    buildQuestion: ({ topic, role }) =>
      `What architectural tradeoffs and performance considerations would you analyze when choosing an approach for ${topic} as a ${role}?`,
    buildAnswer: ({ topic }) =>
      `When evaluating architectural choices for ${topic}, there is no one-size-fits-all solution. The optimal decision depends on throughput, latency tolerances, team complexity, and maintenance overhead.\n\nOption A (Simpler Approach) offers rapid delivery and lower initial complexity, making it ideal for early-stage features or lower traffic volume. However, it may encounter scalability bottlenecks as user traffic grows.\n\nOption B (Distributed/Decoupled Approach) provides high throughput, fault isolation, and horizontal scalability, but introduces operational overhead, network latency, and eventual consistency challenges.\n\nMy decision framework relies on data: I start with the simplest solution that meets current SLA requirements, while designing clean interfaces so we can pivot to Option B if scale demands it.`,
    buildExplanation: ({ topic }) =>
      `Core Idea\nEngineering is the art of trade-offs. Choosing how to structure ${topic} involves balancing complexity, performance, cost, and developer velocity.\n\nWhy Interviewers Ask This\nSenior engineers are distinguished by their ability to compare alternatives objectively rather than dogmatically advocating a single tool.\n\nHow To Build A Strong Answer\nCompare two distinct architectural options, highlight pros/cons for each, and explain your situational decision framework.`
  },
  {
    id: "company_standards",
    title: "Company Standard System Challenge",
    buildQuestion: ({ topic, role }) =>
      `How would you design a highly resilient, enterprise-scale system handling ${topic} to meet high availability (99.99%) and company production standards as a ${role}?`,
    buildAnswer: ({ topic, role }) =>
      `To design an enterprise-grade system handling ${topic} at 99.99% availability, I architect for resilience at every tier:\n\n1. **Stateless Scalability**: Ensure service instances handling ${topic} are stateless so they can scale horizontally behind load balancers.\n2. **Resilience Patterns**: Implement circuit breakers, rate limiters, and exponential backoff retries with jitter to prevent cascading failures.\n3. **Data Consistency & Caching**: Use multi-region replication for storage and distributed caching (e.g., Redis) with TTLs to offload read pressure.\n4. **Observability & Guardrails**: Instrument distributed tracing (OpenTelemetry), health checks, and automated blue-green deployments with zero downtime.\n\nThis architecture guarantees high availability and compliance with top-tier enterprise standards for a ${role}.`,
    buildExplanation: ({ topic }) =>
      `Core Idea\nEnterprise production standards require designing for high availability, fault tolerance, graceful degradation, and comprehensive observability around ${topic}.\n\nWhy Interviewers Ask This\nCompany-standard questions test whether you can design systems that handle massive traffic spikes and unexpected infrastructure outages.\n\nHow To Build A Strong Answer\nCover the core distributed system pillars: Load Balancing → Caching & Storage → Fault Tolerance (Circuit Breakers) → Observability & Rollouts.`
  }
];

function normalizeQuestion(question) {
  return question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildTopics(focusAreas, count) {
  const concepts = focusAreas.length ? focusAreas : ["Core concepts", "Practical engineering", "System architecture"];
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

  const generated = topics.map((topic, index) => {
    const angleIndex = (existingQuestions.length + index) % interviewAngles.length;
    const angle = interviewAngles[angleIndex];
    const question = angle.buildQuestion({ topic, role, experience, resumeProfile });
    const normalized = normalizeQuestion(question);
    const uniqueIndex = existingQuestions.length + index + 1;
    const difficulty = DIFFICULTY_PROGRESSION[angleIndex % DIFFICULTY_PROGRESSION.length];

    if (used.has(normalized)) {
      const fallbackAngle = interviewAngles[(angleIndex + 2) % interviewAngles.length];
      const alternateQuestion = fallbackAngle.buildQuestion({ topic, role, experience, resumeProfile });
      used.add(normalizeQuestion(alternateQuestion));
      return {
        title: `${topic}: ${fallbackAngle.title}`,
        question: alternateQuestion,
        difficulty,
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
      difficulty,
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
  const text = question?.question || "this topic";
  const tags = question?.tags || [];

  return (
    `Core Idea\n${text} tests your understanding of engineering principles, implementation choices, and practical production constraints.\n\n` +
    `Why Interviewers Ask This\nInterviewers use questions like this to evaluate whether you can move beyond memorized definitions to explain real-world tradeoffs, debugging methodologies, and design decisions.\n\n` +
    `How To Build A Strong Answer\n1. State a clear, concise definition of the core concept.\n2. Explain how this concept functions in real production systems.\n3. Walk through one specific implementation scenario, describing tradeoffs and edge cases.\n\n` +
    `Common Mistakes\nAvoid generic textbook definitions without practical context. Be specific about your choices, state limitations clearly, and explain preventive measures for failure scenarios.\n\n` +
    `Practical Engineering Insight\nIn a real-world environment, addressing ${tags.join(" / ") || "key technical topics"} properly ensures high availability, clear code maintainability, and reliable error handling.`
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
    score,
    feedback,
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
