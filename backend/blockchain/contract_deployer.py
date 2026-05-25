"""VulnForge Contract Deployer - Deploy contracts to local Hardhat network."""

import asyncio
import json
import os
from pathlib import Path
from typing import Optional


class ContractDeployer:
    """Deploy and manage contracts on a local Hardhat network."""

    def __init__(self):
        self.workspace = Path(os.getenv("HARDHAT_WORKSPACE", "./hardhat_workspace")).resolve()

    async def deploy(
        self,
        contract_source: str,
        contract_name: str,
        constructor_args: Optional[list] = None,
        initial_fund_eth: str = "0",
    ) -> dict:
        """Deploy a contract to the local Hardhat network.

        Args:
            contract_source: Solidity source code.
            contract_name: Contract name.
            constructor_args: Constructor arguments (if any).
            initial_fund_eth: ETH to send with deployment.

        Returns:
            Dict with deployment details.
        """
        session_dir = self.workspace / f"_deploy_{contract_name.lower()}"
        contracts_dir = session_dir / "contracts"
        scripts_dir = session_dir / "scripts"

        try:
            contracts_dir.mkdir(parents=True, exist_ok=True)
            scripts_dir.mkdir(parents=True, exist_ok=True)

            # Write contract
            (contracts_dir / f"{contract_name}.sol").write_text(contract_source)

            # Write deployment script
            args_str = json.dumps(constructor_args or [])
            deploy_script = f"""
const {{ ethers }} = require("hardhat");

async function main() {{
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    const Factory = await ethers.getContractFactory("{contract_name}");
    const args = {args_str};
    const contract = await Factory.deploy(...args);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("Deployed at:", address);

    // Fund if needed
    const fundAmount = "{initial_fund_eth}";
    if (parseFloat(fundAmount) > 0) {{
        const tx = await deployer.sendTransaction({{
            to: address,
            value: ethers.parseEther(fundAmount),
        }});
        await tx.wait();
        console.log("Funded with", fundAmount, "ETH");
    }}

    console.log("[DEPLOY SUCCESS]", address);
}}

main().then(() => process.exit(0)).catch((e) => {{
    console.error(e);
    console.log("[DEPLOY FAILED]");
    process.exit(1);
}});
"""
            (scripts_dir / "deploy.js").write_text(deploy_script)

            # Copy hardhat config
            config = self.workspace / "hardhat.config.js"
            if config.exists():
                import shutil
                shutil.copy(str(config), str(session_dir / "hardhat.config.js"))

            # Link node_modules
            workspace_nm = self.workspace / "node_modules"
            session_nm = session_dir / "node_modules"
            if workspace_nm.exists() and not session_nm.exists():
                try:
                    session_nm.symlink_to(workspace_nm)
                except OSError:
                    import shutil
                    shutil.copytree(str(workspace_nm), str(session_nm), dirs_exist_ok=True)

            # Compile and deploy
            proc = await asyncio.create_subprocess_exec(
                "npx", "hardhat", "compile",
                cwd=str(session_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            await proc.wait()

            proc = await asyncio.create_subprocess_exec(
                "npx", "hardhat", "run", str(scripts_dir / "deploy.js"),
                cwd=str(session_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            output, _ = await proc.communicate()
            text = output.decode()

            address = None
            for line in text.split("\n"):
                if "Deployed at:" in line:
                    address = line.split("Deployed at:")[-1].strip()
                    break

            return {
                "success": "[DEPLOY SUCCESS]" in text,
                "address": address,
                "output": text,
                "error": None if "[DEPLOY SUCCESS]" in text else text[-500:],
            }

        except Exception as e:
            return {
                "success": False,
                "address": None,
                "output": "",
                "error": str(e),
            }
