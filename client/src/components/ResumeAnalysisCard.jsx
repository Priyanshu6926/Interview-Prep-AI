import { AlertTriangle, CheckCircle, FileText, Lightbulb, RefreshCw } from "lucide-react";
import clsx from "clsx";

function ResumeAnalysisCard({ analysis, onReAnalyze, isAnalyzing }) {
  if (!analysis) return null;

  const { atsScore = 0, matchingSkills = [], missingKeywords = [], projectRelevance = "", recommendations = [] } = analysis;

  const scoreColor =
    atsScore >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    atsScore >= 60 ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-rose-600 bg-rose-50 border-rose-200";

  return (
    <div className="rounded-[28px] border border-brand-100 bg-gradient-to-br from-brand-50/60 to-white p-6 shadow-soft space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-100/80 p-3 text-brand-700">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">AI Resume & ATS Gap Analysis</h3>
            <p className="text-xs text-slate-500">Evaluated against targeted job role & experience requirements</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={clsx("flex items-center gap-2 rounded-2xl border px-4 py-2 text-center", scoreColor)}>
            <span className="text-xs font-semibold uppercase tracking-wider">ATS Match</span>
            <span className="text-2xl font-bold">{atsScore}%</span>
          </div>

          {onReAnalyze && (
            <button
              onClick={onReAnalyze}
              disabled={isAnalyzing}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              title="Re-run ATS match analysis"
            >
              <RefreshCw className={clsx("h-4 w-4", isAnalyzing && "animate-spin")} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Matching Skills */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Matching Role Skills ({matchingSkills.length})
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {matchingSkills.length ? (
              matchingSkills.map((skill) => (
                <span key={skill} className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-800">
                  ✓ {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500">No strong matches detected.</p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wide">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Missing Industry Keywords ({missingKeywords.length})
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {missingKeywords.length ? (
              missingKeywords.map((kw) => (
                <span key={kw} className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
                  + {kw}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500">No critical keyword gaps found!</p>
            )}
          </div>
        </div>
      </div>

      {/* Project Relevance */}
      {projectRelevance && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Project Portfolio Fit</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{projectRelevance}</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-2xl bg-brand-50/50 border border-brand-100 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-800 uppercase tracking-wide">
            <Lightbulb className="h-4 w-4 text-brand-600" />
            Prep Recommendations
          </div>
          <ul className="mt-2 space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-brand-500 font-bold">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalysisCard;
