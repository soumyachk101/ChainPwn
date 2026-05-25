"""VulnForge Shared Dependencies - Singleton instances used across the application."""

import os

from utils.session_manager import SessionManager
from utils.stream_handler import StreamHandler
from blockchain.hardhat_runner import HardhatRunner

session_manager = SessionManager(ttl_seconds=int(os.getenv("SESSION_TTL_SECONDS", "3600")))
stream_handler = StreamHandler()
hardhat_runner = HardhatRunner()
