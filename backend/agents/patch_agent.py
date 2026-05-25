"""VulnForge Patch Agent - Generates patched Solidity contracts using Claude."""

import json
import os
import asyncio
import re

import anthropic


ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = "claude-sonnet-4-20250514"

client: anthropic.AsyncAnthropic | None = None
if ANTHROPIC_API_KEY:
    client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)


PATCH_DEVELOPER_SYSTEM = """You are a senior Solidity developer specializing in smart contract security.
Your task is to generate patched versions of vulnerable Solidity contracts.

Rules:
1. Keep all original function signatures and interfaces intact
2. Use OpenZeppelin libraries where applicable (ReentrancyGuard, Ownable, SafeMath, etc.)
3. Add inline comments with "// FIX [TYPE]" prefix for each fix applied
4. Ensure the patched code compiles with the specified Solidity version
5. If upgrading the Solidity version is necessary, note it in compilation_notes
6. Return ONLY valid JSON with the schema specified. No markdown, no explanation outside JSON.
7. Preserve the SPDX license identifier
8. Maintain the contract's intended functionality while fixing vulnerabilities"""

PATCH_GENERATION_PROMPT = """Patch the following Solidity contract to fix the identified vulnerabilities:

Contract Name: {contract_name}
Solidity Version: {solidity_version}

Vulnerabilities to fix:
{vulnerabilities_json}

Original Source Code:
```solidity
{source_code}
```

Generate the complete patched contract. For each fix, add a comment like "// FIX REENTRANCY" above the relevant code.

Return your response as a single JSON object with this exact schema:
{{
  "patched_code": "complete patched Solidity source code as a string",
  "fixes_applied": [
    {{
      "vulnerability_id": "vuln_001",
      "type": "REENTRANCY",
      "fix_summary": "Added ReentrancyGuard modifier",
      "openZeppelin_imports_added": ["@openzeppelin/contracts/security/ReentrancyGuard.sol"],
      "breaking_changes": false
    }}
  ],
  "new_dependencies": ["@openzeppelin/contracts"],
  "solidity_version_changed": false,
  "compilation_notes": "Any notes about compilation"
}}"""


def _generate_fallback_patch(
    contract_name: str,
    solidity_version: str,
    source_code: str,
    vulnerabilities: list,
) -> dict:
    """Generate a basic patched contract without Claude API."""
    patched = source_code
    fixes = []
    new_deps = set()
    version_changed = False

    for vuln in vulnerabilities:
        vuln_type = vuln.get("type", "").upper()

        if vuln_type == "REENTRANCY":
            # Add ReentrancyGuard import
            if "ReentrancyGuard" not in patched:
                patched = patched.replace(
                    "pragma solidity",
                    "// FIX REENTRANCY: Added ReentrancyGuard import\nimport \"@openzeppelin/contracts/security/ReentrancyGuard.sol\";\n\npragma solidity",
                )
                new_deps.add("@openzeppelin/contracts")

            # Add ReentrancyGuard to contract
            patched = patched.replace(
                f"contract {contract_name}",
                f"contract {contract_name} is ReentrancyGuard",
            )

            # Add nonReentrant modifier to withdraw
            patched = re.sub(
                r"function\s+withdraw\(\)\s+public",
                "function withdraw() public nonReentrant",
                patched,
            )

            # Fix state update order (Checks-Effects-Interactions)
            call_match = re.search(r"(\s*\(bool\s+sent,\s*\)\s*=\s*msg\.sender\.call\{value[^}]*\}[^;]*;)", patched)
            balance_match = re.search(r"(\s*balances\[msg\.sender\]\s*=\s*0;)", patched)
            if call_match and balance_match:
                call_block = call_match.group(1)
                balance_block = balance_match.group(1)
                patched = patched.replace(call_block, "")
                patched = patched.replace(balance_block, balance_block + call_block + "\n    // FIX REENTRANCY: State update before external call")

            fixes.append({
                "vulnerability_id": vuln.get("id", "unknown"),
                "type": "REENTRANCY",
                "fix_summary": "Added ReentrancyGuard modifier and Checks-Effects-Interactions pattern",
                "openZeppelin_imports_added": ["@openzeppelin/contracts/security/ReentrancyGuard.sol"],
                "breaking_changes": False,
            })

        elif vuln_type == "ACCESS_CONTROL":
            if "Ownable" not in patched:
                patched = patched.replace(
                    "pragma solidity",
                    "// FIX ACCESS_CONTROL: Added Ownable\nimport \"@openzeppelin/contracts/access/Ownable.sol\";\n\npragma solidity",
                )
                new_deps.add("@openzeppelin/contracts")

            patched = patched.replace(
                f"contract {contract_name}",
                f"contract {contract_name} is Ownable",
            )

            # Add onlyOwner to drain-like functions
            patched = re.sub(
                r"function\s+(drain|withdraw|sweep|transfer)\(([^)]*)\)\s+public",
                r"function \1(\2) public onlyOwner",
                patched,
            )

            # Add constructor with owner
            if "constructor()" in patched:
                patched = patched.replace("constructor()", "constructor() Ownable(msg.sender)")

            fixes.append({
                "vulnerability_id": vuln.get("id", "unknown"),
                "type": "ACCESS_CONTROL",
                "fix_summary": "Added Ownable pattern with onlyOwner modifier to sensitive functions",
                "openZeppelin_imports_added": ["@openzeppelin/contracts/access/Ownable.sol"],
                "breaking_changes": False,
            })

        elif vuln_type == "OVERFLOW":
            # Upgrade pragma to 0.8.x
            old_pragma = re.search(r"pragma solidity [^;]+;", patched)
            if old_pragma and re.search(r"pragma solidity \^?0\.[67]", old_pragma.group(0)):
                patched = patched.replace(old_pragma.group(0), "pragma solidity ^0.8.0;")
                version_changed = True
                fixes.append({
                    "vulnerability_id": vuln.get("id", "unknown"),
                    "type": "OVERFLOW",
                    "fix_summary": "Upgraded to Solidity 0.8.0+ for built-in overflow protection",
                    "openZeppelin_imports_added": [],
                    "breaking_changes": True,
                })

    notes = "Patched contract may need recompilation with updated Solidity version." if version_changed else "No compilation changes needed."

    return {
        "patched_code": patched,
        "fixes_applied": fixes,
        "new_dependencies": list(new_deps),
        "solidity_version_changed": version_changed,
        "compilation_notes": notes,
    }


async def generate_patch(
    contract_name: str,
    solidity_version: str,
    source_code: str,
    vulnerabilities: list,
) -> dict:
    """Generate a patched contract.

    Uses Claude API if available, otherwise falls back to rule-based patching.
    """
    if client:
        try:
            vulns_json = json.dumps(vulnerabilities, indent=2)
            prompt = PATCH_GENERATION_PROMPT.format(
                contract_name=contract_name,
                solidity_version=solidity_version,
                vulnerabilities_json=vulns_json,
                source_code=source_code,
            )
            response = await asyncio.wait_for(
                client.messages.create(
                    model=MODEL,
                    max_tokens=4096,
                    system=PATCH_DEVELOPER_SYSTEM,
                    messages=[{"role": "user", "content": prompt}],
                ),
                timeout=60,
            )
            raw = response.content[0].text.strip()
            if raw.startswith("```"):
                raw = re.sub(r"^```(?:json)?\s*", "", raw)
                raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except Exception:
            pass

    return _generate_fallback_patch(contract_name, solidity_version, source_code, vulnerabilities)
