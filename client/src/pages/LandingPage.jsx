import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  Code2,
  FileText,
  Lightbulb,
  Mic,
  Sparkles,
  UsersRound
} from "lucide-react";
import appLogo from "../assets/app-logo.png";
import heroImage from "../assets/hero-img.png";
import { lectureHighlights } from "../data/landingContent";

function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(255,243,211,0.95),_rgba(248,250,252,0.92)_35%,_rgba(248,250,252,1)_70%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        {/* Navigation Header */}
        <header className="glass-panel flex flex-col items-start justify-between gap-4 px-6 py-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft">
              <img src={appLogo} alt="Interview Prep AI logo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-950">Interview Prep AI</p>
              <p className="text-xs sm:text-sm text-slate-500">Autonomous AI career coaching, live coding, and peer mock simulations.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="secondary-button">
              Log in
            </Link>
            <Link to="/register" className="primary-button inline-flex items-center gap-2">
              <span>Start Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center py-4">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-4 py-2 text-xs sm:text-sm font-semibold text-brand-700 shadow-soft">
              <Sparkles className="h-4 w-4 text-brand-500" />
              Powered by Google Gemini 2.0 & Sandboxed Code Execution
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl leading-[1.12]">
                Master Technical & Behavioral Interviews with <span className="bg-gradient-to-r from-brand-600 to-amber-600 bg-clip-text text-transparent">AI Precision.</span>
              </h1>
              <p className="max-w-2xl text-base sm:text-lg leading-8 text-slate-600">
                Simulate authentic interview pressure with voice evaluation drills, a sandboxed Monaco coding lab with progressive AI hints, resume-tailored tracks, and peer-to-peer WebRTC mock rooms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register" className="primary-button inline-flex items-center gap-2 px-6 py-3.5 text-base shadow-soft">
                <span>Start Practice Session</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="secondary-button px-6 py-3.5 text-base">
                View Candidate Cockpit
              </Link>
            </div>

            {/* Micro proof badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Voice Q&amp;A Evaluation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>VS-Code Grade Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>ATS Resume Matching</span>
              </div>
            </div>
          </div>

          {/* Hero Preview Image & Floating Badges */}
          <div className="relative rounded-[36px] border border-brand-100/80 bg-white/70 p-3 shadow-2xl backdrop-blur">
            <img
              src={heroImage}
              alt="Interview Prep AI dashboard preview"
              className="w-full rounded-[28px] object-cover shadow-soft"
            />
            {/* Overlay Badge */}
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex sm:items-center sm:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">4-Pillar Scorecard</p>
                <p className="text-[11px] text-slate-500">Technical Depth • Clarity • STAR Structure</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Preparation Workflow */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">How It Works</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">A 3-Step Practice Flywheel</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <article className="glass-panel p-6 sm:p-7 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-950">Configure Your Role &amp; Resume</h3>
              <p className="text-sm leading-6 text-slate-600">
                Choose your target title and years of experience, or upload your PDF resume. Gemini analyzes your tech stack and biases questions to your real project history.
              </p>
            </article>

            <article className="glass-panel p-6 sm:p-7 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-950">Voice &amp; Coding Drills</h3>
              <p className="text-sm leading-6 text-slate-600">
                Speak answers into the microphone with speech recognition, or write clean code in Monaco IDE with multi-language execution and 3-tier progressive hints.
              </p>
            </article>

            <article className="glass-panel p-6 sm:p-7 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-950">Instant AI Diagnostic Scorecard</h3>
              <p className="text-sm leading-6 text-slate-600">
                Get a score from 0–100 with actionable feedback on missing talking points, model answers, and Big-O time/space complexity analysis.
              </p>
            </article>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="glass-panel p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950">AI Spoken Evaluator</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Read questions aloud with Web Speech synthesis, transcribe your spoken answers, and evaluate articulation against senior standards.
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950">Interactive Coding Lab</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Embedded Monaco code editor supporting JavaScript, TypeScript, Python, and C++ with sandboxed test case execution.
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950">3-Tier Progressive Hints</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Get Directional, Structural, and Implementation hints tailored dynamically to the exact code you have written so far.
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950">ATS Resume Scanner</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Extract keywords, calculate role compatibility percentage, and identify missing technical competencies from your resume.
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <UsersRound className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950">WebRTC Peer Mock Rooms</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Open live video interview rooms with shared room codes to conduct mock interviews with colleagues and classmates.
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950">Readiness Analytics</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track progress over time with evaluation dimension breakdowns, role performance comparison, and pinned question backlogs.
            </p>
          </div>
        </section>

        {/* Featured Learning Tracks */}
        <section className="glass-panel p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Curated Interview Tracks</p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">Prepared Across Industry Disciplines</h3>
            </div>
            <BookOpenText className="h-5 w-5 text-brand-600" />
          </div>
          <div className="flex flex-wrap gap-2.5 pt-2">
            {lectureHighlights.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-slate-950 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800"
              >
                {topic}
              </span>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 py-8 text-center text-xs text-slate-500 space-y-2">
          <p>© {new Date().getFullYear()} Interview Prep AI • Built for technical and behavioral interview excellence.</p>
          <div className="flex justify-center gap-4 text-slate-600 font-medium">
            <Link to="/login" className="hover:text-slate-950">Login</Link>
            <span>•</span>
            <Link to="/register" className="hover:text-slate-950">Register</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;

