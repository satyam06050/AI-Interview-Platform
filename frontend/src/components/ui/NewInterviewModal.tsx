"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { createAuthApi } from "@/lib/api";
import type { Difficulty } from "@/types";

interface Props {
  onClose: () => void;
  onCreated: (id: string) => void;
  activeResumeId: string | null;
}

const ROLES = [
  "Software Engineer", "Frontend Engineer", "Backend Engineer",
  "Full Stack Engineer", "Data Engineer", "DevOps Engineer",
  "Product Manager", "Engineering Manager", "Data Scientist",
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: "junior", label: "Junior", desc: "0–2 years experience" },
  { value: "mid", label: "Mid-level", desc: "3–5 years experience" },
  { value: "senior", label: "Senior", desc: "6+ years experience" },
];

export default function NewInterviewModal({ onClose, onCreated, activeResumeId }: Props) {
  const { getToken } = useAuth();
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("mid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalRole = role === "__custom__" ? customRole.trim() : role;

  const handleStart = async () => {
    if (!finalRole) { setError("Please select or enter a job role."); return; }
    setError("");
    setLoading(true);
    try {
      const token = await getToken();
      const api = createAuthApi(token!);
      const res = await api.post("/interviews/", {
        job_role: finalRole,
        difficulty,
        resume_id: activeResumeId,
      });
      onCreated(res.data.id);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to create interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative bg-[#141414] border border-zinc-800 rounded-2xl p-8 w-full max-w-md z-10"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-400 text-sm">✕</button>

          <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">New interview</p>
          <h2 className="font-serif text-2xl font-light text-[#f0ede6] mb-6">Configure your session</h2>

          {/* Role */}
          <div className="mb-5">
            <label className="text-xs uppercase tracking-widest text-zinc-600 block mb-2">Job role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-[#f0ede6] focus:outline-none focus:border-zinc-600 transition-colors appearance-none"
            >
              <option value="">Select a role…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value="__custom__">Other (custom)</option>
            </select>
            {role === "__custom__" && (
              <input
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Machine Learning Engineer"
                className="w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-[#f0ede6] placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            )}
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-widest text-zinc-600 block mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                    difficulty === d.value
                      ? "border-zinc-500 bg-zinc-800"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <p className="text-[#f0ede6] text-xs font-medium">{d.label}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {activeResumeId && (
            <p className="text-zinc-600 text-xs mb-4">✓ Your resume will be used to personalise questions.</p>
          )}

          {error && <p className="text-rose-400 text-xs mb-4">{error}</p>}

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-white text-black rounded-full py-3 text-sm font-medium hover:bg-[#f0ede6] transition-colors disabled:opacity-50"
          >
            {loading ? "Starting…" : "Start interview"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
