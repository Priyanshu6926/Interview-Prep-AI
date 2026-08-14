import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  LineChart,
  Pin,
  Sparkles,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import api from "../services/api";
import { StatSkeleton } from "../components/SkeletonCard";

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get("/sessions/analytics");
        setData(res.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load progress analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const summary = data?.summary || {};
  const breakdown = data?.breakdownAverages || {};
  const rolesSummary = data?.rolesSummary || [];
  const scoreHistory = data?.scoreHistory || [];
  const pinnedQuestions = data?.pinnedQuestions || [];

  const getReadinessLevel = (avg) => {
    if (avg === null || avg === undefined) return { label: "No Attempts Yet", color: "text-slate-500 bg-slate-100 border-slate-200" };
    if (avg >= 85) return { label: "Interview Ready", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (avg >= 65) return { label: "Solid Foundation", color: "text-brand-700 bg-brand-50 border-brand-200" };
    return { label: "Developing Skills", color: "text-amber-700 bg-amber-50 border-amber-200" };
  };

  const readiness = getReadinessLevel(summary.averageScore);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
              <BarChart3 className="h-3.5 w-3.5" />
              Skill Intelligence
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Performance & Readiness Analytics</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Track your preparation trajectory, identify knowledge gaps across 4 evaluation pillars, and monitor performance by job role.
            </p>
          </div>
          {summary.averageScore !== null && summary.averageScore !== undefined && (
            <div className="flex flex-col items-end rounded-3xl bg-white/5 border border-white/10 p-5 text-right">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Readiness Status</span>
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold ${readiness.color}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {readiness.label}
              </span>
              <span className="mt-2 text-3xl font-bold text-white">{summary.averageScore}/100</span>
            </div>
          )}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <article className="glass-panel p-5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm font-medium">Total Sessions</span>
                <BookOpen className="h-5 w-5 text-brand-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">{summary.totalSessions || 0}</p>
              <p className="mt-1 text-xs text-slate-500">{summary.totalQuestions || 0} total questions generated</p>
            </article>

            <article className="glass-panel p-5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm font-medium">Evaluated Attempts</span>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">{summary.totalAttempts || 0}</p>
              <p className="mt-1 text-xs text-slate-500">
                {summary.bestScore !== null ? `Best score: ${summary.bestScore}/100` : "No attempts scored"}
              </p>
            </article>

            <article className="glass-panel p-5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm font-medium">Average Score</span>
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">
                {summary.averageScore !== null && summary.averageScore !== undefined ? `${summary.averageScore}/100` : "N/A"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Across all evaluated answers</p>
            </article>

            <article className="glass-panel p-5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm font-medium">Pinned for Review</span>
                <Pin className="h-5 w-5 text-rose-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">{summary.totalPinned || 0}</p>
              <p className="mt-1 text-xs text-slate-500">Priority study list items</p>
            </article>
          </>
        )}
      </div>

      {/* 2-Column Analytics Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 4-Pillar Evaluation Breakdown */}
        <section className="glass-panel p-6 sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Evaluation Dimensions</h2>
              <p className="text-xs text-slate-500">Average performance across AI evaluation criteria</p>
            </div>
            <Target className="h-5 w-5 text-brand-500" />
          </div>

          <div className="mt-6 space-y-5">
            {[
              {
                label: "Technical Accuracy",
                value: breakdown.technicalAccuracy,
                desc: "Depth and correctness of concepts and terminology",
                color: "bg-brand-500"
              },
              {
                label: "Communication Clarity",
                value: breakdown.communicationClarity,
                desc: "Conciseness, clarity, and articulation",
                color: "bg-emerald-500"
              },
              {
                label: "Problem Solving Structure",
                value: breakdown.problemSolvingStructure,
                desc: "Frameworks (STAR, trade-offs, step-by-step logic)",
                color: "bg-amber-500"
              },
              {
                label: "Answer Completeness",
                value: breakdown.completeness,
                desc: "Addressing all constraints and edge cases",
                color: "bg-purple-500"
              }
            ].map((pillar) => (
              <div key={pillar.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">{pillar.label}</span>
                    <p className="text-xs text-slate-500">{pillar.desc}</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    {pillar.value !== null && pillar.value !== undefined ? `${pillar.value}%` : "—"}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${pillar.color}`}
                    style={{ width: `${pillar.value || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Score History Trajectory */}
        <section className="glass-panel p-6 sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Score Trajectory</h2>
              <p className="text-xs text-slate-500">Your last {scoreHistory.length} spoken & evaluated answers</p>
            </div>
            <LineChart className="h-5 w-5 text-brand-500" />
          </div>

          {scoreHistory.length ? (
            <div className="mt-6">
              <div className="flex h-44 items-end gap-2 border-b border-slate-100 pb-3">
                {scoreHistory.map((item, idx) => (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center gap-1.5">
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute -top-12 z-20 hidden rounded-xl bg-slate-950 px-2.5 py-1 text-center text-xs text-white shadow-lg group-hover:block whitespace-nowrap">
                      <p className="font-bold">{item.score}/100</p>
                      <p className="text-[10px] text-slate-400">{item.role}</p>
                    </div>

                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        item.score >= 80 ? "bg-emerald-500" : item.score >= 60 ? "bg-amber-400" : "bg-rose-400"
                      }`}
                      style={{ height: `${Math.max(item.score, 15)}%` }}
                    />
                    <span className="text-[10px] text-slate-400">{item.score}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Older attempts</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> 80+ Ready
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> 60-79 Solid
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-400" /> &lt;60 Practice
                  </span>
                </div>
                <span>Latest</span>
              </div>
            </div>
          ) : (
            <div className="flex h-52 flex-col items-center justify-center text-center">
              <p className="text-sm text-slate-500">No attempts evaluated yet.</p>
              <Link to="/app/sessions/new" className="primary-button mt-4 text-xs">
                Start an interview drill
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Role Breakdown & Pinned Questions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role Breakdown */}
        <section className="glass-panel p-6 sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Performance by Role Track</h2>
              <p className="text-xs text-slate-500">Average scores across different disciplines</p>
            </div>
            <Users className="h-5 w-5 text-brand-500" />
          </div>

          <div className="mt-5 space-y-3">
            {rolesSummary.length ? (
              rolesSummary.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-slate-200"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{item.role}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.sessionCount} sessions • {item.attemptCount} evaluated attempts
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      item.averageScore >= 80
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : item.averageScore >= 60
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {item.averageScore !== null ? `Avg ${item.averageScore}/100` : "No scores"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Create sessions to see role performance breakdowns.</p>
            )}
          </div>
        </section>

        {/* Pinned Questions Quick Access */}
        <section className="glass-panel p-6 sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Pinned Question Backlog</h2>
              <p className="text-xs text-slate-500">Quickly jump back into questions marked for review</p>
            </div>
            <Pin className="h-5 w-5 text-rose-500" />
          </div>

          <div className="mt-5 space-y-3 max-h-80 overflow-y-auto">
            {pinnedQuestions.length ? (
              pinnedQuestions.map((q) => (
                <Link
                  key={q.questionId}
                  to={`/app/sessions/${q.sessionId}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-brand-200 hover:shadow-soft"
                >
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-slate-950 line-clamp-1">{q.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {q.role}
                      </span>
                      <span className="text-xs text-slate-400">{q.difficulty}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Pin tricky questions inside any interview session to build your review backlog.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AnalyticsPage;
