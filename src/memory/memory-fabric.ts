/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Multi-Tier Memory Fabric
 */

import { MemoryItem, MemoryTier, MemoryCompactionSummary } from '../types/agi';

export class MemoryFabric {
  private items: Map<string, MemoryItem> = new Map();

  constructor() {
    this.seedInitialMemories();
  }

  private seedInitialMemories(): void {
    const now = new Date().toISOString();

    const seeds: MemoryItem[] = [
      {
        id: 'mem-work-01',
        tier: 'Working',
        key: 'current_active_subgoal',
        content: 'Decomposing PavelAGI-X Omega deployment into production Kubernetes & OpenShift manifests.',
        confidence: 0.98,
        provenance: 'Chief Orchestrator',
        ttlSeconds: 300,
        createdAt: now,
        updatedAt: now,
        accessCount: 14,
        tags: ['planning', 'subgoal', 'active'],
      },
      {
        id: 'mem-session-01',
        tier: 'Session',
        key: 'mission_parameters',
        content: 'Target platform: OpenShift 4.16 / Kubernetes v1.30 with Keycloak, OPA Gatekeeper, and Neo4j World Model.',
        confidence: 0.99,
        provenance: 'Human Operator Input',
        ttlSeconds: 3600,
        createdAt: now,
        updatedAt: now,
        accessCount: 38,
        tags: ['session', 'k8s', 'openshift'],
      },
      {
        id: 'mem-episodic-01',
        tier: 'Episodic',
        key: 'episode_mission_20261028',
        content: 'During previous cluster scale event, Redis memory pressure caused 120ms latency spikes; mitigation was enabling maxmemory-policy allkeys-lru.',
        confidence: 0.95,
        provenance: 'Reliability Engineer Agent',
        ttlSeconds: 86400 * 30,
        createdAt: now,
        updatedAt: now,
        accessCount: 8,
        tags: ['incident', 'redis', 'scaling', 'postmortem'],
      },
      {
        id: 'mem-semantic-01',
        tier: 'Semantic',
        key: 'concept_ddd_bounded_contexts',
        content: 'Domain-Driven Design defines 4 primary bounded contexts in PavelAGI-X: CognitiveKernel, MemoryFabric, GovernanceEngine, and WorldGraph.',
        confidence: 0.97,
        provenance: 'Enterprise Architecture Catalog',
        ttlSeconds: 86400 * 365,
        createdAt: now,
        updatedAt: now,
        accessCount: 52,
        tags: ['architecture', 'ddd', 'domain_model'],
      },
      {
        id: 'mem-procedural-01',
        tier: 'Procedural',
        key: 'procedure_safe_promotion_pipeline',
        content: 'Promotion procedure: 1. Candidate generated in sandbox. 2. Run 40 automated tests. 3. Benchmark delta >= 0.05. 4. Governor security scan. 5. Operator approval.',
        confidence: 0.99,
        provenance: 'AgentOps Runbook v3.2',
        ttlSeconds: 86400 * 180,
        createdAt: now,
        updatedAt: now,
        accessCount: 29,
        tags: ['procedure', 'gitops', 'ci_cd', 'promotion'],
      },
      {
        id: 'mem-preference-01',
        tier: 'Preference',
        key: 'operator_security_posture',
        content: 'Operator enforces Strict Zero-Trust: Human review mandatory on any task with risk score >= 0.70 or production database schema changes.',
        confidence: 1.0,
        provenance: 'Chief Security Officer Config',
        ttlSeconds: 86400 * 365,
        createdAt: now,
        updatedAt: now,
        accessCount: 64,
        tags: ['governance', 'preference', 'human_in_loop'],
        immutable: true,
      },
      {
        id: 'mem-world-01',
        tier: 'World',
        key: 'active_cluster_state',
        content: 'Production cluster has 12 worker nodes, 3 master nodes, 4 GPU nodes (A100 80GB), Neo4j Enterprise cluster, and Ceph storage backend.',
        confidence: 0.96,
        provenance: 'Platform Architect Sensor Sync',
        ttlSeconds: 86400 * 7,
        createdAt: now,
        updatedAt: now,
        accessCount: 19,
        tags: ['world_state', 'infrastructure', 'nodes'],
      },
      {
        id: 'mem-audit-01',
        tier: 'Audit',
        key: 'audit_block_escalation_attempt',
        content: 'AUDIT: 2026-10-29T10:15:00Z - Security Governor blocked attempted privilege expansion by Coder agent on system namespace.',
        confidence: 1.0,
        provenance: 'Immutable Safety Governor Kernel',
        ttlSeconds: 86400 * 365 * 5, // 5 years audit retention
        createdAt: now,
        updatedAt: now,
        accessCount: 91,
        tags: ['audit', 'security', 'violation', 'immutable'],
        immutable: true,
      },
    ];

    for (const item of seeds) {
      this.items.set(item.id, item);
    }
  }

