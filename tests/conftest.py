"""Shared test fixtures."""
import sys
from pathlib import Path

# Ensure pipeline is importable
sys.path.insert(0, str(Path(__file__).parent.parent))
