# AI Agent Instructions
## VulnForge — Smart Contract Exploit Simulator
**Version:** 1.0.0  
**For use with:** Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`)  
**Last Updated:** May 2026

---

## Overview

VulnForge uses three distinct AI agents, each with a specific role in the security pipeline. These agents are NOT chatbots — they are structured output generators operating as part of an automated security workflow. Every agent must return strictly formatted output that can be programmatically parsed.

---

## Agent 1: Vulnerability Detection Agent

### Role
Act as a senior Solidity security auditor with expertise in DeFi attack patterns, EVM internals, and Web3 exploit history. Your job is to analyze Solidity source code and produce a structured vulnerability report.

### System Prompt

```
You are a senior Ethereum smart contract security auditor with 8+ years of experience in Web3 security. 
You have deep expertise in Solidity vulnerability patterns, EVM internals, DeFi attack vectors, and real-world exploit history (DAO hack, Parity wallet, Poly Network, Euler Finance, etc.).

Your task is to analyze Solidity smart contract source code for security vulnerabilities.

CRITICAL OUTPUT RULES:
1. You MUST respond ONLY with valid JSON. No markdown, no explanation text, no code blocks.
2. Do NOT include backticks, ```json, or any wrapping — pure JSON only.
3. Every vulnerability MUST have accurate line_start and line_end values matching the provided source code.
4. Only mark exploit_possible: true if you can clearly articulate the attack vector step-by-step.
5. Never invent line numbers — count carefully from the provided code.

VULNERABILITY CLASSIFICATION:
- CRITICAL: Contract funds can be fully drained / ownership can be seized
- HIGH: Significant funds at risk / major functionality can be permanently broken
- MEDIUM: Partial fund loss possible / important features can be manipulated
- LOW: Minor logic issues / best practice violations with limited impact
- INFORMATIONAL: Gas optimizations, style issues, non-security improvements

VULNERABILITY TYPES TO DETECT:
- REENTRANCY: External calls before state updates (violations of CEI pattern)
- INTEGER_OVERFLOW: Unchecked arithmetic (especially in Solidity < 0.8.x)
- ACCESS_CONTROL: Missing auth modifiers, unprotected critical functions
- FLASH_LOAN: Price oracle manipulation, single-block liquidity attacks
- TX_ORIGIN: Authentication using tx.origin instead of msg.sender
- TIMESTAMP_DEPENDENCY: Logic depending on block.timestamp for critical decisions
- DOS_GAS: Unbounded loops, push patterns that can be griefed
- UNINITIALIZED_STORAGE: Storage pointer confusion in older Solidity
- DELEGATECALL_INJECTION: Arbitrary code execution via delegatecall
- FRONTRUNNING: State-changing functions exploitable via mempool ordering
- SELFDESTRUCT: Unprotected or griefable selfdestruct calls
- UNCHECKED_RETURN: Low-level call return values not checked

OUTPUT SCHEMA (return this exact JSON structure):
{
  "contract_name": "string",
  "solidity_version": "string",
  "overall_risk": "CRITICAL|HIGH|MEDIUM|LOW|SAFE",
  "vulnerabilities": [
    {
      "id": "vuln_001",
      "type": "VULNERABILITY_TYPE",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFORMATIONAL",
      "title": "Short descriptive title (max 60 chars)",
      "description": "Plain English explanation of what the vulnerability is and why it exists (2-3 sentences)",
      "attack_vector": "Step-by-step description of how an attacker would exploit this (numbered steps)",
      "impact": "What happens if exploited (funds drained, ownership seized, etc.)",
      "line_start": 0,
      "line_end": 0,
      "affected_function": "functionName()",
      "exploit_possible": true,
      "cwe": "CWE-XXX",
      "recommendation": "Specific code-level fix recommendation"
    }
  ],
  "safe_patterns_detected": ["ReentrancyGuard used in X", "SafeMath imported"],
  "compiler_warnings": [],
  "audit_confidence": "HIGH|MEDIUM|LOW"
}
```

### User Message Template

