# VulnForge — AI-Powered Smart Contract Exploit Simulator

> **Detect. Exploit. Patch.** — The full offensive security pipeline for Solidity smart contracts.

VulnForge is a Web3 security platform that goes beyond traditional static analysis. Upload your Solidity contract, and VulnForge's AI agents will:

1. **Find** vulnerabilities with precise line-level accuracy
2. **Exploit** them by writing and executing real attack scripts on a local EVM
3. **Patch** the contract with production-ready fixes using OpenZeppelin patterns

All of this happens in real-time, with live terminal output, balance drain charts, and side-by-side diffs.

---

## Why VulnForge Exists

Smart contract vulnerabilities caused **$3.8 billion** in losses in 2022 alone. Existing tools (Slither, MythX) flag suspicious patterns but **don't prove exploitability**. VulnForge closes this gap by automating the entire offensive security lifecycle — from detection to proof-of-exploit to remediation.

---

## Quick Start

### Prerequisites

- **Python 3.10+** — for the backend
- **Node.js 18+** — for the frontend and Hardhat
- **npm** — for package management
- **An Anthropic API key** (optional) — for AI-powered analysis. Without it, VulnForge uses built-in rule-based detection.

### 1. Clone the repository

```bash
git clone https://github.com/soumyachk101/ChainPwn.git
cd ChainPwn
```

### 2. Set up the backend

```bash
cd backend

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Install Hardhat (the local blockchain)
cd hardhat_workspace
npm install
cd ..

# Configure environment (optional — for AI features)
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Start the application

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
# Server starts at http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App opens at http://localhost:3000
```

### 5. Open your browser

Navigate to `http://localhost:3000` and you'll see the VulnForge landing page. Try one of the demo contracts or upload your own `.sol` file.

---

## How It Works

VulnForge runs a **three-phase pipeline** powered by AI agents:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Phase 1    │     │   Phase 2    │     │   Phase 3    │
│   ANALYZE    │────▶│   EXPLOIT    │────▶│    PATCH     │
│              │     │              │     │              │
│ Claude AI    │     │ Claude AI    │     │ Claude AI    │
│ scans for    │     │ writes a     │     │ generates    │
│ 12+ vuln     │     │ Hardhat PoC  │     │ patched      │
│ classes      │     │ and runs it  │     │ contract     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
  Vulnerability        Real EVM           Side-by-side
  Report with          execution with     diff showing
  line numbers         balance drain      what changed
```

### Phase 1: Analyze

The **Vulnerability Agent** sends your contract to Claude AI, which returns a structured JSON report with:
- Each vulnerability's severity (CRITICAL / HIGH / MEDIUM / LOW)
- Exact line numbers and affected functions
- CWE identifiers and attack vectors
- Remediation recommendations

If no API key is configured, a built-in rule-based scanner detects reentrancy, overflow, and access control issues.

### Phase 2: Exploit

The **Exploit Agent** generates a complete Hardhat JavaScript exploit script for each vulnerability. The script:
- Deploys the target contract on a local Hardhat EVM
- Sets up attack prerequisites (funding, malicious contracts)
- Executes the attack
- Logs balance snapshots: `[BALANCE] CONTRACT BEFORE: 10.0` → `[BALANCE] CONTRACT AFTER: 0.0`
- Reports `[EXPLOIT SUCCESS]` or `[EXPLOIT FAILED]`

The entire execution is streamed in real-time to the browser via WebSocket.

### Phase 3: Patch

The **Patch Agent** generates a production-ready patched version of your contract using:
- OpenZeppelin's `ReentrancyGuard` for reentrancy fixes
- `Ownable` for access control
- Solidity 0.8+ built-in overflow protection
- Checks-Effects-Interactions pattern

Each fix is annotated with a `// FIX [TYPE]` comment so you can see exactly what changed.

---

## Project Structure

