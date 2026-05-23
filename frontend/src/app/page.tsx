"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Bot,
  Mic,
  Clock,
  Briefcase,
  TrendingUp,
  FileText,
  Download,
  BrainCircuit,
  MessageSquare,
  Wrench,
  ShieldCheck,
  Coins,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function HomePage() {
  return (
    <div className="bg-[#fafafa] min-h-screen text-[#0d0d0d] font-sans antialiased">
      {/* ───────────────── NAVBAR ───────────────── */}
      {/* Removed the bottom border and full-bleed background here so the pill can float */}
      <nav className="fixed top-4 left-0 w-full z-50 px-4 md:px-6">
        {/* Pill Container: Reduced max-width, elevated rounding, subtle shadow, and borders */}
        <div className="max-w-4xl mx-auto h-14 md:h-16 bg-white border border-neutral-200/80 rounded-full md:rounded-3xl px-6 flex items-center justify-between shadow-sm backdrop-blur-sm bg-white/95">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">
              InterviewIQ.AI
            </span>
          </div>

          {/* Right: User / Auth Controls */}
          <div className="flex items-center gap-3">
            {/* Credit Status Badge */}
            <div className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 transition px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-600 cursor-pointer">
              <Coins className="w-3.5 h-3.5 text-neutral-400" />
              <span>0</span>
            </div>

            {/* Auth Buttons / Profile Icon wrapped clean */}
            <div className="flex items-center justify-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-7 h-7 bg-neutral-200 rounded-full flex items-center justify-center hover:opacity-80 transition">
                    <UserButton afterSignOutUrl="/" />
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col items-center"
        >
          {/* Subheader Badge */}
          <div className="inline-flex items-center gap-1.5 text-[#16a34a] text-xs font-semibold tracking-wide mb-6">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Powered Smart Interview Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 max-w-3xl leading-[1.15]">
            Practice Interviews with{" "}
            <span className="bg-[#e2fbe8] text-[#16a34a] px-4 py-1 rounded-full inline-block mt-1">
              AI Intelligence
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-sm md:text-base text-neutral-500 max-w-2xl leading-relaxed">
            Role-based mock interviews with smart follow-ups, adaptive difficulty and real-time performance evaluation.
          </p>

          {/* CTA Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-full shadow-md hover:bg-neutral-800 transition">
              Start Interview
            </button>
            <button className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm font-semibold px-6 py-3 rounded-full hover:bg-neutral-100 transition">
              View History
            </button>
          </div>
        </motion.div>

        {/* 3-Step Process Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 relative pt-10 text-center flex flex-col items-center transform -rotate-1 hover:rotate-0 transition duration-300">
            <div className="absolute -top-5 w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#16a34a] shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Step 1</span>
            <h3 className="text-sm font-bold text-neutral-800 mt-2">Role & Experience Selection</h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              AI adjusts difficulty based on selected job role.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 relative pt-10 text-center flex flex-col items-center transform rotate-1 hover:rotate-0 transition duration-300">
            <div className="absolute -top-5 w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#16a34a] shadow-sm">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Step 2</span>
            <h3 className="text-sm font-bold text-neutral-800 mt-2">Smart Voice Interview</h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Dynamic follow-up questions based on your answers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 relative pt-10 text-center flex flex-col items-center transform -rotate-1 hover:rotate-0 transition duration-300">
            <div className="absolute -top-5 w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#16a34a] shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Step 3</span>
            <h3 className="text-sm font-bold text-neutral-800 mt-2">Timer Based Simulation</h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Real interview pressure with time tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────── ADVANCED AI CAPABILITIES ───────────────── */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-center text-neutral-900 mb-10">
          Advanced AI <span className="text-[#16a34a]">Capabilities</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-24 h-24 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-500">
              <MessageSquare className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-800">AI Answer Evaluation</h3>
                <TrendingUp className="w-4 h-4 text-[#16a34a]" />
              </div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Scores communication, technical accuracy and confidence.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-24 h-24 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-500">
              <FileText className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-800">Resume Based Interview</h3>
                <FileText className="w-4 h-4 text-[#16a34a]" />
              </div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Project-specific questions based on uploaded resume.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-24 h-24 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-500">
              <Download className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-800">Downloadable PDF Report</h3>
                <FileText className="w-4 h-4 text-[#16a34a]" />
              </div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Detailed strengths, weaknesses and improvement insights.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-24 h-24 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-500">
              <TrendingUp className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-800">History & Analytics</h3>
                <TrendingUp className="w-4 h-4 text-[#16a34a]" />
              </div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Track progress with performance graphs and topic analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── MULTIPLE INTERVIEW MODES ───────────────── */}
      <section className="py-16 px-6 max-w-4xl mx-auto pb-32">
        <h2 className="text-2xl font-bold tracking-tight text-center text-neutral-900 mb-10">
          Multiple Interview <span className="text-[#16a34a]">Modes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">HR Interview Mode</h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-xs leading-relaxed">
                Behavioral and communication based evaluation.
              </p>
            </div>
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-orange-400">
              <UserButton />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">Technical Mode</h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-xs leading-relaxed">
                Deep technical questioning based on selected role.
              </p>
            </div>
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-blue-500">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">Confidence Detection</h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-xs leading-relaxed">
                Basic tone and voice analysis insights.
              </p>
            </div>
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-[#16a34a]">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">Credits System</h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-xs leading-relaxed">
                Unlock premium interview sessions easily.
              </p>
            </div>
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-amber-500">
              <Coins className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}