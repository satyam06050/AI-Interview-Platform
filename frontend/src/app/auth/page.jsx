// src/app/auth/page.jsx
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign In – InterviewIQ.AI" };

export default function AuthPage() {
  return <AuthForm isModel={false} />;
}
