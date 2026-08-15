import { useEffect, useMemo, useState } from "react";
import { ExternalLink, PlayCircle } from "lucide-react";
import api from "../services/api";

function ResourcesPage() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchLectures = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/resources/lectures");
        setLectures(data.lectures);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load lecture resources.");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(lectures.map((l) => l.category));
    return ["All", ...Array.from(set)];
  }, [lectures]);

  const filteredLectures = useMemo(() => {
    if (selectedCategory === "All") return lectures;
    return lectures.filter((l) => l.category === selectedCategory);
  }, [lectures, selectedCategory]);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-100">Learning resources</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Curated lectures for deeper interview preparation.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Reinforce foundational concepts, system architecture blueprints, and behavioral strategies before drilling with AI mock sessions.
        </p>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-white text-slate-950 shadow-soft"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {error ? <p className="text-sm text-rose-500">{error}</p> : null}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse glass-panel overflow-hidden p-0 space-y-4">
              <div className="h-48 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-24 rounded-full bg-slate-200" />
                <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))
        ) : filteredLectures.length ? (
          filteredLectures.map((lecture) => (
            <article key={lecture._id} className="glass-panel overflow-hidden p-0 flex flex-col justify-between transition hover:border-brand-200 hover:shadow-soft">
              <div>
                <div className="h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={lecture.thumbnail}
                    alt={lecture.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                    <PlayCircle className="h-3.5 w-3.5" />
                    {lecture.category}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-slate-950 line-clamp-2">{lecture.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">{lecture.description}</p>
                </div>
              </div>
              <div className="px-6 pb-6">
                <a
                  href={lecture.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
                >
                  <span>Watch lecture</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
            No lectures found for category &ldquo;{selectedCategory}&rdquo;.
          </div>
        )}
      </section>
    </div>
  );
}

export default ResourcesPage;
