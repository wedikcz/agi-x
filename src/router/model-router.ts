/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Intelligent Model Router & Telemetry Hub
 */

import { ModelRouteDefinition, SystemMetrics } from '../types/agi';

export class ModelRouter {
  private routes: ModelRouteDefinition[] = [
    {
      id: 'route-gemini-argon',
      name: 'gemini-4-argon',
      provider: 'Gemini',
      latencyP95Ms: 1450,
      costPer1kTokens: 0.004,
      capabilities: ['reasoning', 'code', 'vision'],
      health: 'HEALTHY',
      activeUsageCount: 420,
    },
    {
      id: 'route-gemini-flash',
      name: 'gemini-3.8-flash',
      provider: 'Gemini',
      latencyP95Ms: 420,
      costPer1kTokens: 0.0003,
      capabilities: ['fast_eval', 'reasoning', 'vision', 'audio'],
      health: 'HEALTHY',
      activeUsageCount: 1850,
    },
    {
      id: 'route-vllm-local',
      name: 'vLLM-Llama-3.3-70B-Instruct',
      provider: 'vLLM (Local)',
      latencyP95Ms: 650,
      costPer1kTokens: 0.0001,
      capabilities: ['code', 'fast_eval'],
      health: 'HEALTHY',
      activeUsageCount: 3120,
    },
    {
      id: 'route-deterministic-kernel',
      name: 'Omega-Deterministic-Kernel-Fallback',
      provider: 'Mock Runtime',
      latencyP95Ms: 15,
      costPer1kTokens: 0.0,
      capabilities: ['fast_eval'],
      health: 'HEALTHY',
      activeUsageCount: 940,
    },
  ];

  private metrics: SystemMetrics = {
    totalTokensProcessed: 2845920,
    estimatedCostUsd: 4.82,
    averageLatencyMs: 385,
    cacheHitRatio: 0.42,
    activeLangGraphNodes: 11,
    governanceAuditsPassed: 1420,
    activeThreatBlocks: 26,
    uptimeSeconds: 84920,
  };

  public getRoutes(): ModelRouteDefinition[] {
    return [...this.routes];
  }

  public getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  /**
   * Selects optimal model route based on required capability and strict latency SLA
   */
  public selectRoute(task: {
    type: 'reasoning' | 'code' | 'vision' | 'audio' | 'fast_eval';
    maxLatencyMs?: number;
    preferLocal?: boolean;
  }): ModelRouteDefinition {
    if (task.preferLocal) {
      const local = this.routes.find((r) => r.provider === 'vLLM (Local)' && r.health === 'HEALTHY');
      if (local) return local;
    }

    if (task.type === 'reasoning' || task.type === 'code') {
      const argon = this.routes.find((r) => r.name === 'gemini-4-argon' && r.health === 'HEALTHY');
      if (argon && (!task.maxLatencyMs || argon.latencyP95Ms <= task.maxLatencyMs)) {
        return argon;
      }
    }

    // Default fast & cost-efficient model
    const flash = this.routes.find((r) => r.name === 'gemini-3.8-flash' && r.health === 'HEALTHY');
    if (flash) return flash;

    // Fallback
    return this.routes[this.routes.length - 1];
  }

  public recordUsage(routeId: string, tokens: number, latencyMs: number): void {
    const route = this.routes.find((r) => r.id === routeId);
    if (route) {
      route.activeUsageCount += 1;
      this.metrics.totalTokensProcessed += tokens;
      this.metrics.estimatedCostUsd += (tokens / 1000) * route.costPer1kTokens;
      this.metrics.averageLatencyMs = Math.round((this.metrics.averageLatencyMs * 0.95) + (latencyMs * 0.05));
    }
  }

  public toggleRouteHealth(routeId: string): void {
    const route = this.routes.find((r) => r.id === routeId);
    if (route) {
      route.health = route.health === 'HEALTHY' ? 'DEGRADED' : 'HEALTHY';
    }
  }
}
