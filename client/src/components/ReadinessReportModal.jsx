import { Award, CheckCircle2, Download, Printer, X } from "lucide-react";
import { formatDate } from "../utils/formatters";

function ReadinessReportModal({ session, onClose }) {
  if (!session) return null;

  const questions = session.questions || [];
  const evaluatedQuestions = questions.filter((q) => q.lastEvaluation?.overallScore != null || q.lastEvaluation?.score != null);
  const attempts = questions.flatMap((q) => q.attempts || []);
  const scores = attempts.map((a) => a.overallScore ?? a.score ?? 0).filter((s) => s > 0);
  const avgScore = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null;
  const bestScore = scores.length ? Math.max(...scores) : null;

  // Aggregate pillar averages
  const pillarTotals = attempts.reduce(
    (acc, a) => {
      if (a.scoreBreakdown) {
        if (a.scoreBreakdown.technicalAccuracy) { acc.tech += a.scoreBreakdown.technicalAccuracy; acc.techCount++; }
        if (a.scoreBreakdown.communicationClarity) { acc.comm += a.scoreBreakdown.communicationClarity; acc.commCount++; }
        if (a.scoreBreakdown.problemSolvingStructure) { acc.ps += a.scoreBreakdown.problemSolvingStructure; acc.psCount++; }
        if (a.scoreBreakdown.completeness) { acc.comp += a.scoreBreakdown.completeness; acc.compCount++; }
      }
      return acc;
    },
    { tech: 0, techCount: 0, comm: 0, commCount: 0, ps: 0, psCount: 0, comp: 0, compCount: 0 }
  );

  const pillars = [
    { label: "Technical Accuracy", score: pillarTotals.techCount ? Math.round(pillarTotals.tech / pillarTotals.techCount) : "–" },
    { label: "Communication Clarity", score: pillarTotals.commCount ? Math.round(pillarTotals.comm / pillarTotals.commCount) : "–" },
    { label: "Problem Solving", score: pillarTotals.psCount ? Math.round(pillarTotals.ps / pillarTotals.psCount) : "–" },
    { label: "Completeness", score: pillarTotals.compCount ? Math.round(pillarTotals.comp / pillarTotals.compCount) : "–" }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto print:bg-white print:p-0 print:static print:overflow-visible">
      <div className="relative w-full max-w-4xl rounded-[32px] bg-white p-8 shadow-2xl space-y-6 print:shadow-none print:p-0 print:max-w-none">

        {/* Modal Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-semibold text-slate-950">Candidate Readiness Report</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="primary-button text-sm py-2">
              <Printer className="mr-2 h-4 w-4" />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
              Interview Readiness Evaluation
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{session.role}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Experience Level: {session.experience} Years • Focus: {session.focusAreas.join(", ")}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Overall Readiness</p>
              <p className="mt-1 text-4xl font-extrabold text-slate-900">{avgScore !== null ? `${avgScore}/100` : "N/A"}</p>
            </div>
            {bestScore !== null && (
              <div className="border-l border-slate-200 pl-4">
                <p className="text-xs font-semibold uppercase text-emerald-600">Personal Best</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{bestScore}/100</p>
              </div>
            )}
          </div>
        </div>

        {/* 4-Pillar Scorecard Grid */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-3">4-Pillar Skill Evaluation</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pillars.map(({ label, score }) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{typeof score === "number" ? `${score}/100` : score}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Session Stats Summary */}
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center text-sm">
          <div>
            <p className="text-xs text-slate-500">Total Questions</p>
            <p className="mt-1 font-semibold text-slate-900">{questions.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Evaluated Answers</p>
            <p className="mt-1 font-semibold text-slate-900">{evaluatedQuestions.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Practice Attempts</p>
            <p className="mt-1 font-semibold text-slate-900">{attempts.length}</p>
          </div>
        </div>

        {/* Question Evaluation Breakdown */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-3">Question History & Ratings</h3>
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const evalData = q.lastEvaluation;
              return (
                <div key={q._id || idx} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Q{idx + 1}. {q.question}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>{q.difficulty}</span> • <span>{q.questionType}</span>
                      </div>
                    </div>
                    {evalData?.overallScore != null || evalData?.score != null ? (
                      <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                        {evalData.overallScore ?? evalData.score}/100
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">Unanswered</span>
                    )}
                  </div>

                  {evalData?.feedback && (
                    <p className="mt-2 text-xs leading-5 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      {evalData.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          Report generated by Interview Prep AI • {formatDate(new Date())}
        </div>
      </div>
    </div>
  );
}

export default ReadinessReportModal;
