export function SessionSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-slate-100 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-32 rounded-lg bg-slate-100" />
        </div>
        <div className="h-8 w-24 rounded-full bg-slate-100" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-100" />
        <div className="h-6 w-24 rounded-full bg-slate-100" />
        <div className="h-6 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function ExerciseSkeleton() {
  return (
    <div className="animate-pulse rounded-[24px] border border-slate-100 bg-white p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-5 w-40 rounded-lg bg-slate-200" />
        <div className="h-5 w-16 rounded-full bg-slate-100" />
      </div>
      <div className="h-4 w-28 rounded-lg bg-slate-100" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="animate-pulse glass-panel p-5 space-y-3">
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="h-8 w-16 rounded-lg bg-slate-300" />
    </div>
  );
}

export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-2.5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-slate-100" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}