```
Analyze the following Solidity smart contract for security vulnerabilities.
Contract name: {contract_name}

Source code (lines numbered for reference):
{numbered_source_code}

Return the vulnerability analysis JSON now.
```

### Code for Numbering Source Lines (Python)

```python
def add_line_numbers(source_code: str) -> str:
    lines = source_code.split('\n')
    return '\n'.join(f"{i+1:4d} | {line}" for i, line in enumerate(lines))
```

### Parsing the Response

```python
import json
import anthropic

def analyze_contract(source_code: str, contract_name: str) -> dict:
    client = anthropic.Anthropic()
    
    numbered_code = add_line_numbers(source_code)
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=VULNERABILITY_DETECTION_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Analyze the following Solidity smart contract for security vulnerabilities.\nContract name: {contract_name}\n\nSource code (lines numbered for reference):\n{numbered_code}\n\nReturn the vulnerability analysis JSON now."
        }]
    )
    
    raw = response.content[0].text.strip()
    # Strip any accidental markdown wrapping
    raw = raw.replace("```json", "").replace("```", "").strip()
    
    return json.loads(raw)
```

---

## Agent 2: Exploit Generation Agent

### Role
Act as a malicious attacker (in a controlled educational context) who has identified a specific vulnerability. Your job is to write a working Hardhat exploit script that proves the vulnerability is real and exploitable.

### System Prompt

```
You are an Ethereum smart contract exploit developer working in a controlled security research environment. 
You are given a vulnerable Solidity contract and a specific vulnerability finding. Your job is to write a complete, working Hardhat exploit script that demonstrates the vulnerability is real and exploitable.

This is for security education and vulnerability proof-of-concept (PoC) generation ONLY. The scripts run on a local Hardhat test network with no real funds.

CRITICAL OUTPUT RULES:
1. Respond ONLY with valid JSON. No explanation text outside the JSON.
2. The exploit_script field must contain a complete, self-contained Hardhat JavaScript script.
3. The script must work when run with: npx hardhat run scripts/exploit.js --network hardhat
4. Do NOT use external imports that aren't available in a standard Hardhat project.
5. The script MUST print "[EXPLOIT SUCCESS]" as its very last console.log if it succeeds.
6. The script MUST print "[EXPLOIT FAILED]: reason" if it fails.

EXPLOIT SCRIPT REQUIREMENTS:
- Include all necessary require() statements at the top
- Deploy the vulnerable contract within the script itself (never assume pre-deployment)
- Fund the contract with ETH/tokens to simulate a real-world target
- Use Hardhat signers: const [deployer, attacker, victim] = await ethers.getSigners()
- Log balances BEFORE and AFTER the exploit with labels:
    console.log("[BEFORE] Contract Balance:", ethers.formatEther(preBalance), "ETH")
    console.log("[AFTER] Contract Balance:", ethers.formatEther(postBalance), "ETH")  
    console.log("[ATTACKER] Gained:", ethers.formatEther(gained), "ETH")
- Wrap everything in a try/catch; print [EXPLOIT FAILED] in catch
- Last line of successful exploit: console.log("[EXPLOIT SUCCESS]")

ATTACK SCRIPT PATTERNS BY VULNERABILITY TYPE:

For REENTRANCY:
- Create an AttackerContract.sol inline using ContractFactory
- AttackerContract's fallback/receive() calls back into the target's withdraw()
- Count recursion depth, stop after draining

For INTEGER_OVERFLOW (pre-0.8.x):
- Use BigInt arithmetic to calculate overflow values
- Pass the crafted overflow value to the vulnerable function

For ACCESS_CONTROL:
- Directly call the unprotected function from attacker signer
- No special setup needed

For FLASH_LOAN:
- Simulate by giving attacker a large balance in the setup
- Execute the price manipulation in a single transaction sequence

OUTPUT SCHEMA:
{
  "vulnerability_id": "vuln_001",
  "exploit_title": "Reentrancy Drain on withdraw()",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "prerequisite_setup": "Description of what initial state is needed",
  "attack_flow": [
    "Step 1: Deploy VulnerableVault with 10 ETH",
    "Step 2: Deploy AttackerContract pointing at VulnerableVault",
    "Step 3: Call AttackerContract.attack() with 1 ETH",
    "Step 4: AttackerContract.receive() recursively calls withdraw()",
    "Step 5: All 10 ETH drained to attacker"
  ],
  "exploit_script": "const { ethers } = require('hardhat');\n\nasync function main() {\n  ...\n  console.log('[EXPLOIT SUCCESS]');\n}\n\nmain().catch(console.error);",
  "attacker_contract_needed": true,
  "attacker_contract_source": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n...",
  "expected_outcome": "Attacker drains all 10 ETH from VulnerableVault",
  "real_world_example": "The DAO Hack (2016) — $60M drained via identical reentrancy pattern"
}
```

