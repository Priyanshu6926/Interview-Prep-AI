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
  const difficulty = question.difficulty || null;
  const questionType = question.questionType || null;

  return (
    <div
      className={clsx(
        "rounded-[24px] border bg-white px-5 py-4 transition",
        isActive ? "border-brand-200 shadow-soft" : "border-slate-100"
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <button onClick={onSelect} className="flex-1 text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg font-semibold text-slate-400">Q</span>
            <div>
              <p className="text-lg font-medium text-slate-900">{question.question}</p>

              {/* Difficulty and Question Type badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {difficulty && (
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      DIFFICULTY_STYLES[difficulty] || "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                  >
                    {difficulty}
                  </span>
                )}
                {questionType && (
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      TYPE_STYLES[questionType] || "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                  >
                    {questionType}
                  </span>
                )}
                {question.tags?.length > 0 && (
                  <p className="text-xs text-slate-400">{question.tags.join(", ")}</p>
                )}
              </div>
            </div>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={speakingId === question._id ? onStopSpeak : onSpeak}
            className={clsx(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
              speakingId === question._id ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"
            )}
            title={speakingId === question._id ? "Stop audio" : "Ask question aloud"}
          >
            {speakingId === question._id ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onStartAnswer}
            className={clsx(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
              listeningId === question._id ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
            )}
            title="Answer with voice"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            onClick={onExplain}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
          >
            <Sparkles className="h-4 w-4" />
            {isExplaining ? "Thinking..." : "Learn More"}
          </button>
          <button
            onClick={onTogglePin}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            title={question.isPinned ? "Unpin question" : "Pin question"}
          >
            {question.isPinned ? <Pin className="h-4 w-4 text-brand-500" /> : <PinOff className="h-4 w-4" />}
          </button>
          <button
            onClick={onSelect}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            title="Open answer"
          >
            <ChevronDown className={clsx("h-4 w-4 transition", isActive && "rotate-180")} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionAccordion;
