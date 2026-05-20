export type Difficulty = "junior" | "mid" | "senior";
export type InterviewStatus = "pending" | "active" | "completed" | "cancelled";
export type MessageRole = "assistant" | "user";

export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Resume {
  id: string;
  filename: string;
  skills: string[];
  experience: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Interview {
  id: string;
  job_role: string;
  difficulty: Difficulty;
  status: InterviewStatus;
  total_score: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  resume_id: string | null;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  question_index: number | null;
  created_at: string;
}

export interface Evaluation {
  id: string;
  question: string;
  answer: string;
  score: number | null;
  clarity_score: number | null;
  relevance_score: number | null;
  depth_score: number | null;
  feedback: string | null;
  strengths: string[];
  improvements: string[];
}

export interface Report {
  interview: Interview;
  messages: Message[];
  evaluations: Evaluation[];
  average_score: number | null;
  average_clarity: number | null;
  average_relevance: number | null;
  average_depth: number | null;
}

export interface NextQuestionResponse {
  message: Message;
  is_complete: boolean;
  question_number: number;
  total_questions: number;
}
