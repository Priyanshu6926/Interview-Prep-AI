import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  Lightbulb,
  Loader2,
  PlayCircle,
  XCircle
} from "lucide-react";
import clsx from "clsx";
import api from "../services/api";
import { ExerciseSkeleton } from "../components/SkeletonCard";

// ─── Language Configuration ───────────────────────────────────────────────────

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", monacoLang: "javascript", ext: "js" },
  { id: "typescript", label: "TypeScript", monacoLang: "typescript", ext: "ts" },
  { id: "python", label: "Python", monacoLang: "python", ext: "py" },
  { id: "cpp", label: "C++", monacoLang: "cpp", ext: "cpp" }
];

/**
 * Returns a basic language-specific starter code template for an exercise.
 * Falls back to JS starter code for languages that don't have a dedicated template.
 */
function getStarterCodeForLanguage(exercise, language) {
  if (!exercise) return "";

  if (language === "javascript" || language === "typescript") {
    return exercise.starterCode || `function ${exercise.functionName}() {\n  // write your solution here\n}\n`;
  }

  if (language === "python") {
    // Convert JS function name to snake_case heuristically
    const snakeName = exercise.functionName
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "");
    return `def ${snakeName}(${exercise.testCases?.[0]?.args?.map((_, i) => `arg${i}`).join(", ") || ""}):\n    # write your solution here\n    pass\n`;
  }

  if (language === "cpp") {
    return `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\n// write your solution here\nauto ${exercise.functionName}() {\n    return true;\n}\n`;
  }

  return exercise.starterCode || "";
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-rose-50 text-rose-700 border-rose-200"
};

// ─── Test Result Card ─────────────────────────────────────────────────────────

