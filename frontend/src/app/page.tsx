"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HomePage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-5 flex items-center justify-between">
        <span className="font-serif text-[#f0ede6] text-xl tracking-tight">InterviewAI</span>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-zinc-400 hover:text-[#f0ede6] transition-colors hidden md:block">
                Sign in
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium hover:bg-[#f0ede6] transition-colors">
                Get started
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium hover:bg-[#f0ede6] transition-colors">
                Dashboard
              </button>
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-32 md:pt-52 md:pb-40 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6 font-sans">
            AI-Powered Interview Practice
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-[#f0ede6] leading-[1.05] mb-8">
            Practice interviews
            <br />
            <span className="text-zinc-500">that actually prepare you.</span>
          </h1>
          <p className="font-sans text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl">
            Upload your resume, pick a role, and get grilled by an AI that adapts to your experience level.
            Instant feedback. Real improvement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white text-black rounded-full px-8 py-3 text-sm font-medium hover:bg-[#f0ede6] transition-colors">
                  Start your first interview
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="border border-zinc-700 text-zinc-300 rounded-full px-8 py-3 text-sm hover:border-zinc-500 transition-colors">
                  Sign in with Google
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="bg-white text-black rounded-full px-8 py-3 text-sm font-medium hover:bg-[#f0ede6] transition-colors">
                  Go to dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
        </motion.div>
      </section>

      <div className="border-t border-zinc-800 mx-6 md:mx-12" />

      {/* ─── Feature 1 ───────────────────────────────────────────────── */}
      <section className="py-32 md:py-40 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">Resume-aware questions</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-[#f0ede6] leading-tight mb-6">
              Questions tailored
              <br />to your background.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Upload your resume once. The AI extracts your skills and experience, then crafts interview
              questions that are specific to what you&apos;ve actually done — not generic prompts you&apos;ve
              seen a hundred times.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.15, ease: "easeOut" } } }}>
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 h-72">
              <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">Detected from your resume</p>
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL", "Redis"].map((s) => (
                  <span key={s} className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-full px-3 py-1 text-xs">
                    {s}
                  </span>
                ))}
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-zinc-800 border border-zinc-700 rounded-2xl p-4">
                <p className="text-xs text-zinc-500 mb-1">Generated question</p>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  &ldquo;Walk me through how you optimised a PostgreSQL query that was causing latency in production.&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-zinc-800 mx-6 md:mx-12" />

      {/* ─── Feature 2 ───────────────────────────────────────────────── */}
      <section className="py-32 md:py-40 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-2 md:order-1">
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 h-72 flex flex-col gap-3 justify-center">
              {/* Chat bubbles mockup */}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex-shrink-0 flex items-center justify-center text-xs text-zinc-300 font-sans">AI</div>
                <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-zinc-200 max-w-xs">
                  Tell me about a time you dealt with a difficult stakeholder.
                </div>
              </div>
              <div className="flex gap-3 items-start justify-end">
                <div className="bg-zinc-700 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-[#f0ede6] max-w-xs">
                  I once had a client who kept changing scope mid-sprint...
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex-shrink-0 flex items-center justify-center text-xs text-zinc-300 font-sans">AI</div>
                <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-zinc-200 max-w-xs">
                  How did you manage their expectations around the timeline?
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.15, ease: "easeOut" } } }} className="order-1 md:order-2">
            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">Adaptive follow-ups</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-[#f0ede6] leading-tight mb-6">
              It listens.
              <br />Then digs deeper.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Every answer shapes the next question. The AI picks up on what you said — and what you
              left out — to probe further, just like a real interviewer would.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-zinc-800 mx-6 md:mx-12" />

      {/* ─── Feature 3: Scoring ──────────────────────────────────────── */}
      <section className="py-32 md:py-40 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">Instant feedback</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-[#f0ede6] leading-tight mb-6">
              Know exactly
              <br />where to improve.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              After each interview you get a full scorecard — clarity, relevance, depth — with specific
              feedback per answer and concrete suggestions to do better next time.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.15, ease: "easeOut" } } }}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Overall Score", value: "8.4", sub: "Above average" },
                { label: "Clarity", value: "9.1", sub: "Very clear structure" },
                { label: "Relevance", value: "7.8", sub: "Mostly on-topic" },
                { label: "Depth", value: "8.2", sub: "Good technical detail" },
              ].map((m) => (
                <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">{m.label}</p>
                  <p className="text-3xl font-serif text-[#f0ede6] font-light">{m.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-zinc-800 mx-6 md:mx-12" />

      {/* ─── Footer CTA ──────────────────────────────────────────────── */}
      <section className="py-32 md:py-40 px-6 md:px-12 max-w-6xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="font-serif text-4xl md:text-6xl font-light text-[#f0ede6] mb-8 leading-tight">
            Ready to start practising?
          </h2>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white text-black rounded-full px-10 py-3.5 text-sm font-medium hover:bg-[#f0ede6] transition-colors">
                Start for free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="bg-white text-black rounded-full px-10 py-3.5 text-sm font-medium hover:bg-[#f0ede6] transition-colors">
                Go to dashboard
              </button>
            </Link>
          </SignedIn>
          <p className="text-zinc-600 text-sm mt-6">Free to use · No credit card required</p>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div className="border-t border-zinc-800">
        <div className="px-6 md:px-12 py-8 flex items-center justify-between">
          <span className="font-serif text-zinc-600 text-sm">InterviewAI</span>
          <p className="text-zinc-700 text-xs">MVP v1 · Built with Next.js + FastAPI</p>
        </div>
      </div>
    </div>
  );
}
