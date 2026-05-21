// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { useAuth } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import Topbar from "@/components/layout/Topbar";
// import ResumeUpload from "@/components/ui/ResumeUpload";
// import NewInterviewModal from "@/components/ui/NewInterviewModal";
// import { createAuthApi } from "@/lib/api";
// import type { Interview, Resume } from "@/types";

// const fadeUp = {
//   hidden: { opacity: 0, y: 16 },
//   visible: (i: number) => ({
//     opacity: 1, y: 0,
//     transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
//   }),
// };

// const difficultyColor: Record<string, string> = {
//   junior: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
//   mid: "text-amber-400 bg-amber-400/10 border-amber-400/20",
//   senior: "text-rose-400 bg-rose-400/10 border-rose-400/20",
// };

// const statusColor: Record<string, string> = {
//   pending: "text-zinc-400",
//   active: "text-blue-400",
//   completed: "text-emerald-400",
//   cancelled: "text-zinc-600",
// };

// export default function DashboardPage() {
//   const { getToken, isLoaded } = useAuth();
//   const router = useRouter();

//   const [interviews, setInterviews] = useState<Interview[]>([]);
//   const [activeResume, setActiveResume] = useState<Resume | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showNewModal, setShowNewModal] = useState(false);
//   const [synced, setSynced] = useState(false);

//   const syncUser = useCallback(async () => {
//     const token = await getToken();
//     if (!token) return;
//     const api = createAuthApi(token);
//     try {
//       await api.post("/users/sync");
//       setSynced(true);
//     } catch (e) {
//       // already exists
//       setSynced(true);
//     }
//   }, [getToken]);

//   const loadData = useCallback(async () => {
//     const token = await getToken();
//     if (!token) return;
//     const api = createAuthApi(token);
//     try {
//       const [iRes, rRes] = await Promise.all([
//         api.get<Interview[]>("/interviews/"),
//         api.get<Resume | null>("/resumes/active"),
//       ]);
//       setInterviews(iRes.data);
//       setActiveResume(rRes.data);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   }, [getToken]);

//   useEffect(() => {
//     if (!isLoaded) return;
//     syncUser().then(loadData);
//   }, [isLoaded, syncUser, loadData]);

//   const completed = interviews.filter((i) => i.status === "completed");
//   const avgScore =
//     completed.length > 0
//       ? (completed.reduce((s, i) => s + (i.total_score ?? 0), 0) / completed.length).toFixed(1)
//       : null;

//   const handleInterviewCreated = (id: string) => {
//     router.push(`/interview/${id}`);
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0a]">
//       <Topbar />
//       <main className="pt-14">
//         <div className="px-6 md:px-10 max-w-5xl mx-auto py-12">

//           {/* ─── Header ─────────────────────────────────────────── */}
//           <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-10">
//             <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">Dashboard</p>
//             <h1 className="font-serif text-3xl md:text-4xl font-light text-[#f0ede6]">
//               Your interviews
//             </h1>
//           </motion.div>

//           {/* ─── Stats ──────────────────────────────────────────── */}
//           <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}
//             className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
//             {[
//               { label: "Total Interviews", value: interviews.length },
//               { label: "Completed", value: completed.length },
//               { label: "Avg Score", value: avgScore ? `${avgScore}/10` : "—" },
//               { label: "Resume", value: activeResume ? "Uploaded" : "None" },
//             ].map((s) => (
//               <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
//                 <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">{s.label}</p>
//                 <p className="text-2xl font-serif text-[#f0ede6] font-light">{s.value}</p>
//               </div>
//             ))}
//           </motion.div>

//           {/* ─── Resume Upload ───────────────────────────────────── */}
//           <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mb-10">
//             <ResumeUpload activeResume={activeResume} onUploaded={loadData} />
//           </motion.div>

//           {/* ─── New Interview CTA ───────────────────────────────── */}
//           <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="mb-10">
//             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div>
//                 <p className="text-[#f0ede6] font-sans text-sm font-medium mb-1">Start a new interview</p>
//                 <p className="text-zinc-500 text-sm">Choose a role and difficulty level. Takes about 15 minutes.</p>
//               </div>
//               <button
//                 onClick={() => setShowNewModal(true)}
//                 className="bg-white text-black rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#f0ede6] transition-colors flex-shrink-0"
//               >
//                 New interview
//               </button>
//             </div>
//           </motion.div>

//           {/* ─── Recent Interviews ───────────────────────────────── */}
//           <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
//             <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4">Recent interviews</p>
//             {loading ? (
//               <div className="space-y-3">
//                 {[0, 1, 2].map((i) => (
//                   <div key={i} className="h-16 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
//                 ))}
//               </div>
//             ) : interviews.length === 0 ? (
//               <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
//                 <p className="text-zinc-500 text-sm">No interviews yet. Start your first one above.</p>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {interviews.map((iv) => (
//                   <Link key={iv.id} href={iv.status === "completed" ? `/report/${iv.id}` : `/interview/${iv.id}`}>
//                     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 flex items-center justify-between hover:border-zinc-700 transition-colors cursor-pointer">
//                       <div className="flex items-center gap-4">
//                         <div>
//                           <p className="text-[#f0ede6] text-sm font-sans">{iv.job_role}</p>
//                           <p className="text-zinc-600 text-xs mt-0.5">
//                             {new Date(iv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
//                           </p>
//                         </div>
//                         <span className={`text-xs border rounded-full px-2.5 py-0.5 ${difficultyColor[iv.difficulty]}`}>
//                           {iv.difficulty}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-4">
//                         {iv.total_score !== null && (
//                           <span className="font-serif text-lg text-[#f0ede6] font-light">{iv.total_score}/10</span>
//                         )}
//                         <span className={`text-xs ${statusColor[iv.status]}`}>{iv.status}</span>
//                       </div>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </motion.div>

