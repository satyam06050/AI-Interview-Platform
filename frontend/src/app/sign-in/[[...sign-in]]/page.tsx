import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-serif text-[#f0ede6] text-2xl">InterviewAI</span>
          <p className="text-zinc-500 text-sm mt-2">Sign in to continue</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#141414] border border-zinc-800 shadow-none rounded-2xl",
              headerTitle: "text-[#f0ede6] font-serif font-light",
              headerSubtitle: "text-zinc-500",
              socialButtonsBlockButton: "bg-zinc-900 border-zinc-700 text-[#f0ede6] hover:bg-zinc-800",
              dividerLine: "bg-zinc-800",
              dividerText: "text-zinc-600",
              formFieldLabel: "text-zinc-400",
              formFieldInput: "bg-zinc-900 border-zinc-700 text-[#f0ede6] focus:border-zinc-500",
              formButtonPrimary: "bg-white text-black hover:bg-[#f0ede6] rounded-full",
              footerActionLink: "text-zinc-400 hover:text-[#f0ede6]",
              identityPreviewText: "text-zinc-300",
              identityPreviewEditButton: "text-zinc-500",
            },
          }}
        />
      </div>
    </div>
  );
}