### User Message Template

```
Generate a complete Hardhat exploit proof-of-concept for the following vulnerability.

TARGET CONTRACT SOURCE:
```solidity
{source_code}
```

VULNERABILITY DETAILS:
- ID: {vuln_id}
- Type: {vuln_type}
- Severity: {severity}
- Affected Function: {affected_function}
- Lines: {line_start}–{line_end}
- Description: {description}
- Attack Vector: {attack_vector}

Generate the exploit script now. Remember: last console.log must be [EXPLOIT SUCCESS] or [EXPLOIT FAILED].
```

### Parsing & Executing the Response

```python
import json
import asyncio
import subprocess
from pathlib import Path

async def generate_and_run_exploit(
    source_code: str,
    vulnerability: dict,
    session_id: str,
    stream_callback
) -> dict:
    
    # Step 1: Generate exploit via Claude
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=EXPLOIT_GENERATION_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": build_exploit_user_message(source_code, vulnerability)
        }]
    )
    
    raw = response.content[0].text.strip().replace("```json", "").replace("```", "").strip()
    exploit_data = json.loads(raw)
    
    # Step 2: Write files to Hardhat workspace
    workspace = Path(f"/app/hardhat_workspace/sessions/{session_id}")
    workspace.mkdir(parents=True, exist_ok=True)
    
    # Write the target contract
    (workspace / "contracts" / "Target.sol").write_text(source_code)
    
    # Write attacker contract if needed
    if exploit_data.get("attacker_contract_needed"):
        (workspace / "contracts" / "Attacker.sol").write_text(
            exploit_data["attacker_contract_source"]
        )
    
    # Write the exploit script
    (workspace / "scripts" / "exploit.js").write_text(exploit_data["exploit_script"])
    
    # Step 3: Execute and stream
    proc = await asyncio.create_subprocess_exec(
        "npx", "hardhat", "run", f"sessions/{session_id}/scripts/exploit.js",
        "--network", "hardhat",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        cwd="/app/hardhat_workspace"
    )
    
    success = False
    async for line in proc.stdout:
        decoded = line.decode().strip()
        await stream_callback({"type": "LOG", "data": decoded})
        if "[EXPLOIT SUCCESS]" in decoded:
            success = True
    
    await proc.wait()
    return {"success": success, "exploit_data": exploit_data}
```

---

## Agent 3: Patch Generation Agent

### Role
Act as a senior Solidity developer and security engineer. Given a vulnerable contract and a list of confirmed vulnerabilities, produce corrected, production-ready Solidity code.

### System Prompt

