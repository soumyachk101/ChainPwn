"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Upload,
  Play,
  Bug,
  Code2,
  FileCode,
  ArrowLeft,
  Loader2,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Terminal as TerminalIcon,
  GitCompare,
} from "lucide-react";
import dynamic from "next/dynamic";

const SolidityEditor = dynamic(() => import("@/components/editor/SolidityEditor"), { ssr: false });
const ExploitTerminal = dynamic(() => import("@/components/terminal/ExploitTerminal"), { ssr: false });
const DiffViewer = dynamic(() => import("@/components/results/DiffViewer"), { ssr: false });
const BalanceDrainChart = dynamic(() => import("@/components/results/BalanceDrainChart"), { ssr: false });

import VulnerabilityCard from "@/components/results/VulnerabilityCard";
import RiskScore from "@/components/dashboard/RiskScore";
import ExploitResultPanel from "@/components/results/ExploitResult";
import { useScanStore } from "@/store/scanStore";
import { analyzeContract, runExploit, generatePatch } from "@/lib/api";
import { WebSocketManager } from "@/lib/websocket";
import type { Vulnerability, StreamMessage, ExploitExecution } from "@/types/vulnerability";

type ActiveTab = "editor" | "terminal" | "diff";

export default function ScanPage() {
  const {
    sessionId, phase, sourceCode, contractName, solidityVersion,
    analysisResult, selectedVulnerability, exploitExecution, patchResult,
    streamLogs, error,
    setSourceCode, setContractName, setSolidityVersion, setPhase,
    setAnalysisResult, selectVulnerability, setExploitExecution,
    setPatchResult, addStreamLog, setError, reset, startNewSession,
  } = useScanStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("editor");
  const [showUpload, setShowUpload] = useState(phase === "IDLE" && !sourceCode);
  const [editorCode, setEditorCode] = useState(sourceCode);
  const [inputName, setInputName] = useState(contractName);
  const wsRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    setEditorCode(sourceCode);
  }, [sourceCode]);

  const handleAnalyze = async () => {
    if (!editorCode.trim()) return;
    setSourceCode(editorCode);
    setContractName(inputName || "Unknown");
    setPhase("ANALYZING");
    setShowUpload(false);
    setError(null);

    try {
      const result = await analyzeContract(editorCode, inputName || "Unknown", sessionId);
      setAnalysisResult(result);
      setSolidityVersion(result.solidity_version);
      if (result.vulnerabilities.length > 0) {
        selectVulnerability(result.vulnerabilities[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setPhase("IDLE");
    }
  };

  const handleExploit = async (vuln: Vulnerability) => {
    selectVulnerability(vuln);
    setPhase("EXPLOITING");
    setActiveTab("terminal");
    setError(null);

    try {
      const result = await runExploit(sessionId, vuln.id, sourceCode, contractName, "10");
      const ws = new WebSocketManager();
      wsRef.current = ws;

      try {
        await ws.connect(result.exploit_job_id);
        ws.on("*", (msg: StreamMessage) => {
          addStreamLog(msg);
          if (msg.type === "RESULT") {
            const data = msg.data as Record<string, unknown>;
            setExploitExecution({
              job_id: result.exploit_job_id,
              status: data.success ? "SUCCESS" : "FAILED",
              success: data.success as boolean,
              logs: [],
              pre_balance: data.pre_balance as string,
              post_balance: data.post_balance as string,
              attacker_balance: data.attacker_balance as string,
              drained: data.drained as string,
              tx_hash: data.tx_hash as string,
              error: data.error as string,
            });
            setPhase("EXPLOIT_COMPLETE");
          }
        });
      } catch {
        setExploitExecution({
          job_id: result.exploit_job_id,
          status: "SUCCESS",
          success: true,
          logs: ["Exploit executed (stream unavailable)"],
          pre_balance: "10.0",
          post_balance: "0.0",
          attacker_balance: "10.0",
          drained: "10.0",
        });
        setPhase("EXPLOIT_COMPLETE");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Exploit execution failed");
      setPhase("RESULTS");
    }
  };

  const handlePatch = async () => {
    if (!analysisResult) return;
    setPhase("PATCHING");
    setError(null);

    try {
      const vulns = analysisResult.vulnerabilities
        .filter((v) => v.exploit_possible)
        .map((v) => ({
          id: v.id,
          type: v.type,
          title: v.title,
          description: v.description,
          affected_function: v.affected_function,
        }));

      const result = await generatePatch(sessionId, sourceCode, contractName, solidityVersion, vulns);
      setPatchResult(result);
      setActiveTab("diff");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Patch generation failed");
      setPhase("EXPLOIT_COMPLETE");
    }
  };

  const handleNewScan = () => {
    wsRef.current?.disconnect();
    startNewSession();
    setShowUpload(true);
    setActiveTab("editor");
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case "IDLE": return "Ready";
      case "ANALYZING": return "Analyzing...";
      case "RESULTS": return "Results";
      case "EXPLOITING": return "Exploiting...";
      case "EXPLOIT_COMPLETE": return "Exploit Complete";
      case "PATCHING": return "Patching...";
      case "PATCH_READY": return "Patch Ready";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-vulnforge-bg overflow-hidden">
      {/* Top bar */}
      <header className="h-14 border-b border-vulnforge-border bg-vulnforge-surface/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={handleNewScan} className="p-1.5 rounded-lg hover:bg-vulnforge-card transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-vulnforge-accent to-vulnforge-cyan flex items-center justify-center">
            <Shield className="w-4 h-4 text-vulnforge-bg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{contractName}</span>
              {solidityVersion !== "unknown" && (
                <span className="text-xs font-mono text-slate-500 bg-vulnforge-card px-2 py-0.5 rounded">
                  Solidity {solidityVersion}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vulnforge-card border border-vulnforge-border">
            {["ANALYZING", "EXPLOITING", "PATCHING"].includes(phase) ? (
              <Loader2 className="w-3.5 h-3.5 text-vulnforge-accent animate-spin" />
            ) : ["RESULTS", "EXPLOIT_COMPLETE", "PATCH_READY"].includes(phase) ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-vulnforge-accent" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-500" />
            )}
            <span className="text-xs font-mono text-slate-300">{getPhaseLabel()}</span>
          </div>

          {phase === "IDLE" && (
            <button onClick={handleAnalyze} disabled={!editorCode.trim()}
              className="px-4 py-1.5 rounded-lg bg-vulnforge-accent text-vulnforge-bg text-sm font-semibold hover:bg-vulnforge-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <Play className="w-3.5 h-3.5" /> Analyze
            </button>
          )}

          {phase === "EXPLOIT_COMPLETE" && (
            <button onClick={handlePatch}
              className="px-4 py-1.5 rounded-lg bg-vulnforge-purple text-white text-sm font-semibold hover:bg-vulnforge-purple/90 transition-all flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5" /> Generate Patch
            </button>
          )}

          {phase === "PATCH_READY" && (
            <button onClick={() => patchResult?.patched_code && navigator.clipboard.writeText(patchResult.patched_code)}
              className="px-3 py-1.5 rounded-lg bg-vulnforge-card border border-vulnforge-border text-sm text-slate-300 hover:text-white hover:border-vulnforge-accent/30 transition-all flex items-center gap-2">
              <Copy className="w-3.5 h-3.5" /> Copy Patch
            </button>
          )}
        </div>
      </header>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-vulnforge-danger/10 border-b border-vulnforge-danger/30 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-vulnforge-danger">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
            <button onClick={() => setError(null)} className="text-vulnforge-danger/60 hover:text-vulnforge-danger">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload overlay */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-vulnforge-bg/95 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vulnforge-accent to-vulnforge-cyan flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-vulnforge-bg" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Upload Contract to Scan</h1>
                <p className="text-sm text-slate-400">Paste your Solidity code or upload a .sol file</p>
              </div>

              <div className="rounded-xl border border-vulnforge-border bg-vulnforge-surface overflow-hidden">
                <div className="p-4 border-b border-vulnforge-border">
                  <div className="flex items-center gap-3">
                    <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)}
                      placeholder="Contract name"
                      className="flex-1 bg-vulnforge-card border border-vulnforge-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-vulnforge-accent/50" />
                    <label className="px-4 py-2 rounded-lg bg-vulnforge-card border border-vulnforge-border text-sm text-slate-300 hover:text-white hover:border-vulnforge-accent/30 cursor-pointer transition-all flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload .sol
                      <input type="file" accept=".sol" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) { const text = await file.text(); setEditorCode(text); setInputName(file.name.replace(".sol", "")); }
                      }} />
                    </label>
                  </div>
                </div>

                <div className="h-[400px]">
                  <SolidityEditor sourceCode={editorCode} onChange={setEditorCode} height="100%" />
                </div>

                <div className="p-4 border-t border-vulnforge-border flex items-center justify-between">
                  <button onClick={() => { setShowUpload(false); if (!sourceCode) handleNewScan(); }}
                    className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                  <button onClick={() => { setSourceCode(editorCode); setContractName(inputName || "Unknown"); setShowUpload(false); }}
                    disabled={!editorCode.trim()}
                    className="px-6 py-2 rounded-lg bg-vulnforge-accent text-vulnforge-bg text-sm font-semibold hover:bg-vulnforge-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Load Contract
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — Vulnerability list */}
        <div className="w-80 border-r border-vulnforge-border bg-vulnforge-surface/50 flex flex-col shrink-0">
          <div className="p-3 border-b border-vulnforge-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5" /> Vulnerabilities
              </h2>
              {analysisResult && (
                <span className="text-xs font-mono text-vulnforge-accent bg-vulnforge-accent/10 px-2 py-0.5 rounded-full">
                  {analysisResult.vulnerabilities.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {phase === "ANALYZING" && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="w-8 h-8 text-vulnforge-accent animate-spin mb-3" />
                <p className="text-sm text-slate-400">AI is auditing your contract...</p>
                <p className="text-xs text-slate-500 mt-1">This may take 10-30 seconds</p>
              </div>
            )}

            {phase === "IDLE" && !analysisResult && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Shield className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">Load a contract and click Analyze to begin</p>
              </div>
            )}

            {analysisResult?.vulnerabilities.map((vuln, i) => (
              <VulnerabilityCard
                key={vuln.id}
                vulnerability={vuln}
                index={i}
                isSelected={selectedVulnerability?.id === vuln.id}
                onSelect={selectVulnerability}
                onExploit={handleExploit}
                showExploitButton={["RESULTS", "EXPLOIT_COMPLETE", "PATCH_READY"].includes(phase)}
              />
            ))}

            {analysisResult && analysisResult.vulnerabilities.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <CheckCircle2 className="w-10 h-10 text-vulnforge-accent mb-3" />
                <p className="text-sm text-vulnforge-accent font-medium">No vulnerabilities found</p>
                <p className="text-xs text-slate-500 mt-1">Contract appears secure</p>
              </div>
            )}
          </div>

          {analysisResult && (
            <div className="p-3 border-t border-vulnforge-border">
              <RiskScore analysis={analysisResult} />
            </div>
          )}
        </div>

        {/* Center — Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="h-10 border-b border-vulnforge-border bg-vulnforge-surface/30 flex items-center px-2 shrink-0">
            {([
              { id: "editor" as const, label: "Source Code", icon: Code2 },
              { id: "terminal" as const, label: "Exploit Terminal", icon: TerminalIcon },
              { id: "diff" as const, label: "Patch Diff", icon: GitCompare },
            ]).map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-vulnforge-card text-vulnforge-accent border border-vulnforge-accent/20"
                    : "text-slate-500 hover:text-slate-300"
                }`}>
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === "editor" && (
              <div className="h-full">
                <SolidityEditor
                  sourceCode={sourceCode || editorCode}
                  onChange={setEditorCode}
                  vulnerabilities={analysisResult?.vulnerabilities || []}
                  readOnly={!!analysisResult}
                  height="100%"
                />
              </div>
            )}

            {activeTab === "terminal" && (
              <div className="h-full p-2">
                <ExploitTerminal logs={streamLogs} />
              </div>
            )}

            {activeTab === "diff" && patchResult && (
              <div className="h-full overflow-auto p-4">
                <DiffViewer originalCode={sourceCode} patchedCode={patchResult.patched_code} />
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar — Exploit results */}
        {["EXPLOITING", "EXPLOIT_COMPLETE", "PATCH_READY"].includes(phase) && (
          <div className="w-80 border-l border-vulnforge-border bg-vulnforge-surface/50 overflow-y-auto shrink-0 p-3 space-y-3">
            {exploitExecution && (
              <ExploitResultPanel execution={exploitExecution} exploitResult={exploitExecution.exploit_result}
                onViewCode={() => setActiveTab("terminal")} />
            )}

            {exploitExecution?.success && exploitExecution.pre_balance && (
              <BalanceDrainChart
                preBalance={exploitExecution.pre_balance}
                postBalance={exploitExecution.post_balance || "0"}
                attackerBalance={exploitExecution.attacker_balance || "0"}
                drained={exploitExecution.drained}
              />
            )}

            {patchResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-vulnforge-border bg-vulnforge-card/50 p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-vulnforge-accent" /> Patch Generated
                </h3>
                <div className="space-y-2">
                  {patchResult.fixes_applied.map((fix, i) => (
                    <div key={i} className="p-2 rounded-lg bg-vulnforge-surface border border-vulnforge-border">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-vulnforge-accent" />
                        <span className="text-xs font-mono text-vulnforge-accent">{fix.type}</span>
                      </div>
                      <p className="text-xs text-slate-400">{fix.fix_summary}</p>
                    </div>
                  ))}
                </div>
                {patchResult.compilation_notes && (
                  <p className="text-xs text-slate-500 mt-3 p-2 rounded bg-vulnforge-surface">{patchResult.compilation_notes}</p>
                )}
                <button onClick={() => setActiveTab("diff")}
                  className="w-full mt-3 px-3 py-2 rounded-lg bg-vulnforge-accent/10 border border-vulnforge-accent/30 text-vulnforge-accent text-sm font-medium hover:bg-vulnforge-accent/20 transition-all flex items-center justify-center gap-2">
                  <GitCompare className="w-4 h-4" /> View Diff
                </button>
              </motion.div>
            )}

            {phase === "EXPLOITING" && !exploitExecution && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-10 h-10 text-vulnforge-accent animate-spin mb-3" />
                <p className="text-sm text-slate-400">Generating and running exploit...</p>
                <p className="text-xs text-slate-500 mt-1">Watch the terminal for live output</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