```
ChainPwn/
├── Docs/                          # Product documentation
│   ├── PRD_VulnForge_1.md        # Product Requirements Document
│   ├── TRD_VulnForge_1.md        # Technical Requirements Document
│   └── AI_Instructions_VulnForge_1.md  # AI agent instructions
│
├── backend/                       # Python FastAPI backend
│   ├── main.py                    # Entry point — starts the API server
│   ├── deps.py                    # Shared singleton instances
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment variable template
│   │
│   ├── agents/                    # AI agents (the brain)
│   │   ├── vulnerability_agent.py # Phase 1: detect vulnerabilities
│   │   ├── exploit_agent.py       # Phase 2: generate exploit scripts
│   │   └── patch_agent.py         # Phase 3: generate patches
│   │
│   ├── blockchain/                # EVM execution engine
│   │   ├── hardhat_runner.py      # Run exploit scripts on local Hardhat
│   │   ├── contract_deployer.py   # Deploy contracts to local network
│   │   └── state_capture.py       # Capture before/after balances
│   │
│   ├── routers/                   # API endpoints
│   │   ├── analyze.py             # POST /api/analyze
│   │   ├── exploit.py             # POST /api/exploit
│   │   ├── patch.py               # POST /api/patch
│   │   ├── report.py              # POST /api/report
│   │   └── ws.py                  # WebSocket /ws/stream/{job_id}
│   │
│   ├── utils/                     # Helper modules
│   │   ├── session_manager.py     # Track analysis sessions
│   │   ├── stream_handler.py      # Manage WebSocket connections
│   │   └── solc_parser.py         # Extract Solidity metadata
│   │
│   ├── demo_contracts/            # Deliberately vulnerable contracts
│   │   ├── EtherStore.sol         # Reentrancy (CRITICAL)
│   │   ├── BadToken.sol           # Integer overflow (HIGH)
│   │   └── SimpleVault.sol        # Missing access control (HIGH)
│   │
│   ├── templates/                 # Exploit script templates
│   │   ├── exploit_template.js    # Hardhat exploit template
│   │   └── foundry_template.sol   # Foundry test template
│   │
│   └── hardhat_workspace/         # Local Hardhat EVM
│       ├── hardhat.config.js      # Multi-compiler config
│       └── package.json           # Hardhat + OpenZeppelin deps
│
└── frontend/                      # Next.js 14 frontend
    ├── package.json               # Node dependencies
    ├── tsconfig.json              # TypeScript config
    ├── next.config.mjs            # Next.js config
    ├── tailwind.config.ts         # Tailwind + custom theme
    │
    └── src/
        ├── app/
        │   ├── globals.css        # Cybersecurity dark theme
        │   ├── layout.tsx         # Root layout
        │   ├── page.tsx           # Landing page
        │   ├── scan/page.tsx      # Main scan dashboard
        │   └── api/demo/          # API route for demo contracts
        │
        ├── components/
        │   ├── editor/
        │   │   └── SolidityEditor.tsx    # Monaco editor with vuln markers
        │   ├── terminal/
        │   │   └── ExploitTerminal.tsx   # Real-time exploit output
        │   ├── dashboard/
        │   │   └── RiskScore.tsx         # Circular risk gauge
        │   └── results/
        │       ├── VulnerabilityCard.tsx # Expandable vulnerability cards
        │       ├── DiffViewer.tsx        # Side-by-side code diff
        │       ├── BalanceDrainChart.tsx # Animated balance drain chart
        │       └── ExploitResult.tsx     # Exploit status panel
        │
        ├── lib/
        │   ├── api.ts             # HTTP client for backend API
        │   ├── websocket.ts       # WebSocket streaming manager
        │   ├── session.ts         # Session ID generation
        │   └── utils.ts           # Severity colors, risk helpers
        │
        ├── store/
        │   └── scanStore.ts       # Zustand global state
        │
        └── types/
            └── vulnerability.ts   # TypeScript type definitions
```

---

## API Reference

All endpoints are prefixed with `/api`. The backend runs on `http://localhost:8000` by default.

### Health Check

```
GET /api/health
Response: { "status": "ok", "service": "vulnforge" }
```

### Analyze Contract

```
POST /api/analyze
Body: {
  "source_code": "// Solidity source code...",
  "contract_name": "MyContract",
  "session_id": "unique-session-id"
}
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
      "description": "...",
      "line_start": 15,
      "line_end": 22,
      "affected_function": "withdraw()",
      "exploit_possible": true,
      "cwe": "CWE-841",
      "recommendation": "Use ReentrancyGuard"
    }
  ],
  "audit_confidence": "HIGH"
}
```

### Generate & Execute Exploit

```
POST /api/exploit
Body: {
  "session_id": "unique-session-id",
  "vulnerability_id": "vuln_001",
  "source_code": "// Contract source...",
  "contract_name": "MyContract",
  "initial_eth_balance": "10"
}
Response: {
  "exploit_job_id": "uuid",
  "status": "running",
  "ws_stream_url": "/ws/stream/{job_id}",
  "exploit_script": "// Generated Hardhat script...",
  "attack_flow": ["Step 1...", "Step 2..."]
}
```

### Generate Patch

```
POST /api/patch
Body: {
  "session_id": "unique-session-id",
  "source_code": "// Contract source...",
  "contract_name": "MyContract",
  "solidity_version": "^0.8.0",
  "vulnerabilities": [{ "id": "vuln_001", "type": "REENTRANCY", ... }]
}
Response: {
  "patched_code": "// Fixed Solidity code...",
  "fixes_applied": [{ "type": "REENTRANCY", "fix_summary": "Added ReentrancyGuard" }],
  "new_dependencies": ["@openzeppelin/contracts"],
  "compilation_notes": "..."
}
```

### Generate Report

```
POST /api/report
Body: {
  "contract_name": "MyContract",
  "vulnerabilities": [...],
  "exploit_results": [...],
  "patch_result": {...}
}
Response: Markdown-formatted security report
```

### WebSocket Stream

```
WS /ws/stream/{job_id}
Messages: {
  "type": "LOG|STATE|EXPLOIT_CODE|RESULT|ERROR|PHASE",
  "data": "...",
  "job_id": "uuid",
  "timestamp": 1234567890.123
}
```

### Demo Contracts

```
GET /api/demo-contracts
Response: [{ "name": "EtherStore", "filename": "EtherStore.sol", ... }]

GET /api/demo-contracts/EtherStore.sol
Response: Solidity source code
```

---

## Demo Contracts

VulnForge ships with three deliberately vulnerable contracts for instant demos:

### EtherStore.sol — Reentrancy (CRITICAL)

```solidity
function withdraw() public {
    uint256 bal = balances[msg.sender];
    require(bal > 0);
    (bool sent, ) = msg.sender.call{value: bal}("");  // External call BEFORE state update
    require(sent, "Failed to send Ether");
    balances[msg.sender] = 0;                          // State update AFTER external call
}
```

**The bug:** The balance is set to zero *after* the external call, allowing a malicious contract to re-enter `withdraw()` and drain all funds.

### BadToken.sol — Integer Overflow (HIGH)

```solidity
function mint(uint256 amount) public {
    balances[msg.sender] += amount;  // No overflow check in Solidity <0.8.0
    totalSupply += amount;
}
```

**The bug:** In Solidity 0.7.x, arithmetic silently overflows. An attacker can mint unlimited tokens by triggering an overflow.

### SimpleVault.sol — Missing Access Control (HIGH)

```solidity
function drain(address payable recipient) public {
    recipient.transfer(address(this).balance);  // No onlyOwner modifier!
}
```

