# Product Requirements Document (PRD)
## VulnForge — AI-Powered Smart Contract Exploit Simulator
**Version:** 1.0.0  
**Status:** Draft  
**Author:** Soumya Chakraborty  
**Last Updated:** May 2026

---

## 1. Executive Summary

VulnForge is an AI-driven Web3 security platform that transforms smart contract auditing from passive static analysis into an active, proof-of-exploit security workflow. A developer uploads their Solidity contract, and VulnForge's AI "Attacker Agent" autonomously detects vulnerabilities, writes real exploit scripts, executes them on a local Hardhat/Foundry test network, and provides a fully patched contract — all within a live dashboard. The "proof-of-drain" demo capability makes it uniquely compelling for hackathon judges and real-world security teams.

---

## 2. Problem Statement

Smart contract vulnerabilities have resulted in over **$3.8 billion** in losses in 2022 alone. Existing auditing tools (Slither, MythX, Securify) are static analyzers — they flag suspicious patterns but **do not prove exploitability**. This creates a dangerous gap:

- Developers dismiss unverified warnings as false positives
- Security researchers must manually write PoC exploits — slow and expensive
- Junior developers lack the expertise to understand *why* flagged code is dangerous
- No automated end-to-end flow exists from "detect → exploit → patch"

VulnForge closes this gap by automating the entire offensive security lifecycle for Solidity contracts.

---

## 3. Target Users

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| **Smart Contract Developers** | Building DeFi protocols, NFT platforms, DAOs | Fast, verified security validation before deployment |
| **Web3 Security Researchers** | Auditors at firms like Trail of Bits, Immunefi | Automated PoC generation to accelerate audits |
| **Hackathon Participants** | Building on-chain projects under time pressure | Quick vulnerability scan before demo |
| **CTF Players** | Web3 security competitions | Practice exploiting vulnerable contracts |
| **DevSecOps Teams** | Integrating security into CI/CD pipelines | Automated contract security gates |

---

## 4. Core Features

### 4.1 Contract Upload & Parsing
- Drag-and-drop `.sol` file upload or paste Solidity code directly into editor
- Monaco Editor with Solidity syntax highlighting
- Multi-file contract support (interfaces, libraries, base contracts)
- ABI extraction and contract structure visualization

### 4.2 AI Vulnerability Detection (Static Phase)
- Powered by Claude AI (Sonnet 4 via Anthropic API)
- Detects the following vulnerability classes:

| Vulnerability | Severity | Description |
|---------------|----------|-------------|
| Reentrancy | Critical | CEI pattern violations, cross-function reentrancy |
| Integer Overflow/Underflow | High | Unchecked arithmetic in pre-0.8.x contracts |
| Access Control | High | Missing `onlyOwner`, unprotected `selfdestruct`/`delegatecall` |
| Flash Loan Attack Vectors | High | Price oracle manipulation, atomic arbitrage |
| Tx.Origin Authentication | Medium | Phishing via `tx.origin` instead of `msg.sender` |
| Timestamp Dependence | Medium | `block.timestamp` manipulation by miners |
| Denial of Service | Medium | Gas limit DoS, unbounded loops, push-over-pull |
| Uninitialized Storage | High | Storage pointer vulnerabilities |
| Delegatecall Injection | Critical | Arbitrary code execution via delegatecall |
| Frontrunning | Medium | MEV-exploitable state transitions |

- Severity scoring (Critical / High / Medium / Low / Informational)
- Code location highlighting with line numbers
- Plain-English explanation of each vulnerability

### 4.3 AI Attacker Agent (Dynamic Phase)
- For each confirmed exploitable vulnerability, the AI agent:
  1. **Generates a Hardhat/Foundry exploit script** (JavaScript or Solidity test)
  2. **Spins up a local test network** (Hardhat in-process or Foundry anvil)
  3. **Deploys the vulnerable contract** with realistic initial state (funded ETH/token balances)
  4. **Executes the exploit** against the deployed contract
  5. **Captures before/after state** (ETH balances, token balances, ownership)
  6. **Reports exploit success** with transaction hash, drained amounts, and execution trace

- Real-time terminal stream showing exploit execution
- Visual proof: balance chart showing token drain in real-time
- Exploit script downloadable as `.js` / `.t.sol`

