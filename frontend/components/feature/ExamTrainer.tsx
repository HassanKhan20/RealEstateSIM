"use client";

import { useEffect, useState } from "react";
import { addExamAttempt, awardExamPassXp, getExamAttempts, type ExamAttempt } from "@/frontend/lib/store";

type Q = {
  id: string;
  topic: string;
  stem: string;
  choices: string[];
  correct: number;
  explain: string;
};

export default function ExamTrainer({ topics }: { topics: string[] }) {
  const [topic, setTopic] = useState<string>(topics[0]);
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  useEffect(() => setAttempts(getExamAttempts()), []);

  async function generate() {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setAnswers({});
    try {
      const r = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function submit() {
    if (!questions) return;
    setSubmitted(true);
    const correct = questions.filter((q) => answers[q.id] === q.correct).length;
    const attempt: ExamAttempt = {
      id: `ex-${Date.now()}`,
      topic,
      correct,
      total: questions.length,
      at: Date.now(),
    };
    addExamAttempt(attempt);
    if (correct / questions.length >= 0.75) awardExamPassXp();
    setAttempts(getExamAttempts());
  }

  const score = questions
    ? questions.filter((q) => answers[q.id] === q.correct).length
    : 0;
  const allAnswered =
    questions && questions.every((q) => typeof answers[q.id] === "number");

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card p-5">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted">Topic</span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
            >
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted">Questions</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
            >
              {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary self-end disabled:opacity-50"
          >
            {loading ? "Generating…" : questions ? "New set" : "Start"}
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Questions */}
      {questions && (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const picked = answers[q.id];
            return (
              <div key={q.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-widest text-accent">
                    Q{idx + 1} · {q.topic}
                  </div>
                  {submitted && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        picked === q.correct
                          ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-red-100 text-red-700 ring-1 ring-red-200"
                      }`}
                    >
                      {picked === q.correct ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">{q.stem}</p>
                <div className="mt-4 space-y-2">
                  {q.choices.map((c, i) => {
                    const isPicked = picked === i;
                    const isCorrect = q.correct === i;
                    const showResult = submitted;
                    const base =
                      "flex items-start gap-3 w-full rounded-lg border px-3 py-2 text-sm text-left transition";
                    let cls = "border-border bg-white hover:border-accent/40";
                    if (showResult) {
                      if (isCorrect) cls = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
                      else if (isPicked) cls = "bg-red-50 text-red-700 ring-1 ring-red-200";
                      else cls = "border-border bg-surface text-slate-500";
                    } else if (isPicked) {
                      cls = "border-accent/50 bg-accent/10 text-accent";
                    }
                    return (
                      <button
                        key={i}
                        disabled={submitted}
                        onClick={() => setAnswers({ ...answers, [q.id]: i })}
                        className={`${base} ${cls}`}
                      >
                        <span className="font-mono text-xs text-muted">{String.fromCharCode(65 + i)}</span>
                        <span className="flex-1">{c.replace(/^[A-D]\)\s*/, "")}</span>
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className="mt-4 rounded-lg bg-[#F7F8FA] p-3 text-xs leading-relaxed text-slate-700">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                      Why:
                    </span>{" "}
                    {q.explain}
                  </div>
                )}
              </div>
            );
          })}

          {!submitted ? (
            <button
              onClick={submit}
              disabled={!allAnswered}
              className="btn-primary w-full disabled:opacity-50"
            >
              {allAnswered ? "Submit answers" : `Answer all ${questions.length} to submit`}
            </button>
          ) : (
            <div className="card p-5 text-center">
              <div className="text-[10px] uppercase tracking-widest text-accent">Result</div>
              <div className="mt-2 text-4xl font-semibold">
                {score} / {questions.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {Math.round((score / questions.length) * 100)}% ·{" "}
                {score / questions.length >= 0.75
                  ? "You'd likely pass the state exam on this topic."
                  : "Below the typical 75% pass threshold — review the explanations and run it again."}
              </div>
              <button onClick={generate} className="btn-primary mt-4">
                Generate another set
              </button>
            </div>
          )}
        </div>
      )}

      {/* Past attempts */}
      {attempts.length > 0 && (
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-widest text-accent">Recent attempts</div>
          <ul className="mt-3 space-y-2 text-sm">
            {attempts.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center justify-between text-slate-700">
                <span className="truncate">{a.topic}</span>
                <span className="font-mono text-slate-500">
                  {a.correct}/{a.total} ·{" "}
                  <span className={a.correct / a.total >= 0.75 ? "text-accent" : "text-amber-700"}>
                    {Math.round((a.correct / a.total) * 100)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
