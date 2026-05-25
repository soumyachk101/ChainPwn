"""VulnForge Session Manager - Track per-scan session state."""

import asyncio
import time
import uuid
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ExploitJob:
    """Tracks an exploit execution job."""
    job_id: str
    session_id: str
    vulnerability_id: str
    status: str = "pending"  # pending, generated, running, success, failed, error
    contract_name: str = ""
    source_code: str = ""
    exploit_script: str = ""
    exploit_result: dict = field(default_factory=dict)
    logs: list[str] = field(default_factory=list)
    error_message: str = ""
    completed_at: float = 0


@dataclass
class Session:
    """Tracks a single analysis/audit session."""
    session_id: str
    created_at: float = field(default_factory=time.time)
    last_active: float = field(default_factory=time.time)
    contract_name: str = ""
    source_code: str = ""
    solidity_version: str = ""
    vulnerability_results: dict = field(default_factory=dict)
    exploit_jobs: dict[str, ExploitJob] = field(default_factory=dict)
    patch_results: dict = field(default_factory=dict)


class SessionManager:
    """In-memory session store with TTL-based cleanup."""

    def __init__(self, ttl_seconds: int = 3600):
        self._sessions: dict[str, Session] = {}
        self._ttl = ttl_seconds
        self._cleanup_task: asyncio.Task | None = None

    def get_or_create_session(self, session_id: str | None = None) -> Session:
        """Get existing session or create a new one."""
        if session_id and session_id in self._sessions:
            session = self._sessions[session_id]
            session.last_active = time.time()
            return session

        sid = session_id or str(uuid.uuid4())
        session = Session(session_id=sid)
        self._sessions[sid] = session
        return session

    def get_session(self, session_id: str) -> Session | None:
        """Get a session by ID."""
        session = self._sessions.get(session_id)
        if session:
            session.last_active = time.time()
        return session

    def add_exploit_job(self, session_id: str, job: ExploitJob):
        """Add an exploit job to a session."""
        session = self._sessions.get(session_id)
        if session:
            session.exploit_jobs[job.job_id] = job
            session.last_active = time.time()

    def list_sessions(self) -> list[dict]:
        """List all active sessions."""
        return [
            {
                "session_id": s.session_id,
                "contract_name": s.contract_name,
                "created_at": s.created_at,
                "last_active": s.last_active,
                "vulnerability_count": len(s.vulnerability_results.get("vulnerabilities", [])),
                "exploit_job_count": len(s.exploit_jobs),
            }
            for s in self._sessions.values()
        ]

    def cleanup_expired(self) -> int:
        """Remove expired sessions. Returns count of removed sessions."""
        now = time.time()
        expired = [
            sid for sid, session in self._sessions.items()
            if now - session.last_active > self._ttl
        ]
        for sid in expired:
            del self._sessions[sid]
        return len(expired)

    def start_cleanup_task(self):
        """Start periodic cleanup task."""
        async def _cleanup_loop():
            while True:
                await asyncio.sleep(300)  # Every 5 minutes
                self.cleanup_expired()

        try:
            self._cleanup_task = asyncio.create_task(_cleanup_loop())
        except RuntimeError:
            pass  # No event loop running yet

    def stop_cleanup_task(self):
        """Stop the cleanup task."""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            self._cleanup_task = None


# Singleton
session_manager = SessionManager()