### 4.4 Automated Patch Generation
- AI generates corrected Solidity code with the vulnerability fixed
- Diff view (side-by-side: vulnerable vs. patched)
- Explanation of fix applied (e.g., "Added ReentrancyGuard, moved balance update before external call")
- One-click copy of patched contract

### 4.5 Security Report Generation
- Downloadable PDF/Markdown report containing:
  - Executive Summary
  - Vulnerability findings table with severity
  - Exploit PoC code per vulnerability
  - Exploit execution results (transaction traces)
  - Patched code sections
  - Remediation checklist
- Shareable report link (stored in Supabase, accessible via unique URL)

### 4.6 Live Demo Mode (Hackathon Feature)
- Pre-loaded deliberately vulnerable contracts (EtherStore reentrancy, BadToken overflow, etc.)
- One-click "Full Attack Simulation" button for live demos
- Real-time terminal with animated execution
- Fullscreen "Judge Mode" optimized for projector display

---

## 5. User Stories

**As a smart contract developer,**
- I want to upload my `.sol` file and see all vulnerabilities highlighted inline so I can understand exactly what to fix
- I want to see the AI actually drain my test contract so I viscerally understand the severity of the bug
- I want a patched version of my code I can drop in as a replacement

**As a security researcher,**
- I want the AI to generate exploit PoC scripts I can use as a starting point for manual auditing
- I want to run scans via API so I can integrate this into my CI/CD pipeline
- I want downloadable reports in a format suitable for client deliverables

**As a hackathon judge,**
- I want to see a live, undeniable demo where tokens get drained in real-time on screen
- I want to understand the system's depth beyond a static analysis tool

---

## 6. Non-Goals (Out of Scope for v1)

- Mainnet deployment or live contract scanning (only local testnets)
- Support for non-EVM chains (Solana, Aptos, etc.) — future roadmap
- Full formal verification (not PoC-level, that's a different product)
- Paying customers / billing system (v1 is a hackathon/demo build)
- Multi-user collaboration features
- Vyper or Cairo contract support

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Time from upload to first vulnerability result | < 15 seconds |
| Time from detection to exploit execution complete | < 60 seconds |
| Exploit success rate on known-vulnerable contracts | > 90% |
| False positive rate on vulnerability detection | < 10% |
| Patch acceptance rate (does patched code compile) | 100% |

---

## 8. User Journey / Flow

```
Upload Contract (.sol)
        ↓
  Parse & Validate
  (Monaco Editor shows code)
        ↓
  AI Static Analysis
  (Vulnerabilities highlighted inline)
        ↓
  User Selects Vulnerability to Exploit
        ↓
  AI Attacker Agent Kicks Off
  ├── Generates exploit script
  ├── Spins up Hardhat node
  ├── Deploys contract
  ├── Executes exploit
  └── Streams terminal output to dashboard
        ↓
  Exploit Result Displayed
  (Balance drained, tx trace shown)
        ↓
  Patched Code Generated
  (Diff view, downloadable)
        ↓
  Download Security Report (PDF)
```

---

## 9. Design Principles

- **Prove it, don't just say it** — every finding should have a working exploit or be clearly marked unverified
- **Developer-first UX** — security insights in plain English alongside technical details
- **Speed over exhaustiveness** — fast enough to use during a hackathon, thorough enough for real audits
- **Transparency** — show the AI's reasoning, show the exploit code, show the terminal — nothing is a black box

---

## 10. Competitive Landscape

| Tool | Type | Exploits? | Auto-Patch? | AI? |
|------|------|-----------|-------------|-----|
| Slither | Static Analyzer | ❌ | ❌ | ❌ |
| MythX | Symbolic Execution | ❌ | ❌ | ❌ |
| Echidna | Fuzzer | Partial | ❌ | ❌ |
| **VulnForge** | AI Attacker Agent | ✅ Live PoC | ✅ Auto | ✅ Claude |

---

## 11. Milestones (Hackathon Timeline)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup & Backend | Hour 0–4 | Hardhat node + contract deployment working |
| AI Integration | Hour 4–8 | Vulnerability detection + exploit generation via Claude |
| Exploit Execution | Hour 8–14 | End-to-end exploit pipeline working |
| Frontend Dashboard | Hour 14–20 | Next.js dashboard with Monaco editor + terminal stream |
| Demo Polish | Hour 20–24 | Pre-loaded vulnerable contracts, judge mode, report export |
