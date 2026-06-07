import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KEL IDE",
  description: "AI-powered professional web IDE",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
