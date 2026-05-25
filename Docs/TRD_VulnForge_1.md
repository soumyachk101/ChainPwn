# Technical Requirements Document (TRD)
## VulnForge — AI-Powered Smart Contract Exploit Simulator
**Version:** 1.0.0  
**Status:** Draft  
**Author:** Soumya Chakraborty  
**Last Updated:** May 2026

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS FRONTEND                         │
│  Monaco Editor │ Terminal Stream │ Diff Viewer │ Dashboard   │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                    FASTAPI BACKEND                            │
│  /analyze  │  /exploit  │  /patch  │  /report  │  /ws/stream │
└────────┬───────────┬────────────────┬──────────────────────┘
         │           │                │
    ┌────▼────┐ ┌────▼──────────┐ ┌──▼──────────────────┐
    │  Claude │ │ Exploit Engine│ │   Patch Generator    │
    │   API   │ │  (Hardhat /   │ │   (Claude API)       │
    │(Sonnet4)│ │   Foundry)    │ └──────────────────────┘
    └─────────┘ └───────────────┘
                      │
              ┌───────▼────────┐
              │  Local EVM Node │
              │ (Hardhat/Anvil) │
              └────────────────┘
```

---

## 2. Tech Stack

### 2.1 Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Main dashboard |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS + shadcn/ui | UI components |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | Solidity editing with syntax highlight |
| Terminal | `xterm.js` | Stream Hardhat/Foundry output in real-time |
| Diff Viewer | `react-diff-viewer-continued` | Vulnerable vs patched code comparison |
| Charts | Recharts | Balance drain visualization |
| State | Zustand | Global state management |
| WebSocket | Native browser WebSocket API | Streaming exploit execution logs |

### 2.2 Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | FastAPI (Python 3.11+) | API server + WebSocket support |
| Blockchain | Hardhat (Node.js) | Local EVM, contract compilation & deployment |
| Alt. Chain | Foundry (Rust) | Faster alternative to Hardhat (optional) |
| AI | Anthropic Claude Sonnet 4 | Vulnerability analysis + exploit generation + patching |
| Process Mgmt | `asyncio.subprocess` | Run Hardhat as a subprocess, stream stdout |
| Report | `reportlab` or `weasyprint` | PDF report generation |

### 2.3 Infrastructure
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Database | Supabase (PostgreSQL) | Scan results, report storage |
| File Storage | Supabase Storage | Uploaded `.sol` files |
| Hosting | Vercel (Frontend) + Railway/Render (Backend) | Deployment |
| Env Management | Python `dotenv` | Secrets management |

---

## 3. Backend Architecture

### 3.1 Directory Structure

```
vulnforge-backend/
├── main.py                    # FastAPI entry point
├── routers/
│   ├── analyze.py             # POST /analyze — static analysis via Claude
│   ├── exploit.py             # POST /exploit — trigger exploit execution
│   ├── patch.py               # POST /patch — generate patched contract
│   ├── report.py              # POST /report — generate PDF/MD report
│   └── ws.py                  # WebSocket /ws/stream/{session_id}
├── agents/
│   ├── vulnerability_agent.py # Claude prompt orchestration for detection
│   ├── exploit_agent.py       # Claude generates exploit script logic
│   └── patch_agent.py         # Claude generates patched code
├── blockchain/
│   ├── hardhat_runner.py      # Spins up Hardhat node, deploys, runs scripts
│   ├── contract_deployer.py   # Manages contract deployment lifecycle
│   └── state_capture.py       # Before/after balance + state snapshotting
├── templates/
│   ├── exploit_template.js    # Hardhat script template for exploits
│   └── foundry_template.sol   # Foundry test template for exploits
├── utils/
│   ├── solc_parser.py         # Extract ABI, function signatures from Solidity
│   ├── session_manager.py     # Manage per-scan session state
│   └── stream_handler.py      # WebSocket streaming helper
├── hardhat_workspace/         # Ephemeral Hardhat project (gitignored)
│   ├── package.json
│   ├── hardhat.config.js
│   └── contracts/             # Uploaded contracts placed here
├── requirements.txt
└── .env
```

### 3.2 API Endpoints

#### `POST /api/analyze`
Accepts Solidity source code, runs AI static analysis.

**Request:**
```json
{
  "source_code": "pragma solidity ^0.8.0; contract Vault { ... }",
  "contract_name": "Vault",
  "session_id": "uuid-v4"
}
```

**Response:**
```json
{
  "session_id": "uuid-v4",
  "vulnerabilities": [
    {
      "id": "vuln_001",
      "type": "REENTRANCY",
      "severity": "CRITICAL",
      "title": "Reentrancy in withdraw()",
      "description": "The withdraw() function sends ETH before updating the balance...",
      "line_start": 23,
      "line_end": 31,
      "exploit_possible": true,
      "cwe": "CWE-841"
    }
  ],
  "overall_risk": "CRITICAL",
  "analysis_time_ms": 4200
}
```

#### `POST /api/exploit`
Triggers the Attacker Agent for a specific vulnerability.

**Request:**
```json
{
  "session_id": "uuid-v4",
  "vulnerability_id": "vuln_001",
  "source_code": "...",
  "initial_eth_balance": "10"
}
```

**Response (initial):**
```json
{
  "exploit_job_id": "job-uuid",
  "status": "RUNNING",
  "ws_stream_url": "/ws/stream/job-uuid"
}
```

#### `WebSocket /ws/stream/{job_id}`
Streams exploit execution output in real-time.

**Message types streamed:**
```json
{ "type": "LOG", "data": "Deploying VulnerableVault to local network..." }
{ "type": "LOG", "data": "Contract deployed at 0xABC123..." }
{ "type": "STATE", "data": { "pre_balance": "10.0 ETH", "attacker_balance": "0.0 ETH" }}
{ "type": "LOG", "data": "Executing reentrancy attack..." }
{ "type": "STATE", "data": { "post_balance": "0.0 ETH", "attacker_balance": "10.0 ETH" }}
{ "type": "RESULT", "data": { "success": true, "drained": "10.0 ETH", "tx_hash": "0xDEF456" }}
{ "type": "EXPLOIT_CODE", "data": "const { ethers } = require('hardhat');\n..." }
```

#### `POST /api/patch`
Returns patched contract code.

**Request:**
```json
{
  "session_id": "uuid-v4",
  "source_code": "...",
  "vulnerability_ids": ["vuln_001", "vuln_002"]
}
```

**Response:**
```json
{
  "patched_code": "pragma solidity ^0.8.0; import '@openzeppelin/contracts/security/ReentrancyGuard.sol'...",
  "changes": [
    {
      "vulnerability_id": "vuln_001",
      "fix_description": "Added ReentrancyGuard modifier. Moved balance update before external call (CEI pattern).",
      "diff": { "original_lines": [23, 31], "patched_lines": [24, 33] }
    }
  ]
}
```

---

## 4. AI Agent Design

### 4.1 Vulnerability Detection Agent

**System Prompt Philosophy:** The agent acts as a senior smart contract auditor. It outputs structured JSON only.

**Key Prompt Constraints:**
- MUST output valid JSON matching the vulnerability schema
- MUST include exact line numbers from the provided source
- MUST NOT flag something as exploitable unless it can explain the exact attack vector
- MUST distinguish between theoretical risks and confirmed exploitable patterns

**Claude API Call Structure:**
```python
response = anthropic.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    system=VULNERABILITY_DETECTION_SYSTEM_PROMPT,
    messages=[
        {
            "role": "user",
            "content": f"Analyze this Solidity contract:\n\n```solidity\n{source_code}\n```"
        }
    ]
)
```

### 4.2 Exploit Generation Agent

This agent receives a specific vulnerability finding and the contract code. It produces:
1. A complete Hardhat exploit script (JavaScript using ethers.js)
2. Setup instructions (required initial state: ETH funding, token minting, etc.)
3. Expected outcome description

**Critical constraints on exploit generation:**
- Script MUST be self-contained and runnable with `npx hardhat run`
- MUST include contract deployment within the script (not assume pre-deployed)
- MUST print `[EXPLOIT SUCCESS]` or `[EXPLOIT FAILED]` as the last line
- MUST capture before/after balances and print them

### 4.3 Patch Generation Agent

Receives the vulnerable source and a list of confirmed vulnerabilities. Produces patched Solidity that:
- Compiles without errors (`solc` 0.8.x compatible)
- Does not change the contract's external interface (same function signatures)
- Uses OpenZeppelin libraries where applicable
- Includes inline comments explaining each fix

---

## 5. Blockchain Execution Engine

### 5.1 Hardhat Runner (`hardhat_runner.py`)

```python
class HardhatRunner:
    async def run_exploit(
        self,
        contract_source: str,
        exploit_script: str,
        session_id: str,
        stream_callback: Callable[[str], Awaitable[None]]
    ) -> ExploitResult:
        # 1. Write contract to hardhat_workspace/contracts/{session_id}.sol
        # 2. Write exploit script to hardhat_workspace/scripts/{session_id}_exploit.js
        # 3. Run: npx hardhat run scripts/{session_id}_exploit.js --network localhost
        # 4. Stream stdout/stderr line by line via stream_callback
        # 5. Parse final output for ExploitResult
        ...
