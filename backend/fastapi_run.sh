#!/usr/bin/env bash
set -e

export PYTHONPATH="$(pwd)"

python3 - <<'PY'
from fastapi_app import create_tables
create_tables()
PY

exec uvicorn fastapi_app:app --host 0.0.0.0 --port 5010 --reload
