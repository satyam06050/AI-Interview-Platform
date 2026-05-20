"use client";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Topbar() {
  return (
    <header className="fixed top-0 w-full z-40 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-zinc-800/60">
      <div className="px-6 md:px-10 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-serif text-[#f0ede6] text-lg hover:text-white transition-colors">
          InterviewAI
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "bg-[#141414] border border-zinc-800",
                userButtonPopoverActionButton: "text-zinc-300 hover:text-[#f0ede6] hover:bg-zinc-800",
                userButtonPopoverActionButtonText: "text-zinc-300",
                userButtonPopoverFooter: "hidden",
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      </div>
    </header>
  );
}