//         </div>
//       </main>

//       {showNewModal && (
//         <NewInterviewModal
//           onClose={() => setShowNewModal(false)}
//           onCreated={handleInterviewCreated}
//           activeResumeId={activeResume?.id ?? null}
//         />
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

import Topbar from "@/components/layout/Topbar";
import ResumeUpload from "@/components/ui/ResumeUpload";
import NewInterviewModal from "@/components/ui/NewInterviewModal";

import { createAuthApi } from "@/lib/api";

import type { Interview, Resume } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: "easeOut",
    },
  }),
};

type Difficulty = "junior" | "mid" | "senior";

type InterviewStatus =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

const difficultyColor: Record<Difficulty, string> = {
  junior:
    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  mid:
    "text-amber-400 bg-amber-400/10 border-amber-400/20",
  senior:
    "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const statusColor: Record<InterviewStatus, string> = {
  pending: "text-zinc-400",
  active: "text-blue-400",
  completed: "text-emerald-400",
  cancelled: "text-zinc-600",
};

export default function DashboardPage() {
  const { getToken, isLoaded } = useAuth();

  const router = useRouter();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeResume, setActiveResume] =
    useState<Resume | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showNewModal, setShowNewModal] = useState(false);

  const syncUser = useCallback(async () => {
    try {
      const token = await getToken();

      if (!token) {
        router.push("/sign-in");
        return;
      }

      const api = createAuthApi(token);

      await api.post("/users/sync");
    } catch (error) {
      console.error("User sync failed:", error);
    }
  }, [getToken, router]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      if (!token) {
        router.push("/sign-in");
        return;
      }

      const api = createAuthApi(token);

      const [interviewsRes, resumeRes] = await Promise.all([
        api.get<Interview[]>("/interviews/"),
        api.get<Resume | null>("/resumes/active"),
      ]);

      setInterviews(interviewsRes.data);
      setActiveResume(resumeRes.data);
    } catch (error) {
      console.error("Dashboard load failed:", error);

      setError(
        "Failed to load dashboard data. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    if (!isLoaded) return;

    const initializeDashboard = async () => {
      await syncUser();
      await loadData();
    };

    initializeDashboard();
  }, [isLoaded, syncUser, loadData]);

  const completedInterviews = interviews.filter(
    (interview) => interview.status === "completed"
  );

  const averageScore =
    completedInterviews.length > 0
      ? (
          completedInterviews.reduce(
            (sum, interview) =>
              sum + (interview.total_score ?? 0),
            0
          ) / completedInterviews.length
        ).toFixed(1)
      : null;

  const handleInterviewCreated = (id: string) => {
    router.push(`/interview/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Topbar />

      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">

          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">
              Dashboard
            </p>

            <h1 className="font-serif text-3xl md:text-4xl font-light text-[#f0ede6]">
              Your interviews
            </h1>
          </motion.div>

          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
          >
            {[
              {
                label: "Total Interviews",
                value: interviews.length,
              },
              {
                label: "Completed",
                value: completedInterviews.length,
              },
              {
                label: "Avg Score",
                value: averageScore
                  ? `${averageScore}/10`
                  : "—",
              },
              {
                label: "Resume",
                value: activeResume
                  ? "Uploaded"
                  : "None",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-600">
                  {stat.label}
                </p>

                <p className="font-serif text-2xl font-light text-[#f0ede6]">
                  {stat.value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Resume Upload */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            viewport={{ once: true }}
            className="mb-10"
          >
            <ResumeUpload
              activeResume={activeResume}
              onUploaded={loadData}
            />
          </motion.div>

          {/* New Interview CTA */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-sm font-medium text-[#f0ede6]">
                  Start a new interview
                </p>

                <p className="text-sm text-zinc-500">
                  Choose a role and difficulty level.
                  Takes about 15 minutes.
                </p>
              </div>

              <button
                onClick={() => setShowNewModal(true)}
                aria-label="Start new interview"
                className="flex-shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#f0ede6]"
              >
                New interview
              </button>
            </div>
          </motion.div>

          {/* Recent Interviews */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
            viewport={{ once: true }}
          >
            <p className="mb-4 text-xs uppercase tracking-widest text-zinc-600">
              Recent interviews
            </p>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
                  />
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
                <p className="text-sm text-zinc-500">
                  No interviews yet. Start your first one above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {interviews.map((interview) => {
                  const formattedDate = new Date(
                    interview.created_at
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  const difficulty =
                    interview.difficulty as Difficulty;

                  const status =
                    interview.status as InterviewStatus;

                  return (
                    <Link
                      key={interview.id}
                      href={
                        interview.status === "completed"
                          ? `/report/${interview.id}`
                          : `/interview/${interview.id}`
                      }
                    >
                      <div className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 transition-colors hover:border-zinc-700">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-[#f0ede6]">
                              {interview.job_role}
                            </p>

                            <p className="mt-0.5 text-xs text-zinc-600">
                              {formattedDate}
                            </p>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs ${difficultyColor[difficulty]}`}
                          >
                            {difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          {interview.total_score !==
                            null && (
                            <span className="font-serif text-lg font-light text-[#f0ede6]">
                              {interview.total_score}/10
                            </span>
                          )}

                          <span
                            className={`text-xs ${statusColor[status]}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {showNewModal && (
        <NewInterviewModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleInterviewCreated}
          activeResumeId={activeResume?.id ?? null}
        />
      )}
    </div>
  );
}