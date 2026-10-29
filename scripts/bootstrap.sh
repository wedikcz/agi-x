#!/usr/bin/env bash
# ==========================================
# PavelAGI-X Omega | Cluster & Local Bootstrap Script
# ==========================================
set -euo pipefail

echo "==> [PavelAGI-X Omega] Initializing Local Cognitive Environment..."

# 1. Check Node & npm
echo "--> Checking Node.js version:"
node -v
npm -v

# 2. Check dependencies
if [ ! -d "node_modules" ]; then
    echo "--> Installing project dependencies..."
    npm ci
else
    echo "--> Dependencies already installed."
fi

# 3. Run Static Type Checking
echo "--> Verifying TypeScript types..."
npm run lint

# 4. Run Automated Unit Test Suite
echo "--> Executing test suite via node:test..."
npm test

# 5. Check manifest directory
echo "--> Validating OpenShift manifests..."
ls -la manifests/

echo "==> [PavelAGI-X Omega] Bootstrap completed successfully!"
echo "==> Run 'npm run dev' to launch the interactive Proto-AGI operating system."