function TestResultCard({ result, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={clsx(
        "rounded-2xl border p-4 transition",
        result.passed
          ? "border-emerald-200 bg-emerald-50"
          : "border-rose-200 bg-rose-50"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 text-rose-500" />
          )}
          <p className="text-sm font-semibold text-slate-900">
            Test {index + 1} — {result.passed ? "Passed" : "Failed"}
          </p>
        </div>
        {!result.passed && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {expanded ? "Hide" : "Details"}
          </button>
        )}
      </div>

      {result.explanation && (
        <p className="mt-1 text-xs text-slate-500">{result.explanation}</p>
      )}

      {(expanded || result.passed) && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-baseline gap-2 text-xs">
            <span className="w-14 shrink-0 font-semibold text-slate-500">Input</span>
            <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-slate-700">
              {result.input}
            </code>
          </div>
          <div className="flex items-baseline gap-2 text-xs">
            <span className="w-14 shrink-0 font-semibold text-slate-500">Expected</span>
            <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-emerald-700">
              {result.expected}
            </code>
          </div>
          {!result.passed && (
            <div className="flex items-baseline gap-2 text-xs">
              <span className="w-14 shrink-0 font-semibold text-slate-500">Got</span>
              <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-rose-600">
                {result.error || result.actual || "undefined"}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function CodingLabPage() {
  const [exercises, setExercises] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ role: "", difficulty: "" });
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exercisesError, setExercisesError] = useState("");

  // AI states
  const [running, setRunning] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [complexityLoading, setComplexityLoading] = useState(false);
  const [hints, setHints] = useState([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [complexity, setComplexity] = useState(null);
  const [runError, setRunError] = useState("");

  const editorRef = useRef(null);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoadingExercises(true);
      setExercisesError("");
      try {
        const { data } = await api.get("/coding/exercises");
        setExercises(data.exercises);
        const first = data.exercises[0] || null;
        if (first) {
          setSelectedId(first._id);
          setCode(getStarterCodeForLanguage(first, "javascript"));
        }
      } catch (err) {
        setExercisesError(err.response?.data?.message || "Failed to load coding exercises. Please ensure the backend is running.");
      } finally {
        setLoadingExercises(false);
      }
    };
    fetchExercises();
  }, []);

  const filteredExercises = useMemo(
    () =>
      exercises.filter((exercise) => {
        const roleMatch = !filters.role || exercise.role === filters.role;
        const difficultyMatch = !filters.difficulty || exercise.difficulty === filters.difficulty;
        return roleMatch && difficultyMatch;
      }),
    [exercises, filters]
  );

  const selectedExercise = useMemo(
    () => filteredExercises.find((item) => item._id === selectedId) || filteredExercises[0] || null,
    [filteredExercises, selectedId]
  );

  // When exercise or language changes, reset code + results
  const handleSelectExercise = (exercise) => {
    setSelectedId(exercise._id);
    setCode(getStarterCodeForLanguage(exercise, language));
    setResults([]);
    setSummary(null);
    setHints([]);
    setHintIndex(0);
    setComplexity(null);
    setRunError("");
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (selectedExercise) {
      setCode(getStarterCodeForLanguage(selectedExercise, newLang));
      setResults([]);
      setSummary(null);
      setComplexity(null);
      setRunError("");
    }
  };

  // ── Run Code via Piston ───────────────────────────────────────────────────
  const runCode = async () => {
    if (!selectedExercise || !code.trim()) return;
    setRunning(true);
    setResults([]);
    setSummary(null);
    setComplexity(null);
    setRunError("");
    try {
      const { data } = await api.post("/coding/execute", {
        code,
        language,
        exerciseId: selectedExercise._id
      });
      setResults(data.results);
      setSummary(data.summary);
    } catch (err) {
      setRunError(err.response?.data?.message || "Execution failed. Check your code and try again.");
    } finally {
      setRunning(false);
    }
  };

  // ── Progressive Hint ──────────────────────────────────────────────────────
  const getNextHint = async () => {
    if (!selectedExercise || hintIndex >= 3) return;
    setHintLoading(true);
    try {
      const { data } = await api.post("/coding/hint", {
        code,
        language,
        exerciseId: selectedExercise._id,
        hintIndex
      });
      setHints((prev) => [...prev, data.hint]);
      setHintIndex((prev) => prev + 1);
    } finally {
      setHintLoading(false);
    }
  };

  // ── Complexity Analysis ───────────────────────────────────────────────────
  const analyzeComplexity = async () => {
    if (!code.trim()) return;
    setComplexityLoading(true);
    try {
      const { data } = await api.post("/coding/complexity", {
        code,
        language,
        exerciseId: selectedExercise?._id
      });
      setComplexity(data.analysis);
    } finally {
      setComplexityLoading(false);
    }
  };

  const monacoLang = LANGUAGES.find((l) => l.id === language)?.monacoLang || "javascript";

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      {/* ── Left Panel: Exercise List ────────────────────────────────── */}
      <section className="space-y-5">
        <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
          <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            Live Coding Lab
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Practice real interview problems with live execution.
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Write code in your preferred language, run it against real test cases via a
            sandboxed execution engine, and get AI complexity analysis and progressive hints.
          </p>
        </div>

        <div className="glass-panel p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="input-field"
              value={filters.role}
              onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="">All roles</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
            </select>
            <select
              className="input-field"
              value={filters.difficulty}
              onChange={(event) =>
                setFilters((current) => ({ ...current, difficulty: event.target.value }))
              }
            >
              <option value="">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="mt-5 space-y-3">
            {loadingExercises ? (
              <>
                <ExerciseSkeleton />
                <ExerciseSkeleton />
                <ExerciseSkeleton />
              </>
            ) : null}

            {exercisesError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-5 text-rose-700">
                {exercisesError}
              </div>
            ) : null}

            {!loadingExercises &&
              !exercisesError &&
              filteredExercises.map((exercise) => (
                <button
                  key={exercise._id}
                  onClick={() => handleSelectExercise(exercise)}
                  className={clsx(
                    "w-full rounded-[24px] border p-4 text-left transition",
                    selectedId === exercise._id
                      ? "border-brand-200 bg-brand-50 shadow-soft"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{exercise.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{exercise.role}</p>
                    </div>
                    <span
                      className={clsx(
                        "rounded-full border px-3 py-1 text-xs font-semibold",
                        DIFFICULTY_STYLES[exercise.difficulty] ||
                          "bg-slate-100 text-slate-700 border-slate-200"
                      )}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* ── Right Panel: Editor + Results ───────────────────────────── */}
      <section className="glass-panel overflow-hidden p-0">
        {selectedExercise ? (
          <>
            {/* Problem Header */}
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-600">
                <Code2 className="h-4 w-4" />
                {selectedExercise.role}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{selectedExercise.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{selectedExercise.prompt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedExercise.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Language Switcher + Editor */}
            <div className="border-b border-slate-100">
              {/* Language tabs */}
              <div className="flex items-center gap-1 border-b border-slate-100 px-4 pt-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={clsx(
                      "rounded-t-lg px-4 py-2 text-sm font-medium transition",
                      language === lang.id
                        ? "border border-b-white border-slate-200 bg-white text-slate-900 -mb-px"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Monaco Editor */}
              <div className="h-[380px]">
                <Editor
                  height="100%"
                  language={monacoLang}
                  theme="vs-light"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  onMount={(editor) => { editorRef.current = editor; }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    lineNumbersMinChars: 3
                  }}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-b border-slate-100 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={runCode}
                  disabled={running || !code.trim()}
                  className="primary-button"
                >
                  {running ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  {running ? "Running…" : "Run Code"}
                </button>

                <button
                  onClick={getNextHint}
                  disabled={hintLoading || hintIndex >= 3}
                  className="secondary-button"
                >
                  {hintLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lightbulb className="mr-2 h-4 w-4" />
                  )}
                  {hintIndex >= 3 ? "No more hints" : `Get Hint ${hintIndex > 0 ? hintIndex + 1 : ""}`}
                </button>

                {results.length > 0 && (
                  <button
                    onClick={analyzeComplexity}
                    disabled={complexityLoading}
                    className="secondary-button"
                  >
                    {complexityLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Cpu className="mr-2 h-4 w-4" />
                    )}
                    Analyze Complexity
                  </button>
                )}

                {/* Run Summary Badge */}
                {summary && (
                  <div
                    className={clsx(
                      "ml-auto flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold",
                      summary.allPassed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    )}
                  >
                    {summary.allPassed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {summary.passed}/{summary.total} tests passed
                  </div>
                )}
              </div>

              {/* Runtime error */}
              {runError && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {runError}
                </div>
              )}
            </div>

            {/* Bottom panels: Results + AI panels */}
            <div className="p-6 space-y-5">
              {/* Test Results */}
              {results.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-900">Test Results</p>
                  <div className="space-y-3">
                    {results.map((result, index) => (
                      <TestResultCard key={index} result={result} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Progressive Hints */}
              {hints.length > 0 && (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                  <p className="mb-3 text-sm font-semibold text-amber-900">
                    <Lightbulb className="mr-1.5 inline h-4 w-4" />
                    Hints ({hints.length}/3)
                  </p>
                  <div className="space-y-3">
                    {hints.map((h, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            {h.hintLevel}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-amber-900">{h.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {hintIndex < 3 && (
                    <button
                      onClick={getNextHint}
                      disabled={hintLoading}
                      className="mt-4 flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900"
                    >
                      {hintLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      Next hint
                    </button>
                  )}
                </div>
              )}

              {/* Complexity Analysis */}
              {complexity && (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-3 text-sm font-semibold text-slate-900">
                    <Cpu className="mr-1.5 inline h-4 w-4" />
                    Complexity Analysis
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center">
                      <p className="text-xs font-medium text-slate-500">Time Complexity</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{complexity.timeComplexity}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center">
                      <p className="text-xs font-medium text-slate-500">Space Complexity</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{complexity.spaceComplexity}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{complexity.explanation}</p>
                  {complexity.canBeOptimized && complexity.optimizationHint && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{complexity.optimizationHint}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Static Hints (from DB) — shown before AI hints are requested */}
              {hints.length === 0 && results.length === 0 && selectedExercise.hints?.length > 0 && (
                <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Hints</p>
                  <div className="mt-3 space-y-2">
                    {selectedExercise.hints.map((hint, i) => (
                      <p key={i} className="text-sm leading-6 text-slate-600">
                        {i + 1}. {hint}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-6">
            <p className="text-sm text-slate-500">No coding exercises available yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default CodingLabPage;
