import { useEffect, useState } from "react";
import { Clock, Pause, Play, RotateCcw } from "lucide-react";
import clsx from "clsx";

function InterviewTimer() {
  const [duration, setDuration] = useState(180); // Default 3 mins (180s)
  const [timeLeft, setTimeLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const handleSelectPreset = (seconds) => {
    setIsRunning(false);
    setDuration(seconds);
    setTimeLeft(seconds);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const formatMinutes = Math.floor(timeLeft / 60);
  const formatSeconds = timeLeft % 60;
  const isLowTime = timeLeft > 0 && timeLeft <= 30;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Clock className="h-4 w-4 text-brand-600" />
          <span>Practice Timer</span>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1">
          {[
            { label: "2m", secs: 120 },
            { label: "3m", secs: 180 },
            { label: "5m", secs: 300 }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(preset.secs)}
              className={clsx(
                "rounded-lg px-2 py-0.5 text-[11px] font-semibold transition",
                duration === preset.secs
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {/* Big Digit Display */}
        <div
          className={clsx(
            "font-mono text-2xl font-bold tracking-tight transition-colors",
            isLowTime ? "text-rose-600 animate-pulse" : "text-slate-950"
          )}
        >
          {String(formatMinutes).padStart(2, "0")}:{String(formatSeconds).padStart(2, "0")}
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={clsx(
              "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition",
              isRunning ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-950 hover:bg-slate-800"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Start
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 transition"
            title="Reset timer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewTimer;
