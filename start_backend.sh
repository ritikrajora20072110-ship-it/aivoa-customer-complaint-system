#!/bin/bash
cd "$(dirname "$0")/backend"
source venv/bin/activate
export PYTHONPATH=.
echo "Starting AIVOA QMS Backend on http://localhost:8000..."
uvicorn app.main:app --reload --port 8000
