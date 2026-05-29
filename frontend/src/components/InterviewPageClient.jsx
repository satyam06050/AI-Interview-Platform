"use client";
// src/components/InterviewPageClient.jsx
import { useState } from "react";
import Step1SetUp from "./Step1SetUp";
import Step2Interview from "./Step2Interview";
import Step3Report from "./Step3Report";

export default function InterviewPageClient() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            setInterviewData(report);
            setStep(3);
          }}
        />
      )}
      {step === 3 && <Step3Report report={interviewData} />}
    </div>
  );
}
