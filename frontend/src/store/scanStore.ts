import { create } from "zustand";
import type {
  AnalysisResult,
  ExploitExecution,
  PatchResult,
  ScanPhase,
  StreamMessage,
  Vulnerability,
} from "@/types/vulnerability";
import { generateSessionId } from "@/lib/session";

interface ScanState {
  sessionId: string;
  phase: ScanPhase;
  sourceCode: string;
  contractName: string;
  solidityVersion: string;
  analysisResult: AnalysisResult | null;
  selectedVulnerability: Vulnerability | null;
  exploitExecution: ExploitExecution | null;
  patchResult: PatchResult | null;
  streamLogs: StreamMessage[];
  error: string | null;

  setSourceCode: (code: string) => void;
  setContractName: (name: string) => void;
  setSolidityVersion: (version: string) => void;
  setPhase: (phase: ScanPhase) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  selectVulnerability: (vuln: Vulnerability) => void;
  setExploitExecution: (exec: ExploitExecution | null) => void;
  setPatchResult: (result: PatchResult) => void;
  addStreamLog: (msg: StreamMessage) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  startNewSession: () => void;
}

const initialState = {
  sessionId: "",
  phase: "IDLE" as ScanPhase,
  sourceCode: "",
  contractName: "Unknown",
  solidityVersion: "unknown",
  analysisResult: null,
  selectedVulnerability: null,
  exploitExecution: null,
  patchResult: null,
  streamLogs: [],
  error: null,
};

export const useScanStore = create<ScanState>((set) => ({
  ...initialState,
  sessionId: generateSessionId(),
  setSourceCode: (code) => set({ sourceCode: code }),
  setContractName: (name) => set({ contractName: name }),
  setSolidityVersion: (version) => set({ solidityVersion: version }),
  setPhase: (phase) => set({ phase }),
  setAnalysisResult: (result) => set({ analysisResult: result, phase: "RESULTS" }),
  selectVulnerability: (vuln) => set({ selectedVulnerability: vuln }),
  setExploitExecution: (exec) => set({ exploitExecution: exec }),
  setPatchResult: (result) => set({ patchResult: result, phase: "PATCH_READY" }),
  addStreamLog: (msg) => set((state) => ({ streamLogs: [...state.streamLogs, msg] })),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState, sessionId: generateSessionId() }),
  startNewSession: () => set({ ...initialState, sessionId: generateSessionId() }),
}));