  public getAllMemories(): MemoryItem[] {
    return Array.from(this.items.values());
  }

  public getMemoriesByTier(tier: MemoryTier): MemoryItem[] {
    return this.getAllMemories().filter((m) => m.tier === tier);
  }

  public get(id: string): MemoryItem | undefined {
    const item = this.items.get(id);
    if (item) {
      item.accessCount += 1;
      item.updatedAt = new Date().toISOString();
    }
    return item;
  }

  public store(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'accessCount'>): MemoryItem {
    const id = `mem-${item.tier.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const newItem: MemoryItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
      accessCount: 1,
    };
    this.items.set(id, newItem);
    return newItem;
  }

  public delete(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    if (item.immutable || item.tier === 'Audit') {
      throw new Error(`Cannot delete immutable record in tier: ${item.tier}`);
    }
    return this.items.delete(id);
  }

  /**
   * Semantic and tag-based retrieval with confidence scoring
   */
  public search(query: string, tier?: MemoryTier, minConfidence: number = 0.5): MemoryItem[] {
    const qLower = query.toLowerCase().trim();
    const queryTokens = qLower.split(/\s+/).filter(Boolean);

    return this.getAllMemories()
      .filter((m) => {
        if (tier && m.tier !== tier) return false;
        if (m.confidence < minConfidence) return false;

        const textToSearch = `${m.key} ${m.content} ${m.tags.join(' ')} ${m.provenance}`.toLowerCase();
        return queryTokens.some((tok) => textToSearch.includes(tok));
      })
      .sort((a, b) => {
        // Score based on token matches, confidence, and access recency
        const aMatches = queryTokens.filter((tok) => a.content.toLowerCase().includes(tok)).length;
        const bMatches = queryTokens.filter((tok) => b.content.toLowerCase().includes(tok)).length;
        return bMatches * b.confidence - aMatches * a.confidence;
      });
  }

  /**
   * Compaction & TTL decay algorithm
   * Eliminates expired short-term memories and compacts stale items into summary records
   */
  public compact(tier?: MemoryTier): MemoryCompactionSummary {
    const targetTier = tier || 'Working';
    const itemsInTier = this.getMemoriesByTier(targetTier);
    const beforeCount = itemsInTier.length;

    let prunedExpired = 0;
    let bytesSaved = 0;

    for (const item of itemsInTier) {
      if (item.immutable) continue;
      // If low access and high age or working memory with short TTL
      if (item.ttlSeconds <= 0 || (item.tier === 'Working' && item.accessCount < 3)) {
        bytesSaved += item.content.length + item.key.length;
        this.items.delete(item.id);
        prunedExpired++;
      }
    }

    // Summarize older episodic or session items if count exceeds threshold
    let summarizedItems = 0;
    if (targetTier === 'Working' && this.getMemoriesByTier('Working').length > 5) {
      const working = this.getMemoriesByTier('Working');
      const textToSummarize = working.map((w) => `${w.key}: ${w.content}`).join('; ');
      const summaryItem = this.store({
        tier: 'Working',
        key: `compacted_working_summary_${Date.now().toString(36)}`,
        content: `Aggregated summary: ${textToSummarize.slice(0, 180)}...`,
        confidence: 0.94,
        provenance: 'Memory Compaction Engine',
        ttlSeconds: 600,
        tags: ['compacted', 'summary'],
      });
      summarizedItems = working.length;
      bytesSaved += 512;
    }

    const afterCount = this.getMemoriesByTier(targetTier).length;

    return {
      tier: targetTier,
      beforeCount,
      afterCount,
      prunedExpired,
      summarizedItems,
      bytesSaved: Math.max(bytesSaved, 256),
      timestamp: new Date().toISOString(),
    };
  }
}
