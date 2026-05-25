"""VulnForge Backend - FastAPI entry point.

AI-powered smart contract exploit simulator.
Run with: uvicorn main:app --reload --port 8000
"""

import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from routers.analyze import router as analyze_router
from routers.exploit import router as exploit_router
from routers.patch import router as patch_router
from routers.report import router as report_router
from routers.ws import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # Lazy import to ensure env is loaded
    from deps import session_manager, hardhat_runner

    workspace = Path(os.getenv("HARDHAT_WORKSPACE", "./hardhat_workspace")).resolve()
    node_modules = workspace / "node_modules"
    if not node_modules.exists():
        print(f"[VulnForge] Hardhat workspace at {workspace} has no node_modules.")
        print(f"[VulnForge] Run 'npm install' in {workspace} to enable exploit execution.")
    else:
        print(f"[VulnForge] Hardhat workspace ready at {workspace}")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key:
        print("[VulnForge] Anthropic API key configured - AI agents enabled")
    else:
        print("[VulnForge] No Anthropic API key - running in demo/fallback mode")

    print(f"[VulnForge] Backend started on port {os.getenv('PORT', '8000')}")
    yield
    expired = session_manager.cleanup_expired()
    print(f"[VulnForge] Cleaned up {expired} expired sessions on shutdown")
    print("[VulnForge] Backend shut down")


app = FastAPI(
    title="VulnForge",
    description="AI-Powered Smart Contract Exploit Simulator",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "VulnForge",
        "version": "1.0.0",
        "description": "AI-Powered Smart Contract Exploit Simulator",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    from deps import session_manager, hardhat_runner, stream_handler
    return {
        "status": "healthy",
        "ai_configured": bool(os.getenv("ANTHROPIC_API_KEY")),
        "active_sessions": len(session_manager.list_sessions()),
        "active_exploits": hardhat_runner.get_active_count(),
        "active_websockets": len(stream_handler.get_active_job_ids()),
    }


@app.get("/api/demo-contracts")
async def list_demo_contracts():
    """List available demo vulnerable contracts."""
    demo_dir = Path(__file__).parent / "demo_contracts"
    contracts = []
    if demo_dir.exists():
        for sol_file in sorted(demo_dir.glob("*.sol")):
            source = sol_file.read_text()
            contracts.append({
                "filename": sol_file.name,
                "name": sol_file.stem,
                "source_code": source,
            })
    return {"contracts": contracts}


@app.get("/api/demo-contracts/{filename}")
async def get_demo_contract(filename: str):
    """Get a specific demo contract source code."""
    demo_dir = Path(__file__).parent / "demo_contracts"
    file_path = demo_dir / filename
    if not file_path.exists():
        return {"error": f"Contract '{filename}' not found"}
    return {"source_code": file_path.read_text(), "filename": filename}


@app.get("/api/sessions")
async def list_sessions():
    """List all active sessions."""
    from deps import session_manager
    return {"sessions": session_manager.list_sessions()}


# Mount all routers under /api prefix
app.include_router(analyze_router, prefix="/api")
app.include_router(exploit_router, prefix="/api")
app.include_router(patch_router, prefix="/api")
app.include_router(report_router, prefix="/api")
app.include_router(ws_router, prefix="/ws")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
