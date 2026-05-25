"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Shield, Upload, Code2, Zap, Bug, FileCode,
  Terminal, Lock, Crosshair, ArrowRight, Sparkles,
} from "lucide-react";
import { useScanStore } from "@/store/scanStore";

const DEMOS = [
  { name: "EtherStore", file: "EtherStore.sol", desc: "Classic reentrancy — the DAO hack pattern", vuln: "Reentrancy", severity: "CRITICAL" as const, icon: Zap, version: "^0.6.12" },
  { name: "BadToken", file: "BadToken.sol", desc: "Integer overflow in token minting", vuln: "Integer Overflow", severity: "HIGH" as const, icon: Bug, version: "^0.7.6" },
  { name: "SimpleVault", file: "SimpleVault.sol", desc: "Missing access control — anyone drains the vault", vuln: "Access Control", severity: "HIGH" as const, icon: Lock, version: "^0.8.0" },
];

const FEATURES = [
  { icon: Bug, title: "AI Vulnerability Detection", desc: "Claude-powered static analysis detects reentrancy, overflow, access control, flash loan vectors, and 10+ vulnerability classes with precise line-level accuracy.", color: "from-[#ef4444] to-[#f97316]", step: "01" },
  { icon: Terminal, title: "Live Exploit Execution", desc: "For each vulnerability, the AI generates a Hardhat exploit script, deploys the contract on a local EVM, and executes the attack — streaming every step in real-time.", color: "from-[#f97316] to-[#eab308]", step: "02" },
  { icon: FileCode, title: "Auto-Patch Generation", desc: "Generates production-ready patched Solidity code using OpenZeppelin patterns. Side-by-side diff view shows exactly what changed and why.", color: "from-[#00ff88] to-[#06b6d4]", step: "03" },
];

const STEPS = [
  { step: "01", title: "Upload", desc: "Paste Solidity code or drag-and-drop a .sol file", icon: Upload },
  { step: "02", title: "Analyze", desc: "AI scans for 12+ vulnerability classes in seconds", icon: Crosshair },
  { step: "03", title: "Exploit", desc: "Select a vuln — AI writes & runs a real exploit on local EVM", icon: Zap },
  { step: "04", title: "Observe", desc: "Watch the drain via live terminal & balance charts", icon: Terminal },
  { step: "05", title: "Patch", desc: "Get a production-ready contract with side-by-side diff", icon: FileCode },
  { step: "06", title: "Report", desc: "Export a full security report with findings & PoCs", icon: Shield },
];