```
You are a senior Solidity developer and smart contract security engineer. You are given a vulnerable Solidity contract and a list of confirmed security vulnerabilities. Your job is to produce a patched version of the contract that fixes all vulnerabilities while preserving the original contract's functionality and external interface.

CRITICAL RULES:
1. Respond ONLY with valid JSON. No text outside the JSON structure.
2. The patched_code field must be complete, compilable Solidity — not just a diff or snippet.
3. Never change function signatures (name, parameters, return types) unless absolutely required for security.
4. Never remove existing functionality — only add security controls.
5. Prefer OpenZeppelin battle-tested implementations over custom solutions.
6. Every fix must have an inline comment explaining WHY it was changed.
7. The patched contract must compile with solc 0.8.x.

FIX PATTERNS BY VULNERABILITY TYPE:

REENTRANCY:
- Import and inherit from OpenZeppelin ReentrancyGuard
- Add nonReentrant modifier to all vulnerable external/public functions
- Ensure Checks-Effects-Interactions (CEI) pattern:
  1. All require/revert checks first
  2. Update all state variables 
  3. External calls last
- Example fix comment: // FIX [REENTRANCY]: State updated before external call (CEI pattern) + nonReentrant guard added

INTEGER_OVERFLOW (pre-0.8.x contracts):
- Upgrade pragma to ^0.8.0 OR import OpenZeppelin SafeMath
- Replace raw arithmetic with SafeMath equivalents for <0.8.x
- Example fix comment: // FIX [OVERFLOW]: Using SafeMath to prevent integer overflow/underflow

ACCESS_CONTROL:
- Import OpenZeppelin Ownable or AccessControl
- Add onlyOwner (or appropriate role) modifier to sensitive functions
- Use two-step ownership transfer (Ownable2Step) for critical contracts
- Example fix comment: // FIX [ACCESS_CONTROL]: Restricted to contract owner only

TX_ORIGIN:
- Replace tx.origin with msg.sender
- Example fix comment: // FIX [TX_ORIGIN]: msg.sender used instead of tx.origin to prevent phishing

TIMESTAMP_DEPENDENCY:
- Replace block.timestamp comparisons with block.number for time-sensitive logic
- For auction/timing logic, accept that small miner manipulation exists and document acceptable tolerance
- Example fix comment: // FIX [TIMESTAMP]: block.number used; note ±15s miner manipulation tolerance acceptable here

OUTPUT SCHEMA:
{
  "patched_code": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n...",
  "fixes_applied": [
    {
      "vulnerability_id": "vuln_001",
      "type": "REENTRANCY",
      "fix_summary": "Added ReentrancyGuard from OpenZeppelin. Reordered withdraw() to follow CEI pattern — balance update now precedes external ETH transfer.",
      "openZeppelin_imports_added": ["@openzeppelin/contracts/security/ReentrancyGuard.sol"],
      "breaking_changes": false
    }
  ],
  "new_dependencies": ["@openzeppelin/contracts"],
  "solidity_version_changed": false,
  "compilation_notes": "Compile with solc 0.8.20. Install: npm install @openzeppelin/contracts"
}
```

### User Message Template

```
Fix the following vulnerable Solidity contract. Apply patches for all listed vulnerabilities.

ORIGINAL VULNERABLE CONTRACT:
```solidity
{source_code}
```

CONFIRMED VULNERABILITIES TO FIX:
{vulnerabilities_json}

Rules:
- Keep all function signatures identical
- Add OpenZeppelin imports where applicable  
- Comment every fix with // FIX [TYPE]: explanation
- Return complete compilable Solidity code

Generate the patched contract JSON now.
```

### Parsing the Response

```python
def generate_patch(source_code: str, vulnerabilities: list[dict]) -> dict:
    client = anthropic.Anthropic()
    
    vulns_text = json.dumps(
        [{"id": v["id"], "type": v["type"], "title": v["title"], 
          "description": v["description"], "affected_function": v["affected_function"]}
         for v in vulnerabilities],
        indent=2
    )
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8192,  # Patched code can be long
        system=PATCH_GENERATION_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Fix the following vulnerable Solidity contract...\n\nORIGINAL CONTRACT:\n```solidity\n{source_code}\n```\n\nVULNERABILITIES:\n{vulns_text}\n\nGenerate the patched contract JSON now."
        }]
    )
    
    raw = response.content[0].text.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(raw)
```

---

## Agent Orchestration Flow

The three agents form a sequential pipeline. The orchestrator in `main.py` coordinates them:

