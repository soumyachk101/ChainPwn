"""VulnForge Stream Handler - WebSocket connection manager for real-time streaming."""

import time
from typing import Any

from fastapi import WebSocket


class StreamHandler:
    """Manages WebSocket connections for streaming exploit execution output."""

    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        """Accept and register a WebSocket connection for a job."""
        await websocket.accept()
        if job_id not in self._connections:
            self._connections[job_id] = []
        self._connections[job_id].append(websocket)

    def disconnect(self, websocket: WebSocket, job_id: str):
        """Remove a WebSocket connection."""
        if job_id in self._connections:
            self._connections[job_id] = [
                ws for ws in self._connections[job_id] if ws != websocket
            ]
            if not self._connections[job_id]:
                del self._connections[job_id]

    def register(self, job_id: str, websocket: WebSocket):
        """Register a pre-accepted WebSocket."""
        if job_id not in self._connections:
            self._connections[job_id] = []
        self._connections[job_id].append(websocket)

    def unregister(self, job_id: str, websocket: WebSocket):
        """Unregister a WebSocket."""
        self.disconnect(websocket, job_id)

    async def broadcast(self, job_id: str, message: dict):
        """Broadcast a message to all clients connected to a job."""
        if job_id not in self._connections:
            return
        dead = []
        for ws in self._connections[job_id]:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, job_id)

    async def broadcast_log(self, job_id: str, line: str):
        """Broadcast a log line."""
        await self.broadcast(job_id, {
            "type": "LOG",
            "job_id": job_id,
            "timestamp": time.time(),
            "data": line,
        })

    async def broadcast_state(self, job_id: str, state: str, message: str = ""):
        """Broadcast a state change."""
        await self.broadcast(job_id, {
            "type": "STATE",
            "job_id": job_id,
            "timestamp": time.time(),
            "data": {"state": state, "message": message},
        })

    async def broadcast_result(self, job_id: str, result: dict):
        """Broadcast final exploit results."""
        await self.broadcast(job_id, {
            "type": "RESULT",
            "job_id": job_id,
            "timestamp": time.time(),
            "data": result,
        })

    async def broadcast_error(self, job_id: str, error: str):
        """Broadcast an error message."""
        await self.broadcast(job_id, {
            "type": "ERROR",
            "job_id": job_id,
            "timestamp": time.time(),
            "data": {"error": error},
        })

    def get_active_job_ids(self) -> list[str]:
        """Get all job IDs with active connections."""
        return list(self._connections.keys())


# Singleton
stream_handler = StreamHandler()
