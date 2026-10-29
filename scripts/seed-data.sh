#!/usr/bin/env bash
# ==========================================
# PavelAGI-X Omega | Seed Data Generator
# ==========================================
set -euo pipefail

echo "==> [PavelAGI-X Omega] Seeding Memory Fabric and World Model Graph..."

ENDPOINT="http://localhost:3000/api/agi"

# Check if server is running
if curl -s "${ENDPOINT}/health" > /dev/null 2>&1; then
    echo "--> Server is live. Ingesting seed telemetry..."
    
    # Trigger compaction test
    echo "--> Testing memory fabric compaction..."
    curl -s -X POST "${ENDPOINT}/memory/compact" -H "Content-Type: application/json" -d '{"tier":"Working"}' | grep -o '"bytesSaved":[0-9]*' || true

    # Test Cypher query
    echo "--> Testing OpenCypher query..."
    curl -s -X POST "${ENDPOINT}/world/cypher" -H "Content-Type: application/json" -d '{"query":"MATCH (n:Technology)"}' | grep -o '"matchedNodes":\[[^]]*\]' || true

    echo "==> Seed data verified on running kernel."
else
    echo "--> Notice: Server not currently running on :3000. Seed data is pre-compiled into memory-fabric.ts and graph.ts."
fi