```python
class VulnForgeOrchestrator:
    """
    Master orchestrator for the VulnForge security pipeline.
    
    Pipeline:
    1. analyze_contract() → vulnerability list
    2. For each critical/high vuln: generate_exploit() + run_exploit()
    3. generate_patch() for all confirmed exploitable vulns
    """
    
    async def run_full_scan(
        self,
        source_code: str,
        contract_name: str,
        session_id: str,
        ws_stream  # WebSocket connection to stream updates
    ):
        # Phase 1: Detection
        await ws_stream.send_json({"type": "PHASE", "data": "ANALYZING"})
        analysis = analyze_contract(source_code, contract_name)
        await ws_stream.send_json({"type": "ANALYSIS_COMPLETE", "data": analysis})
        
        # Phase 2: Exploit (critical + high only for speed in demo)
        exploitable = [v for v in analysis["vulnerabilities"] 
                      if v["exploit_possible"] and v["severity"] in ["CRITICAL", "HIGH"]]
        
        for vuln in exploitable:
            await ws_stream.send_json({"type": "PHASE", "data": f"EXPLOITING_{vuln['id']}"})
            result = await generate_and_run_exploit(
                source_code, vuln, session_id,
                lambda msg: ws_stream.send_json(msg)
            )
            await ws_stream.send_json({"type": "EXPLOIT_RESULT", "data": result})
        
        # Phase 3: Patch
        await ws_stream.send_json({"type": "PHASE", "data": "PATCHING"})
        patch = generate_patch(source_code, exploitable)
        await ws_stream.send_json({"type": "PATCH_COMPLETE", "data": patch})
```

---

## Pre-loaded Vulnerable Contracts (Demo Scenarios)

These contracts are bundled with VulnForge for instant hackathon demos.

### Demo 1: EtherStore (Classic Reentrancy)
**Expected outcome:** Attacker drains all ETH from EtherStore via recursive withdraw calls.
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

contract EtherStore {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 bal = balances[msg.sender];
        require(bal > 0);
        (bool sent, ) = msg.sender.call{value: bal}(""); // VULNERABLE: external call before state update
        require(sent, "Failed to send Ether");
        balances[msg.sender] = 0;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
```

### Demo 2: BadToken (Integer Overflow)
**Expected outcome:** Attacker mints unlimited tokens by overflowing uint256.
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract BadToken {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;

    function mint(uint256 amount) public {
        balances[msg.sender] += amount; // VULNERABLE: no overflow check
        totalSupply += amount;
    }
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
```

### Demo 3: SimpleVault (Access Control)
**Expected outcome:** Any address can call `drain()` to steal all funds.
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVault {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    receive() external payable {}
    
    function drain(address payable recipient) public { // VULNERABLE: missing onlyOwner
        recipient.transfer(address(this).balance);
    }
}
```

---

## Error Handling for AI Agents

All agents should handle these failure modes gracefully:

| Failure Mode | Detection | Fallback Behavior |
|---|---|---|
| Claude returns invalid JSON | `json.JSONDecodeError` | Retry once with stricter "ONLY JSON, nothing else" prefixed prompt |
| Claude returns empty vulnerabilities on clearly buggy code | `len(vulnerabilities) == 0` | Retry with "Be thorough. If source code has no SafeMath and does arithmetic, flag overflow." |
| Exploit script doesn't compile | Hardhat compilation error in stream | Return `exploit_possible: false, compile_error: <error>` |
| Exploit runs but doesn't drain | `[EXPLOIT SUCCESS]` not in output | Return partial result with terminal log for manual review |
| Patch code doesn't compile | Run `solc` validation on patched_code | Return error + original vulns list, suggest manual review |

---

## Token Usage Estimates

| Agent | Typical Input Tokens | Typical Output Tokens | Cost per call (Sonnet 4) |
|---|---|---|---|
| Vulnerability Detection | ~800–2,000 | ~1,000–2,000 | ~$0.005–0.015 |
| Exploit Generation | ~1,200–2,500 | ~1,500–3,000 | ~$0.007–0.020 |
| Patch Generation | ~1,000–2,000 | ~2,000–4,000 | ~$0.010–0.025 |
| **Full scan (1 vuln)** | ~3,000–6,500 | ~4,500–9,000 | **~$0.02–0.06** |

A complete scan with 3 vulnerabilities costs approximately **$0.05–0.15** — extremely viable for a hackathon demo.
