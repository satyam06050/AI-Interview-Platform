"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import { createAuthApi } from "@/lib/api";
import type { Report, Evaluation } from "@/types";

interface Props { params: { id: string } }

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

function ScoreBar({ value }: { value: number | null }) {
  const pct = value !== null ? (value / 10) * 100 : 0;
  const color = value === null ? "bg-zinc-700" : value >= 7 ? "bg-emerald-500" : value >= 5 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">{label}</p>
      <p className="text-3xl font-serif text-[#f0ede6] font-light">
        {value !== null ? value.toFixed(1) : "—"}
        <span className="text-lg text-zinc-600">/10</span>
      </p>
      <ScoreBar value={value} />
    </div>
  );
}

export default function ReportPage({ params }: Props) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const api = createAuthApi(token);
    try {
      const res = await api.get<Report>(`/interviews/${params.id}/report`);
      setReport(res.data);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [getToken, params.id, router]);

  useEffect(() => { loadReport(); }, [loadReport]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-zinc-600 text-sm animate-pulse">Loading report…</p>
      </div>
    );
  }

  if (!report) return null;

  const { interview, evaluations, average_score, average_clarity, average_relevance, average_depth } = report;

  const diffBadge: Record<string, string> = {
    junior: "text-emerald-400 border-emerald-400/20",
    mid: "text-amber-400 border-amber-400/20",
    senior: "text-rose-400 border-rose-400/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Topbar />
      <main className="pt-14">
        <div className="px-6 md:px-10 max-w-3xl mx-auto py-12">

          {/* ─── Header ─────────────────────────────────────────── */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs uppercase tracking-widest text-zinc-600">Interview report</p>
              <span className={`text-xs border rounded-full px-2.5 py-0.5 ${diffBadge[interview.difficulty]}`}>
                {interview.difficulty}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-[#f0ede6] mb-2">
              {interview.job_role}
            </h1>
            <p className="text-zinc-600 text-sm">
              {interview.completed_at
                ? new Date(interview.completed_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                : "—"}
            </p>
          </motion.div>

          {/* ─── Score grid ─────────────────────────────────────── */}
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <ScoreCard label="Overall" value={average_score} />
            <ScoreCard label="Clarity" value={average_clarity} />
            <ScoreCard label="Relevance" value={average_relevance} />
            <ScoreCard label="Depth" value={average_depth} />
          </motion.div>

          <div className="border-t border-zinc-800 mb-10" />

          {/* ─── Q&A Review ─────────────────────────────────────── */}
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-5">Answer breakdown</p>

            {evaluations.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-zinc-500 text-sm">No evaluations available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluations.map((ev: Evaluation, i: number) => (
                  <div key={ev.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Summary row */}
                    <button
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/40 transition-colors"
                      onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                    >
                      <div className="flex items-center gap-3 text-left min-w-0">
                        <span className="text-zinc-600 text-xs flex-shrink-0">Q{i + 1}</span>
                        <p className="text-[#f0ede6] text-sm truncate">{ev.question}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="font-serif text-lg text-[#f0ede6] font-light">
                          {ev.score !== null ? ev.score.toFixed(1) : "—"}
                        </span>
                        <svg
                          width="14" height="14" viewBox="0 0 14 14" fill="none"
                          className={`text-zinc-600 transition-transform ${expanded === ev.id ? "rotate-180" : ""}`}
                        >
                          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>

                    {/* Expanded content */}
                    {expanded === ev.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6 border-t border-zinc-800"
                      >
                        {/* Mini score row */}
                        <div className="grid grid-cols-3 gap-3 py-4">
                          {[
                            { label: "Clarity", value: ev.clarity_score },
                            { label: "Relevance", value: ev.relevance_score },
                            { label: "Depth", value: ev.depth_score },
                          ].map((s) => (
                            <div key={s.label}>
                              <p className="text-xs text-zinc-600 mb-1">{s.label}</p>
                              <p className="font-serif text-xl text-[#f0ede6] font-light">
                                {s.value !== null ? s.value.toFixed(1) : "—"}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Answer */}
                        <div className="mb-4">
                          <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">Your answer</p>
                          <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-800/50 rounded-xl p-3">
                            {ev.answer}
                          </p>
                        </div>

                        {/* Feedback */}
                        {ev.feedback && (
                          <div className="mb-4">
                            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">Feedback</p>
                            <p className="text-zinc-400 text-sm leading-relaxed">{ev.feedback}</p>
                          </div>
                        )}

                        {/* Strengths / Improvements */}
                        <div className="grid grid-cols-2 gap-4">
                          {ev.strengths.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-widest text-emerald-600 mb-2">Strengths</p>
                              <ul className="space-y-1">
                                {ev.strengths.map((s, i) => (
                                  <li key={i} className="text-xs text-zinc-400 flex gap-2">
                                    <span className="text-emerald-600 flex-shrink-0">+</span>{s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {ev.improvements.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-widest text-amber-600 mb-2">Improve</p>
                              <ul className="space-y-1">
                                {ev.improvements.map((s, i) => (
                                  <li key={i} className="text-xs text-zinc-400 flex gap-2">
                                    <span className="text-amber-600 flex-shrink-0">→</span>{s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ─── Actions ─────────────────────────────────────────── */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="mt-10 flex gap-3">
            <Link href="/dashboard">
              <button className="bg-white text-black rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#f0ede6] transition-colors">
                Back to dashboard
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="border border-zinc-700 text-zinc-300 rounded-full px-6 py-2.5 text-sm hover:border-zinc-500 transition-colors">
                New interview
              </button>
            </Link>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