```

### 5.2 Session Isolation
Each scan gets its own isolated execution context:
- Unique session UUID as prefix for all temp files
- Hardhat node started fresh per exploit run (or use in-process Hardhat Network)
- All temp files cleaned up after session expires (TTL: 1 hour)
- Concurrent exploit runs supported (asyncio task pool, max 5 simultaneous)

### 5.3 Hardhat Configuration (`hardhat.config.js`)
```javascript
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.7.6" },
      { version: "0.6.12" },  // legacy contract support
    ]
  },
  networks: {
    hardhat: {
      accounts: {
        count: 5,
        accountsBalance: "100000000000000000000" // 100 ETH each
      }
    }
  }
};
```

---

## 6. Frontend Architecture

### 6.1 Directory Structure

```
vulnforge-frontend/
├── app/
│   ├── page.tsx               # Landing page / upload CTA
│   ├── scan/
│   │   ├── page.tsx           # Main scan dashboard
│   │   └── [sessionId]/
│   │       └── page.tsx       # Scan results page
│   └── api/                   # Next.js API routes (proxy to FastAPI)
├── components/
│   ├── editor/
│   │   ├── SolidityEditor.tsx  # Monaco editor wrapper with vulnerability markers
│   │   └── VulnMarker.tsx      # Inline vulnerability annotation component
│   ├── terminal/
│   │   └── ExploitTerminal.tsx # xterm.js WebSocket terminal
│   ├── results/
│   │   ├── VulnerabilityCard.tsx
│   │   ├── ExploitResult.tsx
│   │   ├── DiffViewer.tsx
│   │   └── BalanceDrainChart.tsx
│   ├── dashboard/
│   │   ├── ScanHeader.tsx
│   │   ├── RiskScore.tsx
│   │   └── ReportExport.tsx
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── api.ts                  # API client (axios)
│   ├── websocket.ts            # WebSocket manager
│   └── session.ts              # Session state helpers
├── store/
│   └── scanStore.ts            # Zustand global state
└── types/
    └── vulnerability.ts        # TypeScript interfaces
