#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== MLB Gameday Maintenance ==="
echo "Started at: $(date)"
echo ""

echo "--- Fetching pitch arsenals ---"
python3 "$SCRIPT_DIR/fetch_pitch_arsenal.py"

echo ""
echo "=== Maintenance complete at: $(date) ==="
