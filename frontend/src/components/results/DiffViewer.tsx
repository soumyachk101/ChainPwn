"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowRight, FileCode2, Maximize2, Minimize2 } from "lucide-react";
import type { ExploitExecution } from "@/types/vulnerability";
import { cn } from "@/lib/utils";

const ReactDiffViewer = dynamic(() => import("react-diff-viewer-continued"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-vulnforge-accent/20 border-t-vulnforge-accent rounded-full animate-spin" />
        <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-b-vulnforge-accent/30 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      <span className="text-xs text-slate-500 font-mono">Loading diff viewer...</span>
    </div>
  ),
});

interface DiffViewerProps {
  originalCode: string;
  patchedCode: string;
  exploitExecution?: ExploitExecution | null;
}

export default function DiffViewer({ originalCode, patchedCode }: DiffViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-xl overflow-hidden border border-vulnforge-border/60",
        "bg-[#050810]",
        "backdrop-blur-xl",
        isExpanded ? "fixed inset-4 z-50" : "relative"
      )}
      style={{
        boxShadow: "0 0 40px rgba(0,0,0,0.4), 0 0 80px rgba(0,0,0,0.2)",
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-vulnforge-danger/30 via-white/10 to-vulnforge-accent/30 z-10" />

      {/* Header */}
      <div className="relative bg-[#0a0d14] px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* File indicators */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-vulnforge-danger/10 border border-vulnforge-danger/20">
                <FileCode2 className="w-3 h-3 text-vulnforge-danger/80" />
                <span className="text-[11px] font-mono text-vulnforge-danger/80">vulnerable.sol</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-px bg-gradient-to-r from-vulnforge-danger/40 to-vulnforge-accent/40" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <div className="w-4 h-px bg-gradient-to-r from-vulnforge-accent/40 to-vulnforge-accent/20" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-vulnforge-accent/10 border border-vulnforge-accent/20">
                <FileCode2 className="w-3 h-3 text-vulnforge-accent/80" />
                <span className="text-[11px] font-mono text-vulnforge-accent/80">patched.sol</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-7 h-7 rounded-md flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Diff viewer container */}
      <div
        className={cn(
          "overflow-auto",
          isExpanded ? "h-[calc(100%-48px)]" : "max-h-[500px]"
        )}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,255,136,0.12) transparent",
        }}
      >
        <ReactDiffViewer
          oldValue={originalCode}
          newValue={patchedCode}
          splitView={true}
          useDarkTheme={true}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: "#050810",
                diffViewerColor: "#e2e8f0",
                addedBackground: "#00ff880a",
                addedColor: "#00ff88",
                removedBackground: "#ff38600a",
                removedColor: "#ff3860",
                wordAddedBackground: "#00ff881a",
                wordRemovedBackground: "#ff38601a",
                addedGutterBackground: "#00ff8808",
                removedGutterBackground: "#ff386008",
                gutterBackground: "#050810",
                gutterBackgroundDark: "#030508",
                highlightBackground: "#00ff8810",
                highlightGutterBackground: "#00ff8808",
                codeFoldGutterBackground: "#0a0d14",
                codeFoldBackground: "#0a0d14",
                emptyLineBackground: "#050810",
                gutterColor: "#1e293b",
                addedGutterColor: "#00ff8860",
                removedGutterColor: "#ff386060",
                codeFoldContentColor: "#475569",
                diffViewerTitleBackground: "#0a0d14",
                diffViewerTitleColor: "#e2e8f0",
                diffViewerTitleBorderColor: "#1e293b",
              },
            },
            line: {
              fontSize: "12.5px",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: "22px",
              letterSpacing: "0.2px",
            },
            codeFold: {
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
            },
          }}
        />
      </div>
    </motion.div>
  );
}
