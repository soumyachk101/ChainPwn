<p align="center">
  <img src="https://img.shields.io/badge/VulnForge-v1.0-ff4757?style=for-the-badge&labelColor=0d1117&color=ff4757" alt="VulnForge">
  &nbsp;
  <img src="https://img.shields.io/badge/Smart_Contract-Security-00d2ff?style=for-the-badge&labelColor=0d1117" alt="Smart Contract Security">
  &nbsp;
  <img src="https://img.shields.io/badge/AI-Powered-9b59b6?style=for-the-badge&labelColor=0d1117" alt="AI Powered">
  &nbsp;
  <img src="https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&labelColor=0d1117&logo=python&logoColor=3776ab" alt="Python">
  &nbsp;
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&labelColor=0d1117&logo=next.js&logoColor=white" alt="Next.js">
</p>

<h1 align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" alt="Shield" width="50" height="50" />
  <br>
  <span style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 50%, #00d2ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3.2em; font-weight: 900;">VulnForge</span>
  <br>
  <sub style="color: #8b949e; font-size: 0.5em; font-weight: 400;">AI-Powered Smart Contract Exploit Simulator</sub>
</h1>

<p align="center">
  <b>Detect. Exploit. Patch.</b> — The full offensive security pipeline for Solidity smart contracts.
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/soumyachk101/ChainPwn?style=social" alt="Stars">
  &nbsp;
  <img src="https://img.shields.io/github/forks/soumyachk101/ChainPwn?style=social" alt="Forks">
  &nbsp;
  <img src="https://img.shields.io/github/license/soumyachk101/ChainPwn?style=social" alt="License">
</p>

---

<p align="center">
  <img src="./docs/assets/demo-scan-dashboard.gif" alt="VulnForge Demo — Scan Dashboard" width="800" />
  <br>
  <i>Upload a contract, watch VulnForge find and exploit vulnerabilities in real-time</i>
</p>

---

## Table of Contents

