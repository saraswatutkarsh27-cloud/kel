"use client";

import dynamic from "next/dynamic";

// Dynamically import the App component with no SSR since it uses browser APIs
const IDEApp = dynamic(() => import("@/components/IDEApp"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-text-accent/30 border-t-text-accent rounded-full animate-spin" />
        <p className="text-sm text-text-muted">Loading KEL IDE...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <IDEApp />;
}
