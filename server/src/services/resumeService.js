import pdfParse from "pdf-parse";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const resumeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    projects: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    highlights: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    }
  },
  required: ["summary", "skills", "projects", "highlights"]
};

const matchAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    atsScore: { type: SchemaType.NUMBER },
    matchingSkills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    missingKeywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    projectRelevance: { type: SchemaType.STRING },
    recommendations: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    }
  },
  required: ["atsScore", "matchingSkills", "missingKeywords", "projectRelevance", "recommendations"]
};

function getModel(schema, temperature = 0.3) {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature
    }
  });
}

function fallbackResumeProfile(text, fileName) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const segments = normalized.split(/[.\u2022]/).map((item) => item.trim()).filter(Boolean);
  const skillMatches =
    normalized.match(/\b(react|next\.js|node|express|mongodb|mongoose|javascript|typescript|python|sql|postgresql|mysql|aws|docker|kubernetes|java|spring|redux|tailwind|html|css|git|graphql|rest api)\b/gi) || [];
  const skills = Array.from(
    new Set(skillMatches.map((item) => item.toLowerCase()))
  );
  const techSummaryParts = [];

  if (skills.length) {
    techSummaryParts.push(`Core stack: ${skills.slice(0, 8).join(", ")}.`);
  }

  if (segments[0]) {
    techSummaryParts.push(`Background: ${segments[0]}.`);
  }

  if (segments[1]) {
    techSummaryParts.push(`Likely strengths: ${segments[1]}.`);
  }

  return {
    fileName,
    summary:
      techSummaryParts.join(" ") ||
      "Resume uploaded successfully. The app will use this profile to generate a compact tech summary and bias interview questions toward your real experience.",
    skills,
    projects: segments.slice(3, 6),
    highlights: segments.slice(6, 10)
  };
}

export async function parseResume(file) {
  const parsed = await pdfParse(file.buffer);
  const text = parsed.text || "";
  const model = getModel(resumeSchema, 0.3);

  if (!model) {
    return fallbackResumeProfile(text, file.originalname);
  }

  try {
    const prompt = `
You are helping build a resume-aware interview coach.
Extract only the interview-relevant technical information from this resume text.

Resume text:
${text.slice(0, 12000)}

Return:
- summary: A 2 to 4 sentence tech-stack style summary focused on role, tools, domains, and strongest experience areas. Do not paste resume lines verbatim.
- skills: A list of specific technical skills mentioned in the resume
- projects: Very short one-line summaries of each notable project or accomplishment
- highlights: Interview-relevant technical or leadership highlights
`;
    const result = await model.generateContent(prompt);
    const parsedJson = JSON.parse(result.response.text());

    return {
      fileName: file.originalname,
      summary: parsedJson.summary || "",
      skills: parsedJson.skills || [],
      projects: parsedJson.projects || [],
      highlights: parsedJson.highlights || []
    };
  } catch {
    return fallbackResumeProfile(text, file.originalname);
  }
}

/**
 * Analyzes resume fit against the target role, experience, and focus areas.
 */
export async function analyzeResumeMatch({ resumeProfile, role, experience, focusAreas = [] }) {
  const model = getModel(matchAnalysisSchema, 0.2);

  if (!model || !resumeProfile) {
    return {
      atsScore: 75,
      matchingSkills: resumeProfile?.skills?.slice(0, 5) || ["Core technical skills"],
      missingKeywords: ["Advanced System Design", "CI/CD Pipeline"],
      projectRelevance: "Projects align generally with expected experience level.",
      recommendations: [
        "Include quantifiable metrics in your project bullet points.",
        "Emphasize hands-on experience with modern tooling.",
        "Practice explaining technical tradeoffs out loud."
      ]
    };
  }

  const prompt = `
Analyze the candidate's resume profile against the target interview role.

Target Role: ${role}
Target Experience: ${experience} years
Focus Areas: ${focusAreas.join(", ")}

Candidate Resume Summary: ${resumeProfile.summary}
Candidate Skills: ${resumeProfile.skills.join(", ")}
Candidate Projects: ${resumeProfile.projects.join(" | ")}

Provide an ATS Match & Skill Gap analysis:
- atsScore: 0 to 100 overall match score based on technical alignment for ${role} with ${experience} years experience
- matchingSkills: 3 to 6 skills from the candidate's resume that strongly match the ${role} requirements
- missingKeywords: 2 to 5 industry-standard keywords/skills expected for ${role} (${experience} yrs) that are missing or weak in the resume
- projectRelevance: 2-3 sentences evaluating how well the candidate's projects match the technical complexity required for ${role}
- recommendations: 3 actionable recommendations for the candidate to improve their resume and interview readiness
`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return {
      atsScore: Math.max(0, Math.min(100, Math.round(parsed.atsScore || 70))),
      matchingSkills: parsed.matchingSkills || [],
      missingKeywords: parsed.missingKeywords || [],
      projectRelevance: parsed.projectRelevance || "",
      recommendations: parsed.recommendations || []
    };
  } catch {
    return {
      atsScore: 70,
      matchingSkills: resumeProfile.skills.slice(0, 4),
      missingKeywords: ["Architecture Design", "Testing Automation"],
      projectRelevance: "Projects show solid core experience.",
      recommendations: ["Highlight problem-solving impact in interview answers."]
    };
  }
}
