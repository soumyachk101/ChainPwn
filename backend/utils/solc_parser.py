"""VulnForge Solidity Parser - Extract metadata from Solidity source code."""

import re


def extract_pragma_version(source: str) -> str:
    """Extract pragma solidity version string from source code."""
    match = re.search(r"pragma\s+solidity\s+([^;]+);", source)
    return match.group(1).strip() if match else "unknown"


def extract_compiler_version(pragma: str) -> str:
    """Convert pragma version to a concrete compiler version for Hardhat config."""
    # Extract numeric version from pragma
    match = re.search(r"(\d+\.\d+\.\d+)", pragma)
    if match:
        return match.group(1)

    # Handle caret ranges like ^0.8.0
    match = re.search(r"\^?0\.(\d+)", pragma)
    if match:
        minor = int(match.group(1))
        if minor >= 8:
            return "0.8.20"
        elif minor >= 7:
            return "0.7.6"
        else:
            return "0.6.12"

    return "0.8.20"


def extract_first_contract_name(source: str) -> str:
    """Extract the first contract/library/interface name from source code."""
    match = re.search(r"(?:contract|library|interface)\s+(\w+)", source)
    return match.group(1) if match else "Unknown"


def extract_abi_signatures(source: str) -> list[dict]:
    """Extract function signatures from Solidity source code."""
    functions = []
    pattern = re.compile(
        r"function\s+(\w+)\s*\(([^)]*)\)\s*"
        r"(external|public|internal|private)?\s*"
        r"(view|pure|payable)?\s*"
        r"(?:returns\s*\(([^)]*)\))?",
    )
    for match in pattern.finditer(source):
        functions.append({
            "name": match.group(1),
            "inputs": match.group(2).strip(),
            "visibility": match.group(3) or "internal",
            "mutability": match.group(4) or "",
            "outputs": (match.group(5) or "").strip(),
        })
    return functions
