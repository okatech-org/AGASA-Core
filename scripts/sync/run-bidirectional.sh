#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

"${SCRIPT_DIR}/convex-to-postgres.sh"
"${SCRIPT_DIR}/postgres-to-convex.sh"

echo "Sync bidirectionnelle terminée."
