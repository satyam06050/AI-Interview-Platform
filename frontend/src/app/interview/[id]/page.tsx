"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "@/components/layout/Topbar";
import { createAuthApi } from "@/lib/api";
import type { Interview, Message, NextQuestionResponse } from "@/types";

interface Props { params: { id: string } }

export default function InterviewPage({ params }: Props) {
  const { getToken } = useAuth();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQ, setTotalQ] = useState(6);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const loadInterview = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const api = createAuthApi(token);
    try {
      const res = await api.get<Interview>(`/interviews/`);
      const list: Interview[] = res.data as any;
      const iv = Array.isArray(list) ? list.find((i) => i.id === params.id) : null;
      if (!iv) { router.push("/dashboard"); return; }
      setInterview(iv);
      if (iv.status === "completed") {
        router.push(`/report/${iv.id}`);
        return;
      }
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [getToken, params.id, router]);

  useEffect(() => { loadInterview(); }, [loadInterview]);

  // Start timer once interview is active
  useEffect(() => {
    if (interview?.status === "active") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [interview?.status]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startInterview = async () => {
    const token = await getToken();
    if (!token || !interview) return;
    setStarting(true);
    const api = createAuthApi(token);
    try {
      const res = await api.post<Message>(`/interviews/${interview.id}/start`);
      setMessages([res.data]);
      setInterview((prev) => prev ? { ...prev, status: "active" } : prev);
      setQuestionNum(1);
    } catch (e: any) {
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || submitting || !interview) return;
    const token = await getToken();
    if (!token) return;

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: answer.trim(),
      question_index: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setAnswer("");
    setSubmitting(true);

    const api = createAuthApi(token);
    try {
      const res = await api.post<NextQuestionResponse>(`/interviews/${interview.id}/answer`, {
        answer: answer.trim(),
      });
      const { message, is_complete, question_number, total_questions } = res.data;
      setMessages((prev) => [...prev, message]);
      setQuestionNum(question_number);
      setTotalQ(total_questions);
      if (is_complete) {
        setIsComplete(true);
        clearInterval(timerRef.current);
        setTimeout(() => router.push(`/report/${interview.id}`), 2500);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAnswer();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, submitting]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [answer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-zinc-600 text-sm animate-pulse">Loading interview…</p>
      </div>
    );
  }

  if (!interview) return null;

  const diffBadge: Record<string, string> = {
    junior: "text-emerald-400 border-emerald-400/20",
    mid: "text-amber-400 border-amber-400/20",
    senior: "text-rose-400 border-rose-400/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Topbar />

      {/* ─── Interview header ─────────────────────────────────── */}
      <div className="pt-14 border-b border-zinc-800">
        <div className="px-6 md:px-10 max-w-3xl mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[#f0ede6] text-sm font-medium">{interview.job_role}</h1>
            <span className={`text-xs border rounded-full px-2.5 py-0.5 ${diffBadge[interview.difficulty]}`}>
              {interview.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {interview.status === "active" && (
              <>
                <span className="text-zinc-500 text-xs font-mono">{formatTime(elapsed)}</span>
                <span className="text-zinc-600 text-xs">
                  {questionNum}/{totalQ}
                </span>
              </>
            )}
          </div>
        </div>
        {/* Progress bar */}
        {interview.status === "active" && (
          <div className="h-0.5 bg-zinc-900">
            <div
              className="h-full bg-zinc-600 transition-all duration-500"
              style={{ width: `${(questionNum / totalQ) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* ─── Chat area ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Pre-start state */}
          {interview.status === "pending" && messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">Ready to begin</p>
              <h2 className="font-serif text-3xl font-light text-[#f0ede6] mb-3">
                {interview.job_role} interview
              </h2>
              <p className="text-zinc-500 text-sm mb-8 max-w-sm">
                You&apos;ll answer {totalQ} questions. Take your time — there&apos;s no time limit per question.
              </p>
              <button
                onClick={startInterview}
                disabled={starting}
                className="bg-white text-black rounded-full px-8 py-3 text-sm font-medium hover:bg-[#f0ede6] transition-colors disabled:opacity-50"
              >
                {starting ? "Starting…" : "Begin interview"}
              </button>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex gap-3 items-start ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center text-xs text-zinc-400">
                    AI
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-xl ${
                  msg.role === "assistant"
                    ? "bg-zinc-900 border border-zinc-800 rounded-tl-sm text-zinc-200"
                    : "bg-zinc-800 rounded-tr-sm text-[#f0ede6]"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {submitting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center text-xs text-zinc-400">AI</div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Complete banner */}
          {isComplete && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="font-serif text-2xl text-[#f0ede6] font-light mb-2">Interview complete</p>
              <p className="text-zinc-500 text-sm">Generating your report…</p>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ─── Input area ───────────────────────────────────────── */}
      {interview.status === "active" && !isComplete && (
        <div className="border-t border-zinc-800 bg-[#0a0a0a]/95 backdrop-blur-sm px-6 md:px-10 py-4">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-zinc-700 transition-colors">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer… (⌘+Enter to submit)"
                rows={1}
                className="w-full bg-transparent text-sm text-[#f0ede6] placeholder-zinc-600 resize-none focus:outline-none leading-relaxed"
              />
            </div>
            <button
              onClick={submitAnswer}
              disabled={!answer.trim() || submitting}
              className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#f0ede6] transition-colors disabled:opacity-30 flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L8 14M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="text-zinc-700 text-xs text-center mt-2">⌘+Enter to submit</p>
        </div>
      )}
    </div>
  );
}
