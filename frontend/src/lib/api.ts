import axios from "axios";
import type { AnalysisResult, PatchResult, DemoContract } from "@/types/vulnerability";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

export async function analyzeContract(
  sourceCode: string,
  contractName: string,
  sessionId: string
): Promise<AnalysisResult & { session_id: string }> {
  const { data } = await api.post("/analyze", {
    source_code: sourceCode,
    contract_name: contractName,
    session_id: sessionId,
  });
  return data;
}

export async function generateExploit(
  sessionId: string,
  vulnerabilityId: string,
  sourceCode?: string,
  contractName?: string,
  initialEth: string = "10"
) {
  const { data } = await api.post("/exploit", {
    session_id: sessionId,
    vulnerability_id: vulnerabilityId,
    source_code: sourceCode,
    contract_name: contractName,
    initial_eth_balance: initialEth,
  });
  return data;
}

export async function executeExploit(sessionId: string, exploitJobId: string) {
  const { data } = await api.post("/exploit/execute", {
    session_id: sessionId,
    exploit_job_id: exploitJobId,
  });
  return data;
}

export async function runExploit(
  sessionId: string,
  vulnerabilityId: string,
  sourceCode: string,
  contractName: string,
  initialEth: string = "10"
) {
  // Step 1: Generate exploit
  const genResult = await generateExploit(sessionId, vulnerabilityId, sourceCode, contractName, initialEth);

  // Step 2: Execute exploit
  const execResult = await executeExploit(sessionId, genResult.exploit_job_id);

  return {
    ...genResult,
    execution: execResult,
  };
}

export async function generatePatch(
  sessionId: string,
  sourceCode: string,
  contractName: string,
  solidityVersion: string,
  vulnerabilities: { id: string; type: string; title: string; description: string; affected_function: string }[]
): Promise<PatchResult & { session_id: string }> {
  const { data } = await api.post("/patch", {
    session_id: sessionId,
    source_code: sourceCode,
    contract_name: contractName,
    solidity_version: solidityVersion,
    vulnerabilities,
  });
  return data;
}

export async function generateReport(
  sessionId: string,
  contractName?: string,
  includeExploits = true,
  includePatches = true
): Promise<{ report_content: string }> {
  const { data } = await api.post("/report", {
    session_id: sessionId,
    contract_name: contractName,
    include_exploits: includeExploits,
    include_patches: includePatches,
  });
  return data;
}

export async function getDemoContracts(): Promise<{ contracts: DemoContract[] }> {
  const { data } = await api.get("/demo-contracts");
  return data;
}

export async function healthCheck(): Promise<boolean> {
  try {
    await api.get("/health");
    return true;
  } catch {
    return false;
  }
}