- [Why VulnForge Exists](#why-vulnforge-exists)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Demo Screenshots](#demo-screenshots)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Demo Contracts](#demo-contracts)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [For Security Researchers](#for-security-researchers)
- [License](#license)

---

## Why VulnForge Exists

<table>
<tr>
<td width="50%">

Smart contract vulnerabilities caused **$3.8 billion** in losses in 2022 alone.

Existing tools (Slither, MythX) flag suspicious patterns but **don't prove exploitability**.

VulnForge closes this gap by automating the entire offensive security lifecycle — from detection to proof-of-exploit to remediation.

</td>
<td width="50%">

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#ff4757', 'secondaryColor': '#00d2ff' }}}%%
graph LR
    A["$3.8B Lost<br/>in 2022"] --> B["Static Analysis<br/>(Slither, MythX)"]
    B --> C["Flags Issues<br/>But No Proof"]
    C --> D["VulnForge<br/>Full Pipeline"]
    D --> E["Detect ✅<br/>Exploit ✅<br/>Patch ✅"]

    style A fill:#ff4757,stroke:#ff6b81,color:#fff
    style B fill:#ffa502,stroke:#ffbe76,color:#000
    style C fill:#ffa502,stroke:#ffbe76,color:#000
    style D fill:#00d2ff,stroke:#70a1ff,color:#000
    style E fill:#2ed573,stroke:#7bed9f,color:#000
```

</td>
</tr>
</table>

---

## Key Features

<table>
<tr>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Magnifying%20Glass%20Tilted%20Left.png" alt="Detect" width="64">
<br><b>AI Vulnerability Detection</b>
<br><sub>Claude AI scans for 12+ vulnerability classes with line-level precision</sub>
</td>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Bomb.png" alt="Exploit" width="64">
<br><b>Real Exploit Execution</b>
<br><sub>Generates and runs Hardhat PoC scripts on a local EVM</sub>
</td>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" alt="Patch" width="64">
<br><b>Production-Ready Patches</b>
<br><sub>OpenZeppelin-based fixes with annotated diffs</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Satellite%20Antenna.png" alt="Stream" width="64">
<br><b>Real-Time Streaming</b>
<br><sub>Live terminal output via WebSocket — watch exploits execute</sub>
</td>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Bar%20Chart.png" alt="Charts" width="64">
<br><b>Balance Drain Visualization</b>
<br><sub>Animated charts showing before/after fund movement</sub>
</td>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Robot.png" alt="Fallback" width="64">
<br><b>Works Without API Key</b>
<br><sub>Rule-based fallback for reentrancy, overflow, access control</sub>
</td>
</tr>
</table>

---

## How It Works

VulnForge runs a **three-phase pipeline** powered by AI agents:

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#ff4757', 'lineColor': '#30363d', 'textColor': '#c9d1d9', 'mainBkg': '#161b22' }}}%%
flowchart LR
    subgraph P1[" "]
        direction TB
        A1["Phase 1"] --> A2["ANALYZE"]
        A3["Claude AI scans for<br/>12+ vulnerability classes"]
    end

    subgraph P2[" "]
        direction TB
        B1["Phase 2"] --> B2["EXPLOIT"]
        B3["Generates & runs<br/>Hardhat PoC on local EVM"]
    end

    subgraph P3[" "]
        direction TB
        C1["Phase 3"] --> C2["PATCH"]
        C3["OpenZeppelin-based<br/>production-ready fixes"]
    end

    subgraph O1[" "]
        D1["Vulnerability Report"]
        D2["Line numbers + severity"]
    end

    subgraph O2[" "]
        E1["Live EVM Execution"]
        E2["Balance drain proof"]
    end

    subgraph O3[" "]
        F1["Patched Contract"]
        F2["Side-by-side diff"]
    end

    P1 --> P2 --> P3
    P1 -.-> O1
    P2 -.-> O2
    P3 -.-> O3

    style P1 fill:#1a1a2e,stroke:#ff4757,stroke-width:2px,color:#fff
    style P2 fill:#1a1a2e,stroke:#ffa502,stroke-width:2px,color:#fff
    style P3 fill:#1a1a2e,stroke:#2ed573,stroke-width:2px,color:#fff
    style O1 fill:#0d1117,stroke:#ff4757,stroke-width:1px,color:#ff6b81
    style O2 fill:#0d1117,stroke:#ffa502,stroke-width:1px,color:#ffbe76
    style O3 fill:#0d1117,stroke:#2ed573,stroke-width:1px,color:#7bed9f
```

### Phase 1 — Analyze

> The **Vulnerability Agent** sends your contract to Claude AI, which returns a structured JSON report with severity, line numbers, CWE IDs, and remediation tips.

<p align="center">
  <img src="./docs/assets/demo-analyze.gif" alt="Analyze Phase Demo" width="700" />
</p>

### Phase 2 — Exploit

> The **Exploit Agent** generates a complete Hardhat exploit script, deploys on local EVM, and streams execution output in real-time via WebSocket.

<p align="center">
  <img src="./docs/assets/demo-exploit.gif" alt="Exploit Phase Demo" width="700" />
</p>

### Phase 3 — Patch

> The **Patch Agent** generates a fixed contract using OpenZeppelin patterns, with annotated diffs showing every change.

<p align="center">
  <img src="./docs/assets/demo-patch-diff.gif" alt="Patch Phase Demo" width="700" />
</p>

---

## Demo Screenshots

<table>
<tr>
<td align="center" width="50%">
<b>Landing Page</b><br>
<img src="./docs/assets/screenshot-landing.png" alt="Landing Page" width="400"><br>
<sub>Cybersecurity-themed dark UI with animated gradients</sub>
</td>
<td align="center" width="50%">
<b>Scan Dashboard</b><br>
<img src="./docs/assets/screenshot-dashboard.png" alt="Scan Dashboard" width="400"><br>
<sub>Monaco editor + vulnerability cards + risk gauge</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<b>Exploit Terminal</b><br>
<img src="./docs/assets/screenshot-terminal.png" alt="Exploit Terminal" width="400"><br>
<sub>Real-time xterm.js output streaming exploit execution</sub>
</td>
<td align="center" width="50%">
<b>Balance Drain Chart</b><br>
<img src="./docs/assets/screenshot-balance-chart.png" alt="Balance Drain Chart" width="400"><br>
<sub>Animated Recharts visualization of fund movement</sub>
</td>
</tr>
</table>

> **Note:** To add your own screenshots, capture your app running locally and place them in `docs/assets/`. See [CONTRIBUTING.md](./CONTRIBUTING.md) for screenshot guidelines.

---

## Quick Start

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Python** | 3.10+ | Backend runtime |
| **Node.js** | 18+ | Frontend + Hardhat |
| **npm** | Latest | Package management |
| **Anthropic API Key** | Optional | AI-powered analysis (fallback mode available) |

### 1 — Clone the Repository

```bash
git clone https://github.com/soumyachk101/ChainPwn.git
cd ChainPwn
```

### 2 — Set Up Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Hardhat
cd hardhat_workspace && npm install && cd ..

# Configure (optional — for AI features)
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

### 3 — Set Up Frontend

```bash
cd ../frontend
npm install
```

### 4 — Launch

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate && python main.py

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:3000** and try a demo contract.

---

## Project Structure

```
ChainPwn/
├── Docs/                              # Product documentation
│   ├── PRD_VulnForge_1.md            #   Product Requirements Document
│   ├── TRD_VulnForge_1.md            #   Technical Requirements Document
│   └── AI_Instructions_VulnForge_1.md #   AI agent instructions
│
├── backend/                           # Python FastAPI backend
│   ├── main.py                        #   Entry point — API server
│   ├── deps.py                        #   Shared singletons
│   ├── requirements.txt               #   Python dependencies
│   ├── .env.example                   #   Environment template
│   │
│   ├── agents/                        #   AI agents (the brain)
│   │   ├── vulnerability_agent.py     #     Phase 1: detect
│   │   ├── exploit_agent.py           #     Phase 2: exploit
│   │   └── patch_agent.py             #     Phase 3: patch
│   │
│   ├── blockchain/                    #   EVM execution engine
│   │   ├── hardhat_runner.py          #     Run exploit scripts
│   │   ├── contract_deployer.py       #     Deploy contracts
│   │   └── state_capture.py           #     Capture balances
│   │
│   ├── routers/                       #   API endpoints
│   │   ├── analyze.py                 #     POST /api/analyze
│   │   ├── exploit.py                 #     POST /api/exploit
│   │   ├── patch.py                   #     POST /api/patch
│   │   ├── report.py                  #     POST /api/report
│   │   └── ws.py                      #     WebSocket stream
│   │
│   ├── utils/                         #   Helpers
│   ├── demo_contracts/                #   Vulnerable test contracts
│   ├── templates/                     #   Exploit script templates
│   └── hardhat_workspace/             #   Local Hardhat EVM
│
└── frontend/                          # Next.js 14 frontend
    └── src/
        ├── app/                       #   Pages (landing, scan, API)
        ├── components/                #   UI components
        │   ├── editor/                #     Monaco Solidity editor
        │   ├── terminal/              #     Exploit terminal
        │   ├── dashboard/             #     Risk score gauge
        │   └── results/               #     Cards, diffs, charts
        ├── lib/                       #   API client, WebSocket, utils
        ├── store/                     #   Zustand state
        └── types/                     #   TypeScript definitions
```

---

## Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#ff4757', 'lineColor': '#30363d', 'textColor': '#c9d1d9', 'mainBkg': '#161b22' }}}%%
graph TB
    subgraph Browser["Browser (React / Next.js)"]
        direction LR
        Monaco["Monaco Editor"]
        Terminal["Exploit Terminal"]
        Diff["Diff Viewer"]
        Charts["Balance Charts"]
    end

    subgraph API["FastAPI Backend (Python)"]
        direction LR
        Routers["Routers"]
        Deps["Deps"]
        Sessions["Sessions"]
    end

    subgraph Agents["AI Agents (Claude)"]
        direction LR
        Vuln["Vulnerability<br/>Agent"]
        Exploit["Exploit<br/>Agent"]
        Patch["Patch<br/>Agent"]
    end

    subgraph EVM["Hardhat Local EVM"]
        direction LR
        Deploy["Deploy"]
        Execute["Execute"]
        Capture["Capture"]
    end

    Browser -- "HTTP + WebSocket" --> API
    API --> Agents
    Agents --> EVM

    style Browser fill:#0d1117,stroke:#00d2ff,stroke-width:2px,color:#70a1ff
    style API fill:#0d1117,stroke:#ffa502,stroke-width:2px,color:#ffbe76
    style Agents fill:#0d1117,stroke:#9b59b6,stroke-width:2px,color:#c39bd3
    style EVM fill:#0d1117,stroke:#2ed573,stroke-width:2px,color:#7bed9f
```

---

## API Reference

All endpoints are prefixed with `/api`. Backend runs on `http://localhost:8000`.

<table>
<tr>
<th width="25%">Endpoint</th>
<th width="15%">Method</th>
<th width="60%">Description</th>
</tr>
<tr>
<td><code>/api/health</code></td>
<td><code>GET</code></td>
<td>Health check — returns <code>{"status": "ok"}</code></td>
</tr>
<tr>
<td><code>/api/analyze</code></td>
<td><code>POST</code></td>
<td>Submit contract source code for AI vulnerability analysis</td>
</tr>
<tr>
<td><code>/api/exploit</code></td>
<td><code>POST</code></td>
<td>Generate & execute exploit script for a specific vulnerability</td>
</tr>
<tr>
<td><code>/api/patch</code></td>
<td><code>POST</code></td>
<td>Generate patched contract with OpenZeppelin fixes</td>
</tr>
<tr>
<td><code>/api/report</code></td>
<td><code>POST</code></td>
<td>Generate Markdown security report</td>
</tr>
<tr>
<td><code>/ws/stream/{job_id}</code></td>
<td><code>WS</code></td>
<td>Real-time WebSocket stream of exploit execution</td>
</tr>
<tr>
<td><code>/api/demo-contracts</code></td>
<td><code>GET</code></td>
<td>List available demo contracts</td>
</tr>
</table>

<details>
<summary><b>Full API Request/Response Examples</b></summary>

### Analyze Contract
```json
POST /api/analyze
{
  "source_code": "// Solidity source code...",
  "contract_name": "MyContract",
  "session_id": "unique-session-id"
}
```
```json
Response: {
  "contract_name": "MyContract",
  "solidity_version": "^0.8.0",
  "overall_risk": "CRITICAL",
  "vulnerabilities": [
    {
      "id": "vuln_001",
      "type": "REENTRANCY",
      "severity": "CRITICAL",
      "title": "Reentrancy in withdraw()",
      "line_start": 15,
      "line_end": 22,
      "affected_function": "withdraw()",
      "cwe": "CWE-841",
      "recommendation": "Use ReentrancyGuard"
    }
  ],
  "audit_confidence": "HIGH"
}
```

### Generate & Execute Exploit
```json
POST /api/exploit
{
  "session_id": "unique-session-id",
  "vulnerability_id": "vuln_001",
  "source_code": "// Contract source...",
  "contract_name": "MyContract",
  "initial_eth_balance": "10"
}
```
```json
Response: {
  "exploit_job_id": "uuid",
  "status": "running",
  "ws_stream_url": "/ws/stream/{job_id}",
  "exploit_script": "// Generated Hardhat script...",
  "attack_flow": ["Step 1...", "Step 2..."]
}
```

### Generate Patch
```json
POST /api/patch
{
  "session_id": "unique-session-id",
  "source_code": "// Contract source...",
  "contract_name": "MyContract",
  "solidity_version": "^0.8.0",
  "vulnerabilities": [{ "id": "vuln_001", "type": "REENTRANCY", ... }]
}
```
```json
Response: {
  "patched_code": "// Fixed Solidity code...",
  "fixes_applied": [{ "type": "REENTRANCY", "fix_summary": "Added ReentrancyGuard" }],
  "new_dependencies": ["@openzeppelin/contracts"],
  "compilation_notes": "..."
}
```

### WebSocket Messages
```json
{
  "type": "LOG | STATE | EXPLOIT_CODE | RESULT | ERROR | PHASE",
  "data": "...",
  "job_id": "uuid",
  "timestamp": 1234567890.123
}
```

</details>

---

## Demo Contracts

VulnForge ships with three deliberately vulnerable contracts:

<table>
<tr>
<td width="33%" align="center">

<b style="color: #ff4757;">CRITICAL</b><br>
<b>EtherStore.sol</b><br>
<sub>Reentrancy</sub>

```solidity
function withdraw() public {
  uint256 bal = balances[msg.sender];
  require(bal > 0);
  (bool sent, ) = msg.sender
    .call{value: bal}("");
  // BUG: state update after
  balances[msg.sender] = 0;
}
```

</td>
<td width="33%" align="center">

<b style="color: #ffa502;">HIGH</b><br>
<b>BadToken.sol</b><br>
<sub>Integer Overflow</sub>

```solidity
function mint(uint256 amount) public {
  // BUG: no overflow check
  // in Solidity <0.8.0
  balances[msg.sender] += amount;
  totalSupply += amount;
}
```

</td>
<td width="33%" align="center">

<b style="color: #ffa502;">HIGH</b><br>
<b>SimpleVault.sol</b><br>
<sub>Missing Access Control</sub>

```solidity
function drain(
  address payable recipient
) public {
  // BUG: no onlyOwner!
  recipient.transfer(
    address(this).balance
  );
}
```

</td>
</tr>
</table>

---

## Tech Stack

<table>
<tr>
<td width="50%">

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **Python 3.10+** | Runtime |
| **FastAPI** | Async web framework |
| **Anthropic SDK** | Claude AI integration |
| **Hardhat** | Local Ethereum EVM |
| **ethers.js v6** | Ethereum library |
| **WebSockets** | Real-time streaming |
| **Pydantic** | Validation |

</td>
<td width="50%">

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **Next.js 14** | React framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Cybersecurity dark theme |
| **Monaco Editor** | Code editor |
| **Recharts** | Balance visualization |
| **Zustand** | State management |
| **Framer Motion** | Animations |

</td>
</tr>
</table>

---

## Environment Variables

| Variable | Required | Default | Description |
|:---------|:--------:|:-------:|:------------|
| `ANTHROPIC_API_KEY` | No | — | Anthropic API key for AI agents |
| `HARDHAT_WORKSPACE` | No | `./hardhat_workspace` | Path to Hardhat workspace |
| `MAX_CONCURRENT_EXPLOITS` | No | `5` | Max concurrent exploit jobs |
| `EXPLOIT_TIMEOUT_SECONDS` | No | `60` | Exploit execution timeout |
| `MAX_CONTRACT_SIZE_KB` | No | `500` | Max contract source size |
| `PORT` | No | `8000` | Backend server port |

---

## Without an API Key

VulnForge works **without** an Anthropic API key:

```mermaid
%%{init: {'theme': 'dark' }}%%
graph LR
    subgraph Full["Full AI Mode"]
        FA["Claude AI Analysis"]
        FE["Claude AI Exploits"]
        FP["Claude AI Patches"]
    end
    subgraph Fallback["Fallback Mode (No API Key)"]
        RA["Regex Pattern Matching"]
        RE["Pre-built Templates"]
        RP["Basic Fixes"]
    end

    FA -.->|Fallback| RA
    FE -.->|Fallback| RE
    FP -.->|Fallback| RP

    style Full fill:#1a1a2e,stroke:#9b59b6,stroke-width:2px,color:#c39bd3
    style Fallback fill:#1a1a2e,stroke:#ffa502,stroke-width:2px,color:#ffbe76
```

To enable full AI capabilities, add your key to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

## Troubleshooting

<details>
<summary><b>"Hardhat node_modules not found"</b></summary>

```bash
cd backend/hardhat_workspace
npm install
```
</details>

<details>
<summary><b>"npx: command not found"</b></summary>

Install Node.js from [nodejs.org](https://nodejs.org/).
</details>

<details>
<summary><b>Frontend won't start</b></summary>

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```
</details>

<details>
<summary><b>Backend import errors</b></summary>

Run from the `backend/` directory with venv activated:
```bash
cd backend
source venv/bin/activate
python main.py
```
</details>

---

## For Security Researchers

VulnForge is designed for **authorized security testing and education**. Exploit execution runs on a **local Hardhat testnet only** — no real funds at risk.

| Use Case | Description |
|:---------|:------------|
| **Smart Contract Audits** | Accelerate vulnerability discovery with AI |
| **CTF Competitions** | Practice exploiting vulnerable contracts |
| **Education** | Understand reentrancy, overflow, and other attacks |
| **DevSecOps** | Integrate into CI/CD as a security gate |

---

## License

This project is for educational and authorized security research purposes.

---

## Acknowledgments

[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Secure_Contracts-4E5EE4?style=for-the-badge&logo=openzeppelin&logoColor=white)](https://www.openzeppelin.com/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Dev_Environment-FFF04D?style=for-the-badge&logo=hardhat&logoColor=000)](https://hardhat.org/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude_AI-D4A574?style=for-the-badge)](https://www.anthropic.com/)
[![Monaco Editor](https://img.shields.io/badge/Monaco-Editor-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://microsoft.github.io/monaco-editor/)

---

<p align="center">
  <b>Built for Web3 Security</b><br>
  <sub>Star this repo if VulnForge helps your security research</sub>
  <br><br>
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" alt="Shield" width="32">
</p>