function TypewriterCycle({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[idx];
    const speed = del ? 40 : 80;
    if (!del && text === word) { const t = setTimeout(() => setDel(true), 2000); return () => clearTimeout(t); }
    if (del && text === "") { setDel(false); setIdx((i) => (i + 1) % words.length); return; }
    const t = setTimeout(() => setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)), speed);
    return () => clearTimeout(t);
  }, [text, del, idx, words]);

  return (
    <span className="inline-block min-w-[260px] text-left">
      <span className="gradient-text-accent font-semibold">{text}</span>
      <span className="inline-block w-[3px] h-[1.1em] bg-[#00ff88] ml-0.5 align-middle animate-pulse-glow rounded-sm" />
    </span>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)", transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { setSourceCode, setContractName, setSolidityVersion } = useScanStore();
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".sol")) return;
    setSourceCode(await file.text());
    setContractName(file.name.replace(".sol", ""));
    router.push("/scan");
  };

  const loadDemo = async (file: string, name: string, version: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/demo-contracts/${file}`);
      if (res.ok) { const d = await res.json(); setSourceCode(typeof d === "string" ? d : d.source_code || ""); }
    } catch {}
    setContractName(name);
    setSolidityVersion(version);
    router.push("/scan");
  };

  return (
    <div className="min-h-screen">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-[#00ff88]/20">
              <Shield className="w-5 h-5 text-[#050810]" />
            </div>
            <span className="text-xl font-bold tracking-tight"><span className="text-[#00ff88]">Vuln</span><span className="text-white">Forge</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[#00ff88] transition-colors">Features</a>
            <a href="#demo" className="text-sm text-[var(--text-secondary)] hover:text-[#00ff88] transition-colors">Demo</a>
            <a href="#how" className="text-sm text-[var(--text-secondary)] hover:text-[#00ff88] transition-colors">How It Works</a>
            <button onClick={() => fileRef.current?.click()} className="px-4 py-2 text-sm font-medium rounded-lg bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 hover:bg-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all btn-glow">Upload Contract</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, y: heroY }} className="relative pt-32 pb-24 px-6 overflow-hidden min-h-[92vh] flex items-center">
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[#00ff88]/[0.03] blur-[120px] animate-float-slow" />
          <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-[10%] left-[40%] w-[350px] h-[350px] rounded-full bg-[#0ea5e9]/[0.03] blur-[90px] animate-float-slow" style={{ animationDelay: "4s" }} />
        </div>
        {/* Particles */}
        <div className="particles">{Array.from({ length: 15 }, (_, i) => <span key={i} />)}</div>
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ff88]/[0.08] border border-[#00ff88]/20 text-[#00ff88] text-sm mb-8 glass">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Offensive Security
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 glitch" data-text="VulnForge">
              <span className="text-white">Vuln</span><span className="neon-text text-[#00ff88]">Forge</span>
            </h1>

            <div className="text-xl md:text-2xl text-[var(--text-secondary)] mb-4 h-8 flex items-center justify-center">
              <TypewriterCycle words={["AI-Powered Smart Contract Security", "Proof-of-Exploit Auditing", "Real-Time Vulnerability Analysis", "Automated Exploit Generation"]} />
            </div>

            <p className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed">
              Upload your Solidity smart contract and watch VulnForge&apos;s AI agents autonomously find vulnerabilities, execute real exploits on a local testnet, and generate production-ready patches — all in real-time.
            </p>

            {/* Upload zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="max-w-2xl mx-auto">
              <div
                className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-500 ${drag ? "border-[#00ff88] bg-[#00ff88]/[0.05] scale-[1.02] glow-accent" : "border-[var(--border-color)] hover:border-[#00ff88]/40 bg-[var(--bg-card)]/50"} p-10 backdrop-blur-sm`}
                onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".sol" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${drag ? "bg-[#00ff88]/20 glow-accent" : "bg-[var(--bg-elevated)] group-hover:bg-[#00ff88]/10"}`}>
                    <Upload className={`w-7 h-7 transition-colors ${drag ? "text-[#00ff88]" : "text-[var(--text-muted)] group-hover:text-[#00ff88]"}`} />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">Drop your .sol file here</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">or click to browse — supports Solidity 0.6.x through 0.8.x</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Full Offensive Security Pipeline</h2>
              <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg">Three AI agents working in concert — auditor, attacker, and developer</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="group relative p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] card-hover overflow-hidden h-full">
                  <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-60 transition-opacity`} />
                  <div className="absolute top-4 right-5 text-6xl font-black text-white/[0.03] select-none">{f.step}</div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}><f.icon className="w-6 h-6 text-white" /></div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CONTRACTS ── */}
      <section id="demo" className="py-24 px-6 bg-[var(--bg-primary)]/50 relative">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Try with Vulnerable Contracts</h2>
              <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg">Pre-loaded deliberately vulnerable contracts for instant demos. Click to load and hack.</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {DEMOS.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.1}>
                <button onClick={() => loadDemo(d.file, d.name, d.version)} disabled={loading} className="group text-left w-full p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] card-hover overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-px ${d.severity === "CRITICAL" ? "bg-[#ef4444]" : "bg-[#f97316]"} opacity-0 group-hover:opacity-60 transition-opacity`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center"><d.icon className="w-5 h-5 text-[#00ff88]" /></div>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full severity-${d.severity.toLowerCase()}`}>{d.severity}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00ff88] transition-colors">{d.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono mb-3">Solidity {d.version}</p>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">{d.desc}</p>
                  <div className="flex items-center gap-2 text-[#00ff88] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Load & Analyze <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">From Code to Proof-of-Exploit</h2>
              <p className="text-[var(--text-secondary)] text-lg">Six steps. Fully automated. Zero false positives.</p>
            </div>
          </Reveal>
          <div className="relative">
            <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-[#00ff88]/40 via-[#0ea5e9]/30 to-[#8b5cf6]/20 hidden md:block" />
            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-[var(--bg-card)]/50 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 group-hover:border-[#00ff88]/30 transition-colors z-10">
                      <span className="text-[#00ff88] font-mono font-bold text-sm">{s.step}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg group-hover:text-[#00ff88] transition-colors">{s.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>
                    </div>
                    <s.icon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[#00ff88]/50 transition-colors shrink-0" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[var(--border-subtle)] py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00ff88]" />
            <span className="text-sm font-medium"><span className="text-[#00ff88]">Vuln</span><span className="text-white">Forge</span></span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Educational security research tool. All exploits run on local testnets only.</p>
        </div>
      </footer>
    </div>
  );
}
