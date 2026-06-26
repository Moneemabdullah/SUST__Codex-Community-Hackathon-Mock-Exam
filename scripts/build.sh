#!/usr/bin/env bash
set -euo pipefail
echo "[build] TypeScript -> dist/"
pnpm build
echo "[build] Done."