"use client";
import { useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthApi } from "@/lib/api";
import type { Resume } from "@/types";

interface Props {
  activeResume: Resume | null;
  onUploaded: () => void;
}

export default function ResumeUpload({ activeResume, onUploaded }: Props) {
  const { getToken } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const token = await getToken();
      const api = createAuthApi(token!);
      const form = new FormData();
      form.append("file", file);
      await api.post("/resumes/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-600 mb-1">Resume</p>
          <p className="text-[#f0ede6] text-sm">
            {activeResume ? activeResume.filename : "No resume uploaded"}
          </p>
          {activeResume?.skills && activeResume.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeResume.skills.slice(0, 8).map((s: string) => (
                <span key={s} className="bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-full px-2.5 py-0.5 text-xs">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="border border-zinc-700 text-zinc-300 rounded-full px-4 py-1.5 text-xs hover:border-zinc-500 transition-colors flex-shrink-0"
        >
          {activeResume ? "Replace" : "Upload PDF"}
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-zinc-500 bg-zinc-800/40" : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        {uploading ? (
          <p className="text-zinc-500 text-sm animate-pulse">Uploading and parsing…</p>
        ) : (
          <p className="text-zinc-600 text-sm">
            Drop your PDF here or <span className="text-zinc-400 underline underline-offset-2">browse</span>
          </p>
        )}
      </div>

      {error && <p className="text-rose-400 text-xs mt-2">{error}</p>}

      <input ref={fileRef} type="file" accept=".pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}
