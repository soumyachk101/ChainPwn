"""VulnForge Patch Router - Contract patching endpoint."""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.patch_agent import generate_patch

router = APIRouter(tags=["patch"])


class PatchRequest(BaseModel):
    """Request body for patch generation."""
    session_id: str = Field(..., description="Session ID from prior analysis")
    source_code: Optional[str] = Field(default=None, description="Contract source code (uses session source if not provided)")
    contract_name: Optional[str] = Field(default=None, description="Contract name")
    solidity_version: Optional[str] = Field(default=None, description="Solidity version")
    vulnerabilities: list[dict] = Field(default_factory=list, description="Vulnerability details for patching")


class PatchResponse(BaseModel):
    """Response body for patch generation."""
    patched_code: str
    fixes_applied: list[dict]
    new_dependencies: list[str]
    solidity_version_changed: bool
    compilation_notes: str


@router.post("/patch", response_model=PatchResponse)
async def patch(request: PatchRequest) -> PatchResponse:
    """Generate a patched version of a Solidity contract.

    Uses Claude AI to generate production-ready patched code using
    OpenZeppelin patterns, with inline fix comments and a side-by-side
    diff view showing exactly what changed.

    Args:
        request: The patch request with session ID and vulnerability details.

    Returns:
        Patched contract code with fix metadata.
    """
    from deps import session_manager

    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{request.session_id}' not found")

    source_code = request.source_code or session.source_code
    contract_name = request.contract_name or session.contract_name
    solidity_version = request.solidity_version or session.solidity_version

    if not source_code:
        raise HTTPException(status_code=400, detail="No source code available")

    vulnerabilities = request.vulnerabilities
    if not vulnerabilities and session.vulnerability_results:
        vulnerabilities = [
            v for v in session.vulnerability_results.get("vulnerabilities", [])
            if v.get("exploit_possible", False)
        ]

    if not vulnerabilities:
        raise HTTPException(status_code=400, detail="No vulnerabilities to patch. Run analysis first or provide vulnerabilities.")

    try:
        result = await generate_patch(
            contract_name=contract_name,
            solidity_version=solidity_version,
            source_code=source_code,
            vulnerabilities=vulnerabilities,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Patch generation failed: {str(e)}")

    # Store in session
    session.patch_result = result

    return PatchResponse(
        patched_code=result.get("patched_code", source_code),
        fixes_applied=result.get("fixes_applied", []),
        new_dependencies=result.get("new_dependencies", []),
        solidity_version_changed=result.get("solidity_version_changed", False),
        compilation_notes=result.get("compilation_notes", ""),
    )
