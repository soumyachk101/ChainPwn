"""VulnForge Analyze Router - Contract vulnerability analysis endpoint."""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.vulnerability_agent import analyze_contract, _extract_solidity_version

router = APIRouter(tags=["analyze"])


class AnalyzeRequest(BaseModel):
    """Request body for contract analysis."""
    source_code: str = Field(..., description="Solidity source code to analyze")
    contract_name: Optional[str] = Field(default=None, description="Name of the contract")
    session_id: str = Field(..., description="Client-generated session ID")


class AnalyzeResponse(BaseModel):
    """Response body for contract analysis."""
    contract_name: str
    solidity_version: str
    overall_risk: str
    vulnerabilities: list[dict]
    safe_patterns_detected: list[str]
    compiler_warnings: list[str]
    audit_confidence: str


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """Analyze a Solidity contract for security vulnerabilities.

    Uses Claude AI to perform deep static analysis of the contract,
    detecting reentrancy, overflow, access control, and 10+ other
    vulnerability classes with precise line-level accuracy.

    Args:
        request: The analysis request with source code and metadata.

    Returns:
        Structured vulnerability report with findings.
    """
    from deps import session_manager

    if not request.source_code.strip():
        raise HTTPException(status_code=400, detail="Source code cannot be empty")

    # Get or create session
    session = session_manager.get_or_create_session(request.session_id)
    session.source_code = request.source_code
    session.contract_name = request.contract_name or "Unknown"

    # Detect solidity version
    detected_version = _extract_solidity_version(request.source_code)
    session.solidity_version = detected_version

    try:
        result = await analyze_contract(
            source_code=request.source_code,
            contract_name=request.contract_name or "Unknown",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # Store results in session
    session.vulnerability_results = result
    session.contract_name = result.get("contract_name", session.contract_name)
    session.solidity_version = result.get("solidity_version", detected_version)

    return AnalyzeResponse(
        contract_name=result.get("contract_name", session.contract_name),
        solidity_version=result.get("solidity_version", detected_version),
        overall_risk=result.get("overall_risk", "UNKNOWN"),
        vulnerabilities=result.get("vulnerabilities", []),
        safe_patterns_detected=result.get("safe_patterns_detected", []),
        compiler_warnings=result.get("compiler_warnings", []),
        audit_confidence=result.get("audit_confidence", "LOW"),
    )
