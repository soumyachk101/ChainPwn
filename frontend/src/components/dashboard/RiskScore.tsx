"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Bug, Code2, Zap, CheckCircle } from "lucide-react";
import type { AnalysisResult } from "@/types/vulnerability";
import { getRiskColor, getRiskPercent, cn } from "@/lib/utils";

interface RiskScoreProps {
  analysis: AnalysisResult;
}

const CIRCUMFERENCE = 2 * Math.PI * 52;

function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

export default function RiskScore({ analysis }: RiskScoreProps) {
  const riskPercent = getRiskPercent(analysis.overall_risk);
  const riskColor = getRiskColor(analysis.overall_risk);
  const vulnCount = analysis.vulnerabilities.length;
  const criticalCount = analysis.vulnerabilities.filter((v) => v.severity === "CRITICAL").length;
  const highCount = analysis.vulnerabilities.filter((v) => v.severity === "HIGH").length;
  const exploitableCount = analysis.vulnerabilities.filter((v) => v.exploit_possible).length;

  const [mounted, setMounted] = useState(false);
  const animCritical = useAnimatedNumber(criticalCount, 1400);
  const animHigh = useAnimatedNumber(highCount, 1400);
  const animExploitable = useAnimatedNumber(exploitableCount, 1400);
  const animTotal = useAnimatedNumber(vulnCount, 1400);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const gaugeOffset = CIRCUMFERENCE * (1 - (mounted ? riskPercent : 0) / 100);

  const stats = [
    {
      label: "Critical",
      value: animCritical,
      icon: AlertTriangle,
      color: "text-vulnforge-danger",
      bg: "bg-vulnforge-danger/8",
      border: "border-vulnforge-danger/15",
      glow: "0 0 20px rgba(255,56,96,0.08)",
    },
    {
      label: "High",
      value: animHigh,
      icon: Bug,
      color: "text-vulnforge-warning",
      bg: "bg-vulnforge-warning/8",
      border: "border-vulnforge-warning/15",
      glow: "0 0 20px rgba(255,107,53,0.08)",
    },
    {
      label: "Exploitable",
      value: animExploitable,
      icon: Zap,
      color: "text-vulnforge-accent",
      bg: "bg-vulnforge-accent/8",
      border: "border-vulnforge-accent/15",
      glow: "0 0 20px rgba(0,255,136,0.08)",
    },
    {
      label: "Total",
      value: animTotal,
      icon: Code2,
      color: "text-vulnforge-cyan",
      bg: "bg-vulnforge-cyan/8",
      border: "border-vulnforge-cyan/15",
      glow: "0 0 20px rgba(6,182,212,0.08)",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-2xl border border-vulnforge-border/60 overflow-hidden",
        "bg-gradient-to-br from-[#0a0f1a] via-vulnforge-card/40 to-[#0a0f1a]",
        "backdrop-blur-xl"
      )}
      style={{
        boxShadow:
          "0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03), 0 0 60px rgba(0,255,136,0.03)",
      }}
    >
      {/* Ambient glow overlay */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: riskColor }}
      />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-vulnforge-accent/5 blur-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-xs font-semibold text-white/90 flex items-center gap-2 uppercase tracking-[0.12em]"
          >
            <div className="w-6 h-6 rounded-md bg-vulnforge-accent/10 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-vulnforge-accent" />
            </div>
            Risk Assessment
          </motion.h3>
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]"
          >
            {analysis.audit_confidence} confidence
          </motion.span>
        </div>

        {/* Risk gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center mb-6"
        >
          <div className="relative w-36 h-36">
            {/* Ambient glow behind gauge */}
            <div
              className="absolute inset-4 rounded-full blur-xl opacity-30"
              style={{ background: riskColor }}
            />
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Track */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#1e293b"
                strokeWidth="7"
                opacity="0.5"
              />
              {/* Tick marks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i / 60) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const r1 = 44;
                const r2 = 46;
                return (
                  <line
                    key={i}
                    x1={60 + r1 * Math.cos(rad)}
                    y1={60 + r1 * Math.sin(rad)}
                    x2={60 + r2 * Math.cos(rad)}
                    y2={60 + r2 * Math.sin(rad)}
                    stroke={i % 5 === 0 ? "#ffffff10" : "#ffffff05"}
                    strokeWidth={i % 5 === 0 ? 1 : 0.5}
                  />
                );
              })}
              {/* Glow stroke (behind) */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={riskColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={gaugeOffset}
                opacity="0.15"
                style={{
                  transition: "stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: "blur(6px)",
                }}
              />
              {/* Main stroke */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={riskColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={gaugeOffset}
                style={{
                  transition: "stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: `drop-shadow(0 0 6px ${riskColor}60)`,
                }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-2xl font-black tracking-tight"
                style={{
                  color: riskColor,
                  textShadow: `0 0 20px ${riskColor}40, 0 0 40px ${riskColor}20`,
                }}
              >
                {analysis.overall_risk}
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-[10px] text-slate-500 mt-0.5"
              >
                {vulnCount} finding{vulnCount !== 1 ? "s" : ""}
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-300",
                  "hover:scale-[1.02] hover:brightness-110",
                  stat.bg,
                  stat.border
                )}
                style={{ boxShadow: stat.glow }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={cn("w-3 h-3", stat.color)} />
                  <span className="text-[10px] text-slate-400 font-medium">{stat.label}</span>
                </div>
                <span className={cn("text-xl font-bold tabular-nums", stat.color)}>
                  {stat.value}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Safe patterns */}
        <AnimatePresence>
          {analysis.safe_patterns_detected && analysis.safe_patterns_detected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="mt-4 pt-4 border-t border-white/[0.06]"
            >
              <h4 className="text-[10px] font-semibold text-vulnforge-accent mb-2 flex items-center gap-1.5 uppercase tracking-[0.1em]">
                <CheckCircle className="w-3 h-3" />
                Safe Patterns Detected
              </h4>
              <div className="space-y-1">
                {analysis.safe_patterns_detected.map((pattern, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}
                    className="flex items-start gap-2 text-[11px] text-slate-400"
                  >
                    <span className="text-vulnforge-accent/60 mt-px shrink-0">&#10003;</span>
                    <span>{pattern}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
