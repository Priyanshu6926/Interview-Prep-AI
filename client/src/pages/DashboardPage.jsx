import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  Code2,
  Filter,
  Pin,
  PlusCircle,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  UsersRound
} from "lucide-react";
import { useSessions } from "../hooks/useSessions";
import { useToast } from "../hooks/useToast";
import { badgeText, formatDate } from "../utils/formatters";
import ConfirmModal from "../components/ConfirmModal";
import { SessionSkeleton } from "../components/SkeletonCard";
import api from "../services/api";

function DashboardPage() {
  const { sessions, loading, error, removeSession } = useSessions();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, sessionId: null, deleting: false });

  const attempts = sessions.flatMap((session) => session.questions.flatMap((item) => item.attempts || []));
  const scores = attempts.map((attempt) => attempt.overallScore ?? attempt.score ?? 0).filter((s) => s > 0);
  const averageScore = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null;
  const bestScore = scores.length ? Math.max(...scores) : null;
  const latestTrend = scores.slice(-10);

  // Available roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const set = new Set(sessions.map((s) => s.role));
    return Array.from(set);
  }, [sessions]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesRole = !selectedRoleFilter || s.role === selectedRoleFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.role.toLowerCase().includes(query) ||
        (s.focusAreas || []).some((f) => f.toLowerCase().includes(query));
      return matchesRole && matchesSearch;
    });
  }, [sessions, selectedRoleFilter, searchQuery]);

  const openDeleteModal = (event, sessionId) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteModalState({ isOpen: true, sessionId, deleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.sessionId) return;
    setDeleteModalState((prev) => ({ ...prev, deleting: true }));
    try {
      await api.delete(`/sessions/${deleteModalState.sessionId}`);
      removeSession(deleteModalState.sessionId);
      toast.success("Session deleted successfully.");
      setDeleteModalState({ isOpen: false, sessionId: null, deleting: false });
    } catch {
      toast.error("Failed to delete session.");
      setDeleteModalState((prev) => ({ ...prev, deleting: false }));
    }
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <section className="space-y-6">
          <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
              Daily prep cockpit
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Turn interview practice into a repeatable system.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Create sessions by role and experience, listen to answers, pin tricky questions, and build a cleaner review loop.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/app/sessions/new" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft hover:bg-slate-100 transition">
                <PlusCircle className="h-4 w-4" />
                Create new session
              </Link>
              <Link to="/app/analytics" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 transition">
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="glass-panel p-5">
              <p className="text-sm text-slate-500">Total sessions</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">{sessions.length}</p>
            </article>
            <article className="glass-panel p-5">
              <p className="text-sm text-slate-500">Total attempts</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">{attempts.length}</p>
            </article>
            <article className="glass-panel p-5">
              <p className="text-sm text-slate-500">Readiness avg</p>
              <p className="mt-4 text-xl font-semibold text-slate-950">{averageScore != null ? `${averageScore}/100` : "No attempts yet"}</p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Link to="/app/coding-lab" className="glass-panel p-5 transition hover:border-brand-200 hover:shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Coding Lab</h2>
                  <p className="text-sm text-slate-500">Practice with runnable exercises inside the app.</p>
                </div>
              </div>
            </Link>
            <Link to="/app/mock-rooms" className="glass-panel p-5 transition hover:border-brand-200 hover:shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Mock Rooms</h2>
                  <p className="text-sm text-slate-500">Pair up for peer interviews with live prompts and WebRTC.</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Recent sessions</h2>
              <p className="text-sm text-slate-500">Open a session to review, pin, listen, and request deeper explanations.</p>
            </div>
            <Sparkles className="h-5 w-5 text-brand-500" />
          </div>

          {/* Voice Practice Trend */}
          <div className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Voice practice trend</p>
                <p className="text-sm text-slate-500">Latest readiness scores across your spoken attempts.</p>
              </div>
              <div className="flex items-center gap-3">
                {bestScore !== null && (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Best: {bestScore}/100
                  </span>
                )}
                <TrendingUp className="h-5 w-5 text-brand-500" />
              </div>
            </div>
            <div className="mt-4 flex h-28 items-end gap-2">
              {latestTrend.length ? (
                latestTrend.map((score, index) => (
                  <div key={`${score}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-2xl transition-all ${
                        score >= 80 ? "bg-emerald-500" : score >= 55 ? "bg-amber-400" : "bg-rose-400"
                      }`}
                      style={{ height: `${Math.max(score, 12)}%` }}
                    />
                    <span className="text-xs text-slate-500">{score}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No spoken answers evaluated yet.</p>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          {sessions.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sessions by role or topic..."
                  className="input-field pl-10 text-xs sm:text-sm"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {uniqueRoles.length > 1 && (
                <div className="relative sm:w-48">
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="input-field appearance-none pr-8 text-xs sm:text-sm"
                  >
                    <option value="">All Roles</option>
                    {uniqueRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <Filter className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              )}
            </div>
          )}

          {error ? <p className="mt-6 text-sm text-rose-500">{error}</p> : null}

          {/* Sessions List or Skeleton */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <>
                <SessionSkeleton />
                <SessionSkeleton />
                <SessionSkeleton />
              </>
            ) : null}

            {!loading && !sessions.length ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">No sessions yet. Start with a role and experience level, and the app will generate your first set.</p>
                <Link to="/app/sessions/new" className="primary-button mt-4">
                  Create your first session
                </Link>
              </div>
            ) : null}

            {!loading && sessions.length > 0 && !filteredSessions.length ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No sessions match your search filter.{" "}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRoleFilter("");
                  }}
                  className="font-semibold text-brand-600 underline ml-1"
                >
                  Clear filters
                </button>
              </div>
            ) : null}

            {!loading &&
              filteredSessions.map((session) => {
                const sessionAttempts = session.questions.flatMap((q) => q.attempts || []);
                const sessionScores = sessionAttempts.map((a) => a.overallScore ?? a.score ?? 0).filter((s) => s > 0);
                const sessionAvg = sessionScores.length
                  ? Math.round(sessionScores.reduce((sum, s) => sum + s, 0) / sessionScores.length)
                  : null;

                return (
                  <div
                    key={session._id}
                    className="rounded-[28px] border border-slate-100 bg-white p-5 transition hover:border-brand-200 hover:shadow-soft"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Link to={`/app/sessions/${session._id}`} className="text-xl font-semibold text-slate-950 hover:text-brand-600">
                          {session.role}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">{session.focusAreas.join(", ")}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{session.experience} years</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {badgeText(session.questions.length, "question")}
                          </span>
                          {sessionAvg !== null && (
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              sessionAvg >= 80 ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : sessionAvg >= 55 ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                            }`}>
                              Avg {sessionAvg}/100
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          {formatDate(session.updatedAt)}
                        </div>
                        <div className="flex items-center gap-2" title={`${session.questions.filter((item) => item.isPinned).length} pinned questions`}>
                          <Pin className="h-4 w-4 text-rose-500" />
                          {session.questions.filter((item) => item.isPinned).length}
                        </div>
                        <Link to={`/app/sessions/${session._id}`} className="inline-flex items-center">
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </Link>
                        <button
                          onClick={(event) => openDeleteModal(event, session._id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 text-rose-500 transition hover:bg-rose-50"
                          title="Delete session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      {/* Reusable Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Interview Session?"
        message="This will permanently remove this session, its AI questions, practice transcripts, and historical evaluation scores."
        confirmText="Delete Session"
        cancelText="Keep Session"
        loading={deleteModalState.deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, sessionId: null, deleting: false })}
      />
    </>
  );
}

export default DashboardPage;

