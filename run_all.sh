#!/bin/bash
DIR="$(dirname "$0")"
echo "=========================================================="
echo " Starting AIVOA AI Complaint Management System"
echo " Backend: http://localhost:8000 (API & Swagger Docs: /docs)"
echo " Frontend: http://localhost:5173"
echo "=========================================================="

"$DIR/start_backend.sh" &
BACKEND_PID=$!

sleep 2

"$DIR/start_frontend.sh" &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
