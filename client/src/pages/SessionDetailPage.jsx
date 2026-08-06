import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Award, BookText, Mic, MicOff, Pin, PlusCircle, Sparkles, Square, Volume2 } from "lucide-react";
import api from "../services/api";
import QuestionAccordion from "../components/QuestionAccordion";
import ResumeAnalysisCard from "../components/ResumeAnalysisCard";
import ReadinessReportModal from "../components/ReadinessReportModal";
import { formatDate } from "../utils/formatters";

const TOKEN_KEY = "interview-prep-token";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function parseRichExplanation(text) {
  if (!text) {
    return [];
  }

  const segments = text.split(/```/);
  return segments
    .map((segment, index) => {
      if (index % 2 === 1) {
        const lines = segment.split("\n");
        const firstLine = lines[0]?.trim() || "";
        const language = /^[a-zA-Z0-9#+.-]+$/.test(firstLine) ? firstLine : "";
        const code = language ? lines.slice(1).join("\n").trim() : segment.trim();
        return { type: "code", language: language || "text", content: code };
      }

      const paragraphs = segment
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      return paragraphs.length ? { type: "text", content: paragraphs } : null;
    })
    .filter(Boolean);
}

function SessionDetailPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [explanationLoadingId, setExplanationLoadingId] = useState(null);
  const [streamingExplanation, setStreamingExplanation] = useState("");
  const [isStreamingExplanation, setIsStreamingExplanation] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [listeningId, setListeningId] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [score, setScore] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [addingMore, setAddingMore] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const recognitionRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  const handleReAnalyzeResume = async () => {
    setIsAnalyzingResume(true);
    try {
      const { data } = await api.post(`/sessions/${sessionId}/analyze-resume`);
      setSession(data.session);
    } catch (err) {
      console.error("Resume re-analysis failed:", err);
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/sessions/${sessionId}`);
        setSession(data.session);
        setActiveQuestionId(data.session.questions[0]?._id || null);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this session.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const activeQuestion = useMemo(
    () => session?.questions.find((item) => item._id === activeQuestionId) || session?.questions[0],
    [activeQuestionId, session]
  );

  useEffect(() => {
    setTranscript(activeQuestion?.userAnswer || "");
    setScore(activeQuestion?.lastEvaluation?.score != null ? activeQuestion.lastEvaluation : null);
  }, [activeQuestionId, activeQuestion]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const togglePin = async (questionId) => {
    const { data } = await api.patch(`/sessions/${sessionId}/questions/${questionId}/pin`);
    setSession(data.session);
  };

  /**
   * SSE streaming explanation:
   * Uses fetch() with a streaming body reader because EventSource only
   * supports GET. Sends the JWT manually in the Authorization header.
   */
  const requestExplanation = async (questionId) => {
    setExplanationLoadingId(questionId);
    setActiveQuestionId(questionId);
    setStreamingExplanation("");
    setIsStreamingExplanation(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(
        `${API_BASE}/sessions/${sessionId}/questions/${questionId}/explain`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream"
          }
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Streaming explanation failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("event: done")) continue;

          if (line.startsWith("data: ")) {
            const rawData = line.slice(6);

            // Check if this is the done event payload
            try {
              const parsed = JSON.parse(rawData);
              if (parsed?.explanation !== undefined) {
                // Final done event — update session state
                setSession((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    questions: prev.questions.map((q) =>
                      q._id === questionId ? { ...q, explanation: parsed.explanation } : q
                    )
                  };
                });
                continue;
              }
            } catch {
              // Not JSON, it's a plain text chunk
            }

            // Unescape newlines encoded by the server
            const chunk = rawData.replace(/\\n/g, "\n");
            accumulatedText += chunk;
            setStreamingExplanation(accumulatedText);
          }
        }
      }
    } catch (err) {
      console.error("SSE explanation error:", err);
    } finally {
      setExplanationLoadingId(null);
      setIsStreamingExplanation(false);
    }
  };

  const speakQuestion = (question) => {
    if (!("speechSynthesis" in window)) {
      setVoiceError("Your browser does not support speech synthesis.");
      return;
    }

    setVoiceError("");
    const utterance = new SpeechSynthesisUtterance(question.question);
    speechUtteranceRef.current = utterance;
    utterance.onstart = () => setSpeakingId(question._id);
    utterance.onend = () => {
      setSpeakingId(null);
      speechUtteranceRef.current = null;
    };
    utterance.onerror = () => {
      setSpeakingId(null);
      speechUtteranceRef.current = null;
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const stopQuestionAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    speechUtteranceRef.current = null;
    setSpeakingId(null);
  };

  const startVoiceAnswer = (questionId, options = {}) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Your browser does not support speech recognition. Try Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setActiveQuestionId(questionId);
    if (options.resetTranscript !== false) {
      setTranscript("");
    }
    setVoiceError("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListeningId(questionId);
    };

    recognition.onresult = (event) => {
      const combinedTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      setTranscript(combinedTranscript);
    };

    recognition.onerror = () => {
      setVoiceError("I couldn't capture that clearly. Please try speaking again.");
      setListeningId(null);
    };

    recognition.onend = () => {
      setListeningId(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startVoiceRound = (question) => {
    if (!("speechSynthesis" in window)) {
      setVoiceError("Your browser does not support speech synthesis.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(question.question);
    speechUtteranceRef.current = utterance;
    utterance.onstart = () => {
      setSpeakingId(question._id);
      setVoiceError("");
    };
    utterance.onend = () => {
      setSpeakingId(null);
      speechUtteranceRef.current = null;
      startVoiceAnswer(question._id);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
      speechUtteranceRef.current = null;
      setVoiceError("The AI voice could not play. Please try again.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceAnswer = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const evaluateReadiness = async () => {
    if (!activeQuestion) {
      return;
    }

    setEvaluating(true);
    try {
      const { data } = await api.post(`/sessions/${sessionId}/questions/${activeQuestion._id}/evaluate`, {
        answer: transcript
      });
      setScore(data.evaluation);
      setSession(data.session);
    } finally {
      setEvaluating(false);
    }
  };

  const addMoreQuestions = async () => {
    setAddingMore(true);
    try {
      const { data } = await api.post(`/sessions/${sessionId}/questions/generate-more`, { count: 5 });
      setSession(data.session);
    } finally {
      setAddingMore(false);
    }
  };

  const explanationBlocks = parseRichExplanation(activeQuestion?.explanation);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading session...</p>;
  }

  if (error || !session) {
    return <p className="text-sm text-rose-500">{error || "Session not found."}</p>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{session.role}</h1>
              <p className="mt-2 text-base text-slate-600">{session.focusAreas.join(", ")}</p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="primary-button text-sm self-start"
            >
              <Award className="mr-2 h-4 w-4" />
              Export Readiness Report
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">Experience: {session.experience} Years</span>
            <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">{session.questions.length} Q&amp;A</span>
            <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">Last Updated: {formatDate(session.updatedAt)}</span>
          </div>

          {session.resumeProfile?.summary ? (
            <div className="mt-6 rounded-[24px] border border-brand-100 bg-brand-50 p-5">
              <p className="text-sm font-semibold text-brand-700">Resume tech summary</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{session.resumeProfile.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {session.resumeProfile.skills?.slice(0, 6).map((skill) => (
                  <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
              {session.resumeProfile.projects?.length ? (
                <div className="mt-4 space-y-2">
                  {session.resumeProfile.projects.slice(0, 3).map((project) => (
                    <p key={project} className="text-sm leading-6 text-slate-600">
                      • {project}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Phase 4: Resume & ATS Gap Analysis Card */}
        {session.resumeAnalysis && (
          <ResumeAnalysisCard
            analysis={session.resumeAnalysis}
            onReAnalyze={handleReAnalyzeResume}
            isAnalyzing={isAnalyzingResume}
          />
        )}

        <div className="rounded-[32px] bg-slate-50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Interview Q &amp; A</h2>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600">
              <Pin className="h-4 w-4 text-brand-500" />
              {session.questions.filter((item) => item.isPinned).length} pinned
            </div>
          </div>

          <div className="space-y-4">
            {session.questions.map((question) => (
              <QuestionAccordion
                key={question._id}
                question={question}
                isActive={activeQuestion?._id === question._id}
                onSelect={() => setActiveQuestionId(question._id)}
                onTogglePin={() => togglePin(question._id)}
                onExplain={() => requestExplanation(question._id)}
                onSpeak={() => speakQuestion(question)}
                onStopSpeak={stopQuestionAudio}
                onStartAnswer={() => startVoiceAnswer(question._id)}
                isExplaining={explanationLoadingId === question._id}
                speakingId={speakingId}
                listeningId={listeningId}
              />
            ))}
          </div>

          <button onClick={addMoreQuestions} className="secondary-button mt-5" disabled={addingMore}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {addingMore ? "Generating 5 more..." : "Add 5 more questions"}
          </button>
        </div>
      </section>

      <aside className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-soft">
        {activeQuestion ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{activeQuestion.title || activeQuestion.question}</h2>
                <p className="mt-3 text-sm text-slate-500">Deep explanation, answer review, and readiness scoring.</p>
              </div>
              <button
                onClick={speakingId === activeQuestion._id ? stopQuestionAudio : () => speakQuestion(activeQuestion)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                title={speakingId === activeQuestion._id ? "Stop question audio" : "Ask question aloud"}
              >
                {speakingId === activeQuestion._id ? <Square className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-8 space-y-5 text-slate-700">
              <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Volume2 className="h-4 w-4" />
                  AI Interviewer
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Click the speaker and the AI asks only the interview question out loud. Then use the mic to answer in your own voice.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => startVoiceRound(activeQuestion)} className="primary-button">
                    <Mic className="mr-2 h-4 w-4" />
                    Start voice round
                  </button>
                  <button onClick={() => speakQuestion(activeQuestion)} className="secondary-button">
                    <Volume2 className="mr-2 h-4 w-4" />
                    Ask question
                  </button>
                  {speakingId === activeQuestion._id ? (
                    <button onClick={stopQuestionAudio} className="secondary-button">
                      <Square className="mr-2 h-4 w-4" />
                      Stop audio
                    </button>
                  ) : null}
                  {listeningId === activeQuestion._id ? (
                    <button onClick={stopVoiceAnswer} className="primary-button">
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop recording
                    </button>
                  ) : (
                    <button onClick={() => startVoiceAnswer(activeQuestion._id)} className="primary-button">
                      <Mic className="mr-2 h-4 w-4" />
                      Speak your answer
                    </button>
                  )}
                </div>
                {voiceError ? <p className="mt-3 text-sm text-rose-500">{voiceError}</p> : null}
              </div>

              <div className="rounded-[24px] border border-slate-100 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">Your spoken answer transcript</p>
                <textarea
                  value={transcript}
                  onChange={(event) => setTranscript(event.target.value)}
                  className="input-field mt-3 min-h-32 resize-y"
                  placeholder="Your spoken answer will appear here. You can also edit it manually before evaluation."
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={evaluateReadiness} className="primary-button" disabled={evaluating || !transcript.trim()}>
                    {evaluating ? "Evaluating..." : "Evaluate spoken answer"}
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-100 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">Reference answer</p>
                <div className="mt-3 space-y-4">
                  {activeQuestion.answer.split("\n").filter(Boolean).map((paragraph, index) => (
                    <p key={index} className="text-base leading-8 text-slate-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <BookText className="h-4 w-4" />
                    AI Explanation
                  </div>
                  {isStreamingExplanation && (
                    <span className="text-xs text-slate-400">
                      {streamingExplanation.length} chars
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-3">
                  {isStreamingExplanation ? (
                    // Live streaming view — show raw text with blinking cursor
                    <div className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                      {streamingExplanation}
                      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-500 align-middle" />
                    </div>
                  ) : explanationBlocks.length ? (
                    explanationBlocks.map((block, index) =>
                      block.type === "code" ? (
                        <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                          <div className="border-b border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                            {block.language}
                          </div>
                          <pre className="overflow-x-auto p-4 text-sm leading-6 text-slate-100">
                            <code>{block.content}</code>
                          </pre>
                        </div>
                      ) : (
                        <div key={index} className="space-y-3">
                          {block.content.map((paragraph, paragraphIndex) => (
                            <p key={paragraphIndex} className="text-sm leading-7 text-slate-600">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm leading-7 text-slate-600">
                      Use Learn More to generate a structured concept breakdown for this question.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => requestExplanation(activeQuestion._id)}
                  className="secondary-button"
                  disabled={isStreamingExplanation || explanationLoadingId === activeQuestion._id}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isStreamingExplanation ? "Streaming..." : "Refresh explanation"}
                </button>
              </div>


              {score ? (
                <div className="rounded-[24px] border border-brand-100 bg-brand-50 p-5 space-y-5">
                  {/* Overall Score Header */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-brand-700">Readiness score</p>
                    <p className="text-3xl font-semibold text-slate-950">
                      {score.overallScore ?? score.score ?? "–"}<span className="text-base font-medium text-slate-500">/100</span>
                    </p>
                  </div>

                  {/* 4-Pillar Scorecard Grid */}
                  {score.scoreBreakdown && Object.keys(score.scoreBreakdown).length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "technicalAccuracy", label: "Technical Accuracy" },
                        { key: "communicationClarity", label: "Communication" },
                        { key: "problemSolvingStructure", label: "Problem Solving" },
                        { key: "completeness", label: "Completeness" }
                      ].map(({ key, label }) => {
                        const val = score.scoreBreakdown[key] ?? null;
                        const color =
                          val === null ? "bg-slate-200"
                          : val >= 80 ? "bg-emerald-500"
                          : val >= 55 ? "bg-amber-400"
                          : "bg-rose-400";
                        return (
                          <div key={key} className="rounded-2xl bg-white p-3 border border-slate-100">
                            <p className="text-xs font-medium text-slate-500">{label}</p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                              {val !== null ? val : "–"}
                            </p>
                            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                              <div
                                className={`h-1.5 rounded-full transition-all ${color}`}
                                style={{ width: val !== null ? `${val}%` : "0%" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Strengths */}
                  {score.strengths?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Strengths</p>
                      <ul className="mt-2 space-y-1">
                        {score.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-0.5 text-emerald-500">✓</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Points */}
                  {score.missingPoints?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Missing Points</p>
                      <ul className="mt-2 space-y-1">
                        {score.missingPoints.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-0.5 text-amber-500">⚠</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Overall Feedback */}
                  {score.feedback && (
                    <p className="text-sm leading-7 text-slate-700">{score.feedback}</p>
                  )}

                  {/* AI Improved Answer */}
                  {score.improvedAnswer && (
                    <div className="rounded-2xl bg-white border border-slate-200 p-4">
                      <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">AI Improved Answer</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{score.improvedAnswer}</p>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="rounded-[24px] border border-slate-100 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">Attempt history</p>
                <div className="mt-4 space-y-3">
                  {(activeQuestion.attempts || []).length ? (
                    activeQuestion.attempts
                      .slice()
                      .reverse()
                      .map((attempt) => (
                        <div key={attempt._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {attempt.overallScore ?? attempt.score ?? "–"}/100
                            </p>
                            <p className="text-xs text-slate-500">{formatDate(attempt.createdAt)}</p>
                          </div>
                          {attempt.scoreBreakdown && Object.values(attempt.scoreBreakdown).some((v) => v !== null) && (
                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                              {[
                                { key: "technicalAccuracy", label: "Tech" },
                                { key: "communicationClarity", label: "Comm" },
                                { key: "problemSolvingStructure", label: "PS" },
                                { key: "completeness", label: "Compl" }
                              ].map(({ key, label }) => {
                                const val = attempt.scoreBreakdown[key];
                                return val !== null && val !== undefined ? (
                                  <span key={key} className="text-xs text-slate-500">
                                    {label}: <span className="font-medium text-slate-700">{val}</span>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                          <p className="mt-2 text-sm leading-6 text-slate-600">{attempt.feedback}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-slate-500">Your evaluated spoken answers will show up here.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Select a question to review.</p>
        )}
      </aside>

      {/* Phase 4: Readiness Report Modal */}
      {showReportModal && (
        <ReadinessReportModal
          session={session}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

export default SessionDetailPage;
