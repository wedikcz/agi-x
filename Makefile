# ==========================================
# PavelAGI-X Omega | Production Makefile
# ==========================================

SHELL := /bin/bash
IMAGE_NAME := quay.io/pavelagi/omega-kernel
TAG := v1.0.0

.PHONY: all help install dev build test lint verify docker-build seed benchmark clean

all: verify

help:
	@echo "PavelAGI-X Omega Developer Commands:"
	@echo "  make install       - Install npm dependencies via npm ci"
	@echo "  make dev           - Start full-stack development server on :3000"
	@echo "  make build         - Compile client bundle & production assets"
	@echo "  make test          - Execute automated Node test suite"
	@echo "  make lint          - Run TypeScript static type checker"
	@echo "  make verify        - Run complete CI verification battery"
	@echo "  make docker-build  - Build multi-stage distroless container image"
	@echo "  make seed          - Seed sample memory and world graph entities"
	@echo "  make benchmark     - Run latency and RAG retrieval benchmark suite"
	@echo "  make clean         - Remove build artifacts and temporary caches"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

lint:
	npm run lint

verify: lint test build
	@echo "==> All verification gates PASSED cleanly."

docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) -t $(IMAGE_NAME):latest .

seed:
	@bash scripts/seed-data.sh

benchmark:
	@bash scripts/benchmark.sh

clean:
	npm run clean
	rm -rf .playwright-cli
