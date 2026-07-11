# =============================================================================
# Multimate AI — Electron Desktop App Builder Dockerfile
# Build-only image — produces a Windows NSIS installer for CI/CD pipelines.
# Uses electronuserland/builder:wine which provides Node.js + Wine for
# cross-platform Windows builds from Linux.
# =============================================================================

FROM electronuserland/builder:wine AS builder

WORKDIR /app

# Copy package files first (leverage Docker layer caching)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Set build-time env vars (provide in CI, e.g. GitHub Actions secrets)
ARG BACKEND_URL
ARG VITE_SUPABASE
ARG VITE_BACKEND_URL
ARG VITE_CLIENTID

ENV BACKEND_URL=${BACKEND_URL}
ENV VITE_SUPABASE=${VITE_SUPABASE}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_CLIENTID=${VITE_CLIENTID}

# Build the Electron app (tsc → vite → electron-builder)
RUN npm run build

# Output is in ./release/ — extract as build artifact
# Example CI artifact config:
#   - uses: actions/upload-artifact@v4
#     with:
#       name: multimate-windows-installer
#       path: release/