```

### 6.2 Key UI States

| State | Description |
|-------|-------------|
| `IDLE` | Upload screen shown |
| `ANALYZING` | Spinner, "AI is auditing your contract..." |
| `RESULTS` | Vulnerabilities listed, exploit buttons enabled |
| `EXPLOITING` | Terminal streaming, balance chart animating |
| `EXPLOIT_COMPLETE` | Result badge (DRAINED/FAILED), patched code available |
| `PATCHING` | "Generating fix..." loader |
| `PATCH_READY` | Diff viewer shown, download available |

### 6.3 Monaco Editor Integration

```typescript
// Decorate vulnerability lines with red squiggles and inline messages
editor.deltaDecorations([], vulnerabilities.map(vuln => ({
  range: new monaco.Range(vuln.line_start, 1, vuln.line_end, 1),
  options: {
    isWholeLine: true,
    className: `vuln-severity-${vuln.severity.toLowerCase()}`,
    glyphMarginClassName: 'vuln-glyph',
    hoverMessage: { value: `**${vuln.severity}**: ${vuln.title}` }
  }
})));
```

---

## 7. WebSocket Streaming Protocol

**Client → Server (connect):**
```
ws://localhost:8000/ws/stream/{job_id}
```

**Server → Client message schema:**
```typescript
type StreamMessage =
  | { type: 'LOG'; data: string }
  | { type: 'STATE'; data: { pre_balance: string; post_balance: string; attacker_balance: string }}
  | { type: 'EXPLOIT_CODE'; data: string }
  | { type: 'RESULT'; data: { success: boolean; drained: string; tx_hash: string; error?: string }}
  | { type: 'ERROR'; data: string }
