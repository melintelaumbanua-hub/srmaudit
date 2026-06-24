import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SRMAudit — Security Audit Platform",
  description: "AI-Assisted Cybersecurity Risk Assessment & Security Audit Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0f1e] text-slate-200 antialiased">{children}</body>
    </html>
  );
}
