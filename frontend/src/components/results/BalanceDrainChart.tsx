"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingDown, ArrowDown, Wallet } from "lucide-react";

interface BalanceDrainChartProps {
  preBalance: string;
  postBalance: string;
  attackerBalance: string;
  drained?: string;
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{display.toFixed(4)}</>;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="px-3 py-2.5 rounded-xl border border-white/[0.08] backdrop-blur-xl"
      style={{
        background: "rgba(10, 14, 23, 0.95)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      <p className="text-[11px] text-slate-400 font-medium mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <div
            className="w-2 h-2 rounded-sm"
            style={{ background: entry.color }}
          />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="text-white font-mono font-medium">{entry.value.toFixed(4)} ETH</span>
        </div>
      ))}
    </div>
  );
}

export default function BalanceDrainChart({
  preBalance,
  postBalance,
  attackerBalance,
  drained,
}: BalanceDrainChartProps) {
  const parseEth = (val: string) => parseFloat(val.replace(/[^\d.]/g, "")) || 0;

  const pre = parseEth(preBalance);
  const post = parseEth(postBalance);
  const attacker = parseEth(attackerBalance);
  const drainedAmount = drained ? parseEth(drained) : pre - post;
  const isDrained = drainedAmount > 0;

  const data = [
    { name: "Contract", before: pre, after: post },
    { name: "Attacker", before: 0, after: attacker },
  ];

  const summaryStats = [
    { label: "Before", value: pre, color: "#3b82f6", icon: Wallet },
    { label: "Drained", value: drainedAmount, color: "#ff3860", icon: ArrowDown },
    { label: "After", value: post, color: isDrained ? "#ff3860" : "#3b82f6", icon: TrendingDown },
    { label: "Attacker Gained", value: attacker, color: "#00ff88", icon: TrendingDown },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-full bg-gradient-to-br from-[#0a0f1a] via-vulnforge-card/30 to-[#0a0f1a] rounded-xl border border-vulnforge-border/60 p-5 flex flex-col relative overflow-hidden backdrop-blur-xl"
      style={{
        boxShadow: isDrained
          ? "0 0 30px rgba(255,56,96,0.06), inset 0 1px 0 rgba(255,255,255,0.03)"
          : "0 0 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Ambient glow */}
      {isDrained && (
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-vulnforge-danger/5 blur-3xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-vulnforge-danger/10 flex items-center justify-center">
            <TrendingDown className="w-3.5 h-3.5 text-vulnforge-danger/80" />
          </div>
          <h4 className="text-xs font-semibold text-white/80 uppercase tracking-[0.1em]">
            Balance Drain
          </h4>
        </div>
        {drainedAmount > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-xs font-mono px-2.5 py-1 rounded-lg bg-vulnforge-danger/10 text-vulnforge-danger border border-vulnforge-danger/25"
            style={{
              boxShadow: "0 0 12px rgba(255,56,96,0.15)",
              textShadow: "0 0 10px rgba(255,56,96,0.3)",
            }}
          >
            -<AnimatedNumber value={drainedAmount} /> ETH
          </motion.span>
        )}
      </div>

      {/* Chart */}
      <div className="relative flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={10} barSize={28}>
            <defs>
              <linearGradient id="grad-before" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="grad-after-red" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff3860" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ff3860" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="grad-after-green" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#00ff88" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="grad-neutral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#475569" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="before"
              name="Before"
              radius={[6, 6, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell key={i} fill="url(#grad-before)" />
              ))}
            </Bar>
            <Bar
              dataKey="after"
              name="After"
              radius={[6, 6, 0, 0]}
              animationDuration={1400}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === 0 && isDrained
                      ? "url(#grad-after-red)"
                      : i === 1 && isDrained
                      ? "url(#grad-after-green)"
                      : "url(#grad-neutral)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats row */}
      <div className="relative grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/[0.04]">
        {summaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className="w-2.5 h-2.5" style={{ color: stat.color + "80" }} />
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <span
                className="text-[12px] font-mono font-semibold"
                style={{ color: stat.color }}
              >
                {stat.value.toFixed(4)}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="relative flex items-center justify-center gap-5 mt-3 pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/70" />
          <span className="text-[10px] text-slate-500">Before</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-sm ${isDrained ? "bg-vulnforge-accent" : "bg-slate-600"}`} />
          <span className="text-[10px] text-slate-500">After</span>
        </div>
      </div>
    </motion.div>
  );
}