```

---

## 8. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Malicious Solidity code execution | Only execute on local Hardhat Network, never mainnet; no private keys with real value |
| Exploit code misuse | Clearly label all outputs as educational; no mainnet RPC connections |
| Resource exhaustion (infinite loops in contracts) | Hardhat gas limit cap (30M gas per transaction); process timeout (60s) |
| Session data isolation | UUID-based session namespacing; no cross-session data access |
| API abuse | Rate limiting (10 scans/hour per IP); file size limit (500KB per `.sol` file) |
| Container escape (if deployed) | Run Hardhat in Docker sandbox with no external network access |

---

## 9. Environment Variables

```env
# Backend (.env)
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
HARDHAT_WORKSPACE=/app/hardhat_workspace
MAX_CONCURRENT_EXPLOITS=5
EXPLOIT_TIMEOUT_SECONDS=60
MAX_CONTRACT_SIZE_KB=500
PORT=8000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 10. Dependency List

### Backend (`requirements.txt`)
```
fastapi==0.111.0
uvicorn[standard]==0.30.0
anthropic==0.28.0
supabase==2.5.0
python-multipart==0.0.9
websockets==12.0
reportlab==4.2.2
python-dotenv==1.0.1
pydantic==2.7.4
aiofiles==23.2.1
```

### Backend Node.js (Hardhat workspace `package.json`)
```json
{
  "devDependencies": {
    "hardhat": "^2.22.0",
    "@nomicfoundation/hardhat-ethers": "^3.0.0",
    "ethers": "^6.12.0"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.2"
  }
}
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "next": "14.2.4",
    "react": "^18",
    "@monaco-editor/react": "^4.6.0",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "react-diff-viewer-continued": "^3.4.0",
    "recharts": "^2.12.7",
    "zustand": "^4.5.4",
    "axios": "^1.7.2",
    "@supabase/supabase-js": "^2.43.4",
    "tailwindcss": "^3.4.4",
    "shadcn-ui": "latest"
  }
}
```

---

## 11. Data Flow Diagram

```
User uploads .sol file
        │
        ▼
Frontend validates file (size, extension)
        │
        ▼
POST /api/analyze {source_code}
        │
        ▼
vulnerability_agent.py → Claude API
  - System: "You are a smart contract auditor..."
  - User: "Analyze: [source_code]"
  - Response: JSON vulnerability list
        │
        ▼
Return vulnerabilities to frontend
Frontend decorates Monaco Editor with markers
        │
        ▼ (User clicks "Exploit This")
POST /api/exploit {session_id, vuln_id, source_code}
        │
        ▼
exploit_agent.py → Claude API
  - Generates Hardhat exploit script
        │
        ▼
hardhat_runner.py
  - Writes files to workspace
  - Spawns: npx hardhat run exploit.js
  - Streams stdout → WebSocket
        │
        ▼
Frontend terminal (xterm.js) renders live output
Balance chart updates in real-time
        │
        ▼ (Exploit complete)
POST /api/patch {session_id, vuln_ids}
        │
        ▼
patch_agent.py → Claude API
  - Returns patched Solidity
        │
        ▼
DiffViewer renders vulnerable vs patched
POST /api/report → PDF download
```
