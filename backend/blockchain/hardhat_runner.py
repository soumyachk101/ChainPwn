"""VulnForge Hardhat Runner - Execute exploit scripts on local Hardhat network."""

import asyncio
import json
import os
import re
import shutil
import tempfile
from pathlib import Path
from typing import Callable, Awaitable


HARDHAT_WORKSPACE = Path(os.getenv("HARDHAT_WORKSPACE", "./hardhat_workspace")).resolve()


class HardhatRunner:
    """Runs exploit scripts against contracts on a local Hardhat EVM."""

    def __init__(self):
        self._active_count = 0

    def get_active_count(self) -> int:
        return self._active_count

    async def run_exploit(
        self,
        contract_source: str,
        contract_name: str,
        exploit_script: str,
        attacker_contract_source: str = "",
        session_id: str = "",
        on_output: Callable[[str], Awaitable[None]] | None = None,
    ) -> dict:
        """Run an exploit script on the local Hardhat network.

        Creates temporary files in the Hardhat workspace, runs the script,
        and captures output including balance changes.
        """
        self._active_count += 1
        workspace = HARDHAT_WORKSPACE
        contract_dir = workspace / "contracts"
        script_dir = workspace / "scripts"
        session_dir = workspace / f"session_{session_id[:8]}"

        try:
            # Create directories
            contract_dir.mkdir(parents=True, exist_ok=True)
            script_dir.mkdir(parents=True, exist_ok=True)

            # Write contract source
            contract_path = contract_dir / f"{contract_name}.sol"
            contract_path.write_text(contract_source)

            # Write attacker contract if needed
            if attacker_contract_source:
                attacker_path = contract_dir / "Attacker.sol"
                attacker_path.write_text(attacker_contract_source)

            # Write exploit script
            script_path = script_dir / f"exploit_{session_id[:8]}.js"
            script_path.write_text(exploit_script)

            # Run Hardhat script
            output_lines = []
            success = False

            try:
                process = await asyncio.create_subprocess_exec(
                    "npx", "hardhat", "run", str(script_path),
                    cwd=str(workspace),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.STDOUT,
                )

                async for line in process.stdout:
                    decoded = line.decode("utf-8", errors="replace").rstrip()
                    output_lines.append(decoded)
                    if on_output:
                        await on_output(decoded)

                await process.wait()

                # Parse results from output
                full_output = "\n".join(output_lines)
                success = "[EXPLOIT SUCCESS]" in full_output

            except FileNotFoundError:
                output_lines.append("ERROR: npx/hardhat not found. Install Node.js and Hardhat.")
            except Exception as e:
                output_lines.append(f"ERROR: {e}")

            # Parse balances from output
            pre_balance = self._extract_balance(output_lines, "BEFORE")
            post_balance = self._extract_balance(output_lines, "AFTER")

            return {
                "success": success,
                "output": "\n".join(output_lines),
                "status": "SUCCESS" if success else "FAILED",
                "logs": output_lines,
                "pre_balance": pre_balance,
                "post_balance": post_balance,
                "attacker_balances": {
                    "before": pre_balance.get("attacker", "0"),
                    "after": post_balance.get("attacker", "0"),
                },
                "contract_balances": {
                    "before": pre_balance.get("contract", "0"),
                    "after": post_balance.get("contract", "0"),
                },
            }

        finally:
            self._active_count = max(0, self._active_count - 1)
            # Cleanup temp files
            try:
                if contract_dir.exists():
                    (contract_dir / f"{contract_name}.sol").unlink(missing_ok=True)
                    (contract_dir / "Attacker.sol").unlink(missing_ok=True)
                if script_dir.exists():
                    (script_dir / f"exploit_{session_id[:8]}.js").unlink(missing_ok=True)
            except Exception:
                pass

    def _extract_balance(self, lines: list[str], phase: str) -> dict[str, str]:
        """Extract balance values from output lines."""
        result = {"attacker": "0", "contract": "0"}
        pattern = re.compile(rf"\[BALANCE\]\s+(ATTACKER|CONTRACT)\s+{phase}:\s*([\d.]+)")
        for line in lines:
            match = pattern.search(line)
            if match:
                key = match.group(1).lower()
                result[key] = match.group(2)
        return result


# Singleton
hardhat_runner = HardhatRunner()
