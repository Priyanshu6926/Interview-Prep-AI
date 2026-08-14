import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: null
    },
    overallScore: {
      type: Number,
      default: null
    },
    scoreBreakdown: {
      technicalAccuracy: { type: Number, default: null },
      communicationClarity: { type: Number, default: null },
      problemSolvingStructure: { type: Number, default: null },
      completeness: { type: Number, default: null }
    },
    strengths: {
      type: [String],
      default: []
    },
    missingPoints: {
      type: [String],
      default: []
    },
    feedback: {
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    title: String,
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },
    questionType: {
      type: String,
      enum: ["Technical", "Behavioral", "System Design", "Coding"],
      default: "Technical"
    },
    userAnswer: {
      type: String,
      default: ""
    },
    explanation: {
      type: String,
      default: ""
    },
    lastEvaluation: {
      // Legacy flat score field — kept for backwards compatibility
      score: {
        type: Number,
        default: null
      },
      overallScore: {
        type: Number,
        default: null
      },
      scoreBreakdown: {
        technicalAccuracy: { type: Number, default: null },
        communicationClarity: { type: Number, default: null },
        problemSolvingStructure: { type: Number, default: null },
        completeness: { type: Number, default: null }
      },
      strengths: {
        type: [String],
        default: []
      },
      missingPoints: {
        type: [String],
        default: []
      },
      improvedAnswer: {
        type: String,
        default: ""
      },
      feedback: {
        type: String,
        default: ""
      }
    },
    attempts: {
      type: [attemptSchema],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      required: true
    },
    experience: {
      type: Number,
      required: true
    },
    focusAreas: {
      type: [String],
      default: []
    },
    resumeProfile: {
      fileName: {
        type: String,
        default: ""
      },
      summary: {
        type: String,
        default: ""
      },
      skills: {
        type: [String],
        default: []
      },
      projects: {
        type: [String],
        default: []
      },
      highlights: {
        type: [String],
        default: []
      }
    },
    resumeAnalysis: {
      atsScore: {
        type: Number,
        default: null
      },
      matchingSkills: {
        type: [String],
        default: []
      },
      missingKeywords: {
        type: [String],
        default: []
      },
      projectRelevance: {
        type: String,
        default: ""
      },
      recommendations: {
        type: [String],
        default: []
      }
    },
    questions: {
      type: [questionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

sessionSchema.index({ user: 1, updatedAt: -1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
