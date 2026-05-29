"use client";
// src/components/InterviewReport.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Step3Report from "./Step3Report";

export default function InterviewReport({ id }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/interview/report/${id}`)
      .then((r) => setReport(r.data))
      .catch(console.error);
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }

  return <Step3Report report={report} />;
}
