"""VulnForge State Capture - Capture EVM state snapshots."""

import re


class StateCapture:
    """Captures and parses EVM state from exploit output."""

    @staticmethod
    def parse_balances(lines: list[str]) -> dict:
        """Parse [BALANCE] tagged lines from exploit output."""
        before = {"attacker": "0", "contract": "0"}
        after = {"attacker": "0", "contract": "0"}

        for line in lines:
            if "[BALANCE]" not in line:
                continue

            before_match = re.search(r"\[BALANCE\]\s+(ATTACKER|CONTRACT)\s+BEFORE:\s*([\d.]+)", line)
            if before_match:
                key = before_match.group(1).lower()
                before[key] = before_match.group(2)

            after_match = re.search(r"\[BALANCE\]\s+(ATTACKER|CONTRACT)\s+AFTER:\s*([\d.]+)", line)
            if after_match:
                key = after_match.group(1).lower()
                after[key] = after_match.group(2)

        return {"before": before, "after": after}

    @staticmethod
    def parse_result(lines: list[str]) -> dict:
        """Parse exploit result from output lines."""
        for line in reversed(lines):
            if "[EXPLOIT SUCCESS]" in line:
                return {"success": True, "message": "Exploit succeeded"}
            if "[EXPLOIT FAILED]" in line:
                return {"success": False, "message": "Exploit failed"}

        return {"success": False, "message": "Result unknown"}

    @staticmethod
    def compute_drain(before: dict, after: dict) -> str:
        """Compute drained amount from balance snapshots."""
        try:
            contract_before = float(before.get("contract", "0"))
            contract_after = float(after.get("contract", "0"))
            drained = contract_before - contract_after
            if drained > 0:
                return f"{drained:.4f} ETH"
        except (ValueError, TypeError):
            pass
        return "0 ETH"
