import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VulnForge — AI-Powered Smart Contract Exploit Simulator",
  description:
    "Detect, exploit, and patch smart contract vulnerabilities with AI. Proof-of-exploit security auditing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050810] text-slate-200 antialiased cyber-grid noise">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00ff88]/[0.02] rounded-full blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#8b5cf6]/[0.025] rounded-full blur-[150px]" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#0ea5e9]/[0.02] rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
