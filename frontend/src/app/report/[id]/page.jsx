// src/app/report/[id]/page.jsx
import InterviewReport from "@/components/InterviewReport";

export const metadata = { title: "Report – InterviewIQ.AI" };

export default function ReportPage({ params }) {
  return <InterviewReport id={params.id} />;
}
