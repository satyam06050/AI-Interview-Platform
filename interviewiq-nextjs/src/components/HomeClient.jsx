"use client";
// src/components/HomeClient.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "@/redux/userSlice";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import { motion } from "framer-motion";
import {
  BsRobot, BsMic, BsClock, BsBarChart, BsFileEarmarkText,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useRouter } from "next/navigation";
import Image from "next/image";

import hrImg from "@/assets/HR.png";
import techImg from "@/assets/tech.png";
import confidenceImg from "@/assets/confi.png";
import creditImg from "@/assets/credit.png";
import evalImg from "@/assets/ai-ans.png";
import resumeImg from "@/assets/resume.png";
import pdfImg from "@/assets/pdf.png";
import analyticsImg from "@/assets/history.png";

export default function HomeClient({ initialUser }) {
  const dispatch = useDispatch();
  const { userData } = useSelector((s) => s.user);
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialUser) dispatch(setUserData(initialUser));
  }, [initialUser, dispatch]);

  const guard = (path) => {
    if (!userData) { setShowAuth(true); return; }
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      <Navbar />

      <div className="flex-1 px-6 py-20">
        <div className="max-w-6xl mx-auto">

          {/* badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2">
              <HiSparkles size={16} className="text-green-600" />
              AI Powered Smart Interview Platform
            </div>
          </div>

          {/* hero */}
          <div className="text-center mb-28">
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto"
            >
              Practice Interviews with{" "}
              <span className="bg-green-100 text-green-600 px-5 py-1 rounded-full">
                AI Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg"
            >
              Role-based mock interviews with smart follow-ups, adaptive difficulty and
              real-time performance evaluation.
            </motion.p>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <motion.button
                onClick={() => guard("/interview")}
                whileHover={{ opacity: 0.9, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-white px-10 py-3 rounded-full shadow-md"
              >
                Start Interview
              </motion.button>
              <motion.button
                onClick={() => guard("/history")}
                whileHover={{ opacity: 0.9, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="border border-gray-300 px-10 py-3 rounded-full hover:bg-gray-100 transition"
              >
                View History
              </motion.button>
            </div>
          </div>

          {/* steps */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-10 mb-28">
            {[
              { icon: <BsRobot size={24} />, step: "STEP 1", title: "Role & Experience Selection", desc: "AI adjusts difficulty based on selected job role." },
              { icon: <BsMic size={24} />, step: "STEP 2", title: "Smart Voice Interview", desc: "Dynamic follow-up questions based on your answers." },
              { icon: <BsClock size={24} />, step: "STEP 3", title: "Timer Based Simulation", desc: "Real interview pressure with time tracking." },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 + index * 0.2 }}
                whileHover={{ scale: 1.06 }}
                className={`relative bg-white rounded-3xl border-2 border-green-100 hover:border-green-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl transition-all duration-300
                  ${index === 0 ? "rotate-[-4deg]" : ""}
                  ${index === 1 ? "rotate-[3deg] md:-mt-6 shadow-xl" : ""}
                  ${index === 2 ? "rotate-[-3deg]" : ""}`}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-green-500 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                  {item.icon}
                </div>
                <div className="pt-10 text-center">
                  <div className="text-xs text-green-600 font-semibold mb-2 tracking-wider">{item.step}</div>
                  <h3 className="font-semibold mb-3 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* capabilities */}
          <div className="mb-32">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-4xl font-semibold text-center mb-16">
              Advanced AI <span className="text-green-600">Capabilities</span>
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-10">
              {[
                { image: evalImg, icon: <BsBarChart size={20} />, title: "AI Answer Evaluation", desc: "Scores communication, technical accuracy and confidence." },
                { image: resumeImg, icon: <BsFileEarmarkText size={20} />, title: "Resume Based Interview", desc: "Project-specific questions based on uploaded resume." },
                { image: pdfImg, icon: <BsFileEarmarkText size={20} />, title: "Downloadable PDF Report", desc: "Detailed strengths, weaknesses and improvement insights." },
                { image: analyticsImg, icon: <BsBarChart size={20} />, title: "History & Analytics", desc: "Track progress with performance graphs and topic analysis." },
              ].map((item, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2 flex justify-center">
                      <Image src={item.image} alt={item.title} className="w-full h-auto object-contain max-h-64" />
                    </div>
                    <div className="w-full md:w-1/2">
                      <div className="bg-green-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">{item.icon}</div>
                      <h3 className="font-semibold mb-3 text-xl">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* modes */}
          <div className="mb-32">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-4xl font-semibold text-center mb-16">
              Multiple Interview <span className="text-green-600">Modes</span>
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-10">
              {[
                { img: hrImg, title: "HR Interview Mode", desc: "Behavioral and communication based evaluation." },
                { img: techImg, title: "Technical Mode", desc: "Deep technical questioning based on selected role." },
                { img: confidenceImg, title: "Confidence Detection", desc: "Basic tone and voice analysis insights." },
                { img: creditImg, title: "Credits System", desc: "Unlock premium interview sessions easily." },
              ].map((mode, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between gap-6">
                    <div className="w-1/2">
                      <h3 className="font-semibold text-xl mb-3">{mode.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{mode.desc}</p>
                    </div>
                    <div className="w-1/2 flex justify-end">
                      <Image src={mode.img} alt={mode.title} className="w-28 h-28 object-contain" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <Footer />
    </div>
  );
}
