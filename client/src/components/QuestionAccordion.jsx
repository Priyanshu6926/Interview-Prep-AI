import { ChevronDown, Mic, Pin, PinOff, Sparkles, Square, Volume2 } from "lucide-react";
import clsx from "clsx";

const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-rose-50 text-rose-700 border-rose-200"
};

const TYPE_STYLES = {
  Technical: "bg-blue-50 text-blue-700 border-blue-200",
  Behavioral: "bg-purple-50 text-purple-700 border-purple-200",
  "System Design": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Coding: "bg-orange-50 text-orange-700 border-orange-200"
};

function QuestionAccordion({
  question,
  isActive,
  onSelect,
  onTogglePin,
  onExplain,
  onSpeak,
  onStopSpeak,
  onStartAnswer,
  isExplaining,
  speakingId,
  listeningId
}) {
  const difficulty = question.difficulty || "Medium";
  const questionType = question.questionType || "Technical";

  return (
    <div
      className={clsx(
        "rounded-[24px] border bg-white p-5 transition shadow-sm hover:shadow-md",
        isActive ? "border-brand-400 ring-2 ring-brand-100 bg-brand-50/20" : "border-slate-100 hover:border-slate-200"
      )}
    >
      {/* Top Section: Full Width Question Text */}
      <div className="w-full">
        <button onClick={onSelect} className="w-full text-left group">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-700 transition">
              Q
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold leading-6 text-slate-900 group-hover:text-brand-700 transition break-words">
                {question.question}
              </h3>

              {/* Difficulty, Question Type & Topic Badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={clsx(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    DIFFICULTY_STYLES[difficulty] || "bg-slate-50 text-slate-700 border-slate-200"
                  )}
                >
                  {difficulty}
                </span>
                <span
                  className={clsx(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    TYPE_STYLES[questionType] || "bg-slate-50 text-slate-700 border-slate-200"
                  )}
                >
                  {questionType}
                </span>
                {question.tags?.length > 0 && (
                  <span className="text-xs text-slate-400 truncate max-w-[200px]">
                    {question.tags.join(" • ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Action Bar: Dedicated bottom toolbar so text is never squeezed */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Learn More Button */}
          <button
            onClick={onExplain}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isExplaining ? "Thinking..." : "Learn More"}
          </button>

          {/* Voice Answer Button */}
          <button
            onClick={onStartAnswer}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
              listeningId === question._id
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            )}
            title="Answer with voice"
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Answer</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Speak Question Button */}
          <button
            onClick={speakingId === question._id ? onStopSpeak : onSpeak}
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-xl border transition",
              speakingId === question._id ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
            title={speakingId === question._id ? "Stop audio" : "Ask question aloud"}
          >
            {speakingId === question._id ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {/* Pin Button */}
          <button
            onClick={onTogglePin}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            title={question.isPinned ? "Unpin question" : "Pin question"}
          >
            {question.isPinned ? <Pin className="h-3.5 w-3.5 text-brand-500 fill-brand-500" /> : <PinOff className="h-3.5 w-3.5" />}
          </button>

          {/* Toggle / View Detail Button */}
          <button
            onClick={onSelect}
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-xl border transition",
              isActive ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
            title="Open question details"
          >
            <ChevronDown className={clsx("h-4 w-4 transition-transform duration-200", isActive && "rotate-180")} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionAccordion;
