"""VulnForge WebSocket Router - Real-time exploit execution streaming."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])


@router.websocket("/stream/{job_id}")
async def stream_exploit(websocket: WebSocket, job_id: str) -> None:
    """WebSocket endpoint for streaming exploit execution output in real-time.

    Connect to this endpoint to receive live logs, state changes, and results
    from an exploit execution. Messages are JSON with the following structure:

    ```json
    {
        "type": "LOG|STATE|EXPLOIT_CODE|RESULT|ERROR",
        "job_id": "...",
        "timestamp": 1234567890.123,
        "data": {...}
    }
    ```

    Message types:
    - LOG: A line of output from the exploit execution
    - STATE: State change (deploying, attacking, complete, etc.)
    - EXPLOIT_CODE: The exploit script being executed
    - RESULT: Final exploit results (success/failure, balances)
    - ERROR: Error message

    Args:
        websocket: The WebSocket connection.
        job_id: The exploit job ID to stream for.
    """
    from deps import stream_handler

    await stream_handler.connect(websocket, job_id)

    try:
        while True:
            data = await websocket.receive_text()
            if data.strip().lower() == "ping":
                await websocket.send_json({"type": "PONG", "job_id": job_id})
    except WebSocketDisconnect:
        stream_handler.disconnect(websocket, job_id)
    except Exception:
        stream_handler.disconnect(websocket, job_id)
