"""Make the base worker's sources importable when running pytest from the repo.

Mirrors the container layout, where `src/` and the shared `common` package are on
the import path. Allows `pytest tests/unit` from `server/workers/base` without
setting PYTHONPATH manually.
"""

import sys
from pathlib import Path

_BASE_DIR = Path(__file__).resolve().parents[2]          # server/workers/base
for p in (_BASE_DIR / "src", _BASE_DIR.parent / "common"):
    p = str(p)
    if p not in sys.path:
        sys.path.insert(0, p)
