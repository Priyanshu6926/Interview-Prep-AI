import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const defaultForm = {
  role: "Frontend Developer",
  experience: 2,
  focusAreas: "React.js, DOM manipulation, CSS Flexbox, System Design basics"
};

const ROLE_PRESETS = [
  { role: "Frontend Developer", focus: "React.js, State Management, CSS Architecture, Web Performance" },
  { role: "Backend Developer", focus: "Node.js, REST APIs, MongoDB, Distributed Caching, Security" },
  { role: "Full Stack Developer", focus: "Full Stack Architecture, Auth, Database Optimization, CI/CD" },
  { role: "System Design Engineer", focus: "Scalability, Microservices, Message Queues, Sharding, High Availability" },
  { role: "AI & ML Engineer", focus: "LLM Fine-Tuning, Prompt Engineering, RAG Pipelines, Vector DBs" }
];

function CreateSessionPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(defaultForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      role: preset.role,
      focusAreas: preset.focus
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a valid PDF document.");
        e.target.value = "";
        setResumeFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Resume file exceeds 5MB limit. Please upload a smaller PDF.");
        e.target.value = "";
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
      toast.info(`Uploaded: ${file.name}`);
    } else {
      setResumeFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.role.trim()) {
      setError("Please specify a job role.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("role", form.role.trim());
      formData.append("experience", String(form.experience));
      form.focusAreas
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => formData.append("focusAreas", item));

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const { data } = await api.post("/sessions", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Interview session generated successfully!");
      navigate(`/app/sessions/${data.session._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to create the session right now.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-soft space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            <Wand2 className="h-3.5 w-3.5" />
            Session Builder
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Generate a tailored interview drill.</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Tell the AI the target job title, seniority level, and key concepts. Each session synthesizes 5 initial questions with comprehensive model answers.
          </p>
        </div>

        {/* Role Quick-Select Presets */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Track Presets</p>
          <div className="flex flex-col gap-2">
            {ROLE_PRESETS.map((preset) => (
              <button
                key={preset.role}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`rounded-2xl border p-3 text-left transition ${
                  form.role === preset.role
                    ? "border-brand-400 bg-white/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <p className="text-xs font-bold text-white">{preset.role}</p>
                <p className="text-[11px] text-slate-400 line-clamp-1">{preset.focus}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Target Job Role</label>
            <input
              className="input-field"
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              placeholder="e.g. Senior Frontend Engineer"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Years of Experience</label>
            <input
              className="input-field"
              type="number"
              min="0"
              max="25"
              value={form.experience}
              onChange={(event) => setForm((current) => ({ ...current, experience: Number(event.target.value) }))}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Focus Areas &amp; Topics <span className="text-xs text-slate-400">(comma separated)</span>
            </label>
            <textarea
              className="input-field min-h-28 resize-y"
              value={form.focusAreas}
              onChange={(event) => setForm((current) => ({ ...current, focusAreas: event.target.value }))}
              placeholder="React.js, TypeScript, Distributed Systems, STAR Behavioral"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Upload PDF Resume (Optional)</span>
              <span className="text-xs text-slate-400">Max 5MB PDF</span>
            </label>
            <div className="relative">
              <input
                className="input-field file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 file:transition cursor-pointer"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Extracts skills and projects to bias question generation and compute your ATS match percentage.
            </p>
          </div>

          {error ? <p className="text-sm text-rose-500">{error}</p> : null}

          <button
            type="submit"
            className="primary-button w-full sm:w-auto inline-flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Synthesizing Interview Session with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Create Interview Drill</span>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

export default CreateSessionPage;