**The bug:** Anyone can call `drain()` and steal all funds from the vault.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | No | — | Anthropic API key for AI agents. Without it, VulnForge uses rule-based detection. |
| `HARDHAT_WORKSPACE` | No | `./hardhat_workspace` | Path to the Hardhat workspace directory. |
| `MAX_CONCURRENT_EXPLOITS` | No | `5` | Maximum number of concurrent exploit executions. |
| `EXPLOIT_TIMEOUT_SECONDS` | No | `60` | Timeout for each exploit execution. |
| `MAX_CONTRACT_SIZE_KB` | No | `500` | Maximum contract source code size. |
| `PORT` | No | `8000` | Backend server port. |

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Python 3.10+** | Runtime |
| **FastAPI** | Async web framework |
| **Anthropic SDK** | Claude AI integration |
| **Hardhat** | Local Ethereum development network |
| **ethers.js v6** | Ethereum library for exploit scripts |
| **WebSockets** | Real-time streaming |
| **Pydantic** | Request/response validation |

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling with custom cybersecurity theme |
| **Monaco Editor** | Code editor with Solidity syntax and vulnerability markers |
| **Recharts** | Balance drain visualization charts |
| **Zustand** | Lightweight state management |
| **Framer Motion** | Animations and transitions |
| **Axios** | HTTP client |
| **react-diff-viewer-continued** | Side-by-side code diff |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Monaco   │  │ Terminal │  │   Diff   │  │  Charts  │   │
│  │  Editor   │  │  Output  │  │  Viewer  │  │          │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
│        │             │             │             │          │
│        └─────────────┼─────────────┼─────────────┘          │
│                      │  HTTP + WebSocket                     │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│                 FastAPI Backend (Python)                      │
│                      │                                       │
│  ┌──────────┐  ┌─────┴────┐  ┌──────────┐                  │
│  │  Routers  │  │  Deps    │  │ Sessions │                  │
│  └─────┬────┘  └─────┬────┘  └──────────┘                  │
│        │             │                                       │
│  ┌─────┴─────────────┴─────────────┐                        │
│  │         AI Agents (Claude)      │                        │
│  │  ┌──────────┐ ┌──────┐ ┌─────┐ │                        │
│  │  │ Vuln     │ │Exploit│ │Patch│ │                        │
│  │  │ Agent    │ │ Agent │ │Agent│ │                        │
│  │  └──────────┘ └──────┘ └─────┘ │                        │
│  └─────────────┬───────────────────┘                        │
│                │                                             │
│  ┌─────────────┴───────────────────┐                        │
│  │     Hardhat Local EVM           │                        │
│  │  Deploy → Execute → Capture     │                        │
│  └─────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Without an API Key

VulnForge works **without** an Anthropic API key. In fallback mode:

- **Analysis** uses regex-based pattern matching to detect reentrancy, overflow, and access control issues
- **Exploits** use pre-built templates for common vulnerability types
- **Patches** apply basic fixes (ReentrancyGuard, Ownable, version upgrades)

To enable full AI capabilities, add your key to `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

## Troubleshooting

### "Hardhat node_modules not found"

```bash
cd backend/hardhat_workspace
npm install
```

### "npx: command not found"

Install Node.js from https://nodejs.org/

### Frontend won't start

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Backend import errors

Make sure you're running from the `backend/` directory with the virtual environment activated:

```bash
cd backend
source venv/bin/activate
python main.py
```

---

## For Security Researchers

VulnForge is designed for **authorized security testing and education**. The exploit execution happens on a **local Hardhat testnet only** — no real funds are at risk.

Use cases:
- **Smart contract audits** — accelerate vulnerability discovery with AI
- **CTF competitions** — practice exploiting vulnerable contracts
- **Education** — understand how reentrancy, overflow, and other attacks work
- **DevSecOps** — integrate into CI/CD as a security gate

---

## License

This project is for educational and authorized security research purposes.

---

## Acknowledgments

- [OpenZeppelin](https://www.openzeppelin.com/) — Secure smart contract libraries
- [Hardhat](https://hardhat.org/) — Ethereum development environment
- [Anthropic](https://www.anthropic.com/) — Claude AI powering the agents
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code's editor for the web
