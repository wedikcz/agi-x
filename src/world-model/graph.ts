/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | World Model Entity-Relation Graph Engine
 */

import { WorldEntity, WorldRelation, WorldEntityType, WorldRelationType, CypherQueryResult } from '../types/agi';

export class WorldModelGraph {
  private entities: Map<string, WorldEntity> = new Map();
  private relations: Map<string, WorldRelation> = new Map();

  constructor() {
    this.seedEcosystemGraph();
  }

  private seedEcosystemGraph(): void {
    const rawEntities: WorldEntity[] = [
      {
        id: 'ent-p-01',
        type: 'Person',
        name: 'Pavel (Human Principal)',
        description: 'Lead Human Architect & Sovereign Governance Authority for PavelAGI-X Omega.',
        confidence: 1.0,
        attributes: { role: 'Principal Architect', clearance: 'L5_SOVEREIGN' },
        x: 100,
        y: 120,
      },
      {
        id: 'ent-ag-01',
        type: 'Agent',
        name: 'Chief Orchestrator',
        description: 'Master LangGraph supervisor responsible for mission decomposition and task routing.',
        confidence: 0.99,
        attributes: { model: 'gemini-4-argon', status: 'ACTIVE' },
        x: 340,
        y: 120,
      },
      {
        id: 'ent-ag-02',
        type: 'Agent',
        name: 'Governor & Security Guard',
        description: 'Constitutional enforcement agent with hard constraint invariant verification.',
        confidence: 1.0,
        attributes: { model: 'gemini-3.8-flash', policyEngine: 'OPA_GATEKEEPER' },
        x: 340,
        y: 280,
      },
      {
        id: 'ent-proj-01',
        type: 'Project',
        name: 'PavelAGI-X Omega Platform',
        description: 'Production-ready cognitive operating system and autonomous proto-AGI runtime.',
        confidence: 0.98,
        attributes: { version: '1.0.0-PROD', maturity: 'PROTO_AGI' },
        x: 580,
        y: 120,
      },
      {
        id: 'ent-goal-01',
        type: 'Goal',
        name: 'Autonomous Mission Execution',
        description: 'Achieve zero-drift deterministic problem solving under strict human governance.',
        confidence: 0.97,
        attributes: { priority: 'P0_CRITICAL', targetSlaMs: 2500 },
        x: 820,
        y: 120,
      },
      {
        id: 'ent-cap-01',
        type: 'Capability',
        name: 'Multi-Tier Memory Retrieval',
        description: 'Sub-15ms semantic and episodic recall across 8 distinct temporal memory tiers.',
        confidence: 0.95,
        attributes: { p99LatencyMs: 14, vectorDim: 384 },
        x: 580,
        y: 280,
      },
      {
        id: 'ent-tech-01',
        type: 'Technology',
        name: 'Red Hat OpenShift & K8s',
        description: 'Enterprise container orchestration platform with GitOps and SELinux isolation.',
        confidence: 0.99,
        attributes: { runtime: 'CRI-O', securityContext: 'RestrictedSCC' },
        x: 820,
        y: 280,
      },
      {
        id: 'ent-tech-02',
        type: 'Technology',
        name: 'Neo4j Graph & pgvector',
        description: 'High-performance property graph database paired with relational vector storage.',
        confidence: 0.98,
        attributes: { cypherSupport: true, pgvectorVersion: '0.7.0' },
        x: 820,
        y: 440,
      },
      {
        id: 'ent-task-01',
        type: 'Task',
        name: 'Synthesize Production Manifests',
        description: 'Generate complete K8s Helm charts, OpenShift templates, and ArgoCD applications.',
        confidence: 0.96,
        attributes: { complexity: 'HIGH', stage: 'CI_CD' },
        x: 340,
        y: 440,
      },
      {
        id: 'ent-doc-01',
        type: 'Document',
        name: 'ADR-001: LangGraph Runtime',
        description: 'Architectural Decision Record codifying state machines, checkpoints, and interrupts.',
        confidence: 1.0,
        attributes: { status: 'ACCEPTED', author: 'Principal AI Architect' },
        x: 100,
        y: 440,
      },
      {
        id: 'ent-risk-01',
        type: 'Risk',
        name: 'Autonomous Privilege Escalation',
        description: 'Risk of agent self-mutating security manifests or bypassing human approval gates.',
        confidence: 0.99,
        attributes: { severity: 'CRITICAL', mitigation: 'OPA_REGO_CONSTITUTION' },
        x: 580,
        y: 440,
      },
    ];

    for (const ent of rawEntities) {
      this.entities.set(ent.id, ent);
    }

    const rawRelations: WorldRelation[] = [
      {
        id: 'rel-01',
        sourceId: 'ent-p-01',
        targetId: 'ent-proj-01',
        type: 'owns',
        weight: 1.0,
        provenance: 'Corporate Governance Charter',
      },
      {
        id: 'rel-02',
        sourceId: 'ent-ag-01',
        targetId: 'ent-proj-01',
        type: 'supports',
        weight: 0.95,
        provenance: 'LangGraph Topology Registry',
      },
      {
        id: 'rel-03',
        sourceId: 'ent-ag-02',
        targetId: 'ent-risk-01',
        type: 'blocks',
        weight: 1.0,
        provenance: 'Immutable Constitution',
      },
      {
        id: 'rel-04',
        sourceId: 'ent-proj-01',
        targetId: 'ent-goal-01',
        type: 'creates',
        weight: 0.92,
        provenance: 'Strategic Roadmapping Engine',
      },
      {
        id: 'rel-05',
        sourceId: 'ent-proj-01',
        targetId: 'ent-cap-01',
        type: 'requires',
        weight: 0.98,
        provenance: 'System Requirements Specification',
      },
      {
        id: 'rel-06',
        sourceId: 'ent-cap-01',
        targetId: 'ent-tech-02',
        type: 'depends_on',
        weight: 0.99,
        provenance: 'Database Architecture Blueprint',
      },
      {
        id: 'rel-07',
        sourceId: 'ent-proj-01',
        targetId: 'ent-tech-01',
        type: 'depends_on',
        weight: 0.96,
        provenance: 'Red Hat Infrastructure Architecture',
      },
      {
        id: 'rel-08',
        sourceId: 'ent-task-01',
        targetId: 'ent-proj-01',
        type: 'affects',
        weight: 0.88,
        provenance: 'Task Tracker DAG',
      },
      {
        id: 'rel-09',
        sourceId: 'ent-doc-01',
        targetId: 'ent-ag-01',
        type: 'supports',
        weight: 0.94,
        provenance: 'Engineering Knowledge Base',
      },
      {
        id: 'rel-10',
        sourceId: 'ent-risk-01',
        targetId: 'ent-goal-01',
        type: 'affects',
        weight: 0.85,
        provenance: 'Threat Model Matrix',
      },
    ];

    for (const rel of rawRelations) {
      this.relations.set(rel.id, rel);
    }
  }

  public getAllEntities(): WorldEntity[] {
    return Array.from(this.entities.values());
  }

  public getAllRelations(): WorldRelation[] {
    return Array.from(this.relations.values());
  }

  public getEntity(id: string): WorldEntity | undefined {
    return this.entities.get(id);
  }

  public addEntity(entity: Omit<WorldEntity, 'id'> & { id?: string }): WorldEntity {
    const id = entity.id || `ent-${entity.type.toLowerCase().slice(0, 3)}-${Date.now().toString(36)}`;
    const newEnt: WorldEntity = {
      ...entity,
      id,
      x: entity.x ?? Math.floor(Math.random() * 600 + 100),
      y: entity.y ?? Math.floor(Math.random() * 400 + 100),
    };
    this.entities.set(id, newEnt);
    return newEnt;
  }

  public addRelation(rel: Omit<WorldRelation, 'id'> & { id?: string }): WorldRelation {
    const id = rel.id || `rel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newRel: WorldRelation = { ...rel, id };
    this.relations.set(id, newRel);
    return newRel;
  }

  /**
   * Impact Analysis: Traverse outgoing edges to discover affected downstream entities
   */
  public analyzeImpact(rootEntityId: string): {
    impactedEntities: WorldEntity[];
    propagationPath: { from: string; to: string; relation: WorldRelationType }[];
  } {
    const visited = new Set<string>();
    const impacted: WorldEntity[] = [];
    const path: { from: string; to: string; relation: WorldRelationType }[] = [];

    const queue: string[] = [rootEntityId];
    visited.add(rootEntityId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const outgoing = Array.from(this.relations.values()).filter((r) => r.sourceId === currentId);

      for (const rel of outgoing) {
        path.push({ from: rel.sourceId, to: rel.targetId, relation: rel.type });
        if (!visited.has(rel.targetId)) {
          visited.add(rel.targetId);
          const target = this.entities.get(rel.targetId);
          if (target) {
            impacted.push(target);
            queue.push(rel.targetId);
          }
        }
      }
    }

    return { impactedEntities: impacted, propagationPath: path };
  }

  /**
   * Dependency Cycle Detection
   */
  public detectCycles(): { hasCycle: boolean; cyclePath?: string[] } {
    const dependsOnEdges = Array.from(this.relations.values()).filter((r) => r.type === 'depends_on' || r.type === 'requires');
    const adj = new Map<string, string[]>();

    for (const edge of dependsOnEdges) {
      if (!adj.has(edge.sourceId)) adj.set(edge.sourceId, []);
      adj.get(edge.sourceId)!.push(edge.targetId);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycleNodes: string[] = [];

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);
      cycleNodes.push(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          cycleNodes.push(neighbor);
          return true;
        }
      }

      recStack.delete(node);
      cycleNodes.pop();
      return false;
    };

    for (const node of this.entities.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) {
          return { hasCycle: true, cyclePath: cycleNodes };
        }
      }
    }

    return { hasCycle: false };
  }

  /**
   * Evaluates OpenCypher Queries against the in-memory graph
   */
  public executeCypher(query: string): CypherQueryResult {
    const startTime = performance.now();
    const q = query.trim();

    let matchedNodes: WorldEntity[] = [];
    let matchedEdges: WorldRelation[] = [];
    let explanation = '';

    // Check for pattern: MATCH (n:Type) or MATCH (n:Type)-[:rel]->(m:Type)
    const matchRelRegex = /MATCH\s*\(([a-zA-Z0-9_]+):?([a-zA-Z0-9_]*)\)\s*-\[:?([a-zA-Z0-9_]*)\]->\s*\(([a-zA-Z0-9_]+):?([a-zA-Z0-9_]*)\)/i;
    const matchSingleRegex = /MATCH\s*\(([a-zA-Z0-9_]+):?([a-zA-Z0-9_]*)\)/i;

    const relMatch = q.match(matchRelRegex);
    if (relMatch) {
      const [, , sourceType, relType, , targetType] = relMatch;
      explanation = `Evaluating property graph pattern: (${sourceType || '*' })-[:${relType || '*'}]->(${targetType || '*'})`;

      for (const rel of this.relations.values()) {
        const source = this.entities.get(rel.sourceId);
        const target = this.entities.get(rel.targetId);

        if (!source || !target) continue;

        const sourceMatches = !sourceType || source.type.toLowerCase() === sourceType.toLowerCase();
        const relMatches = !relType || rel.type.toLowerCase() === relType.toLowerCase();
        const targetMatches = !targetType || target.type.toLowerCase() === targetType.toLowerCase();

        if (sourceMatches && relMatches && targetMatches) {
          if (!matchedNodes.find((n) => n.id === source.id)) matchedNodes.push(source);
          if (!matchedNodes.find((n) => n.id === target.id)) matchedNodes.push(target);
          matchedEdges.push(rel);
        }
      }
    } else {
      const singleMatch = q.match(matchSingleRegex);
      if (singleMatch) {
        const [, , entityType] = singleMatch;
        explanation = `Filtered nodes by entity label: ${entityType || 'ALL'}`;
        matchedNodes = Array.from(this.entities.values()).filter((e) =>
          !entityType || e.type.toLowerCase() === entityType.toLowerCase()
        );
        // Include edges between matched nodes
        const nodeIds = new Set(matchedNodes.map((n) => n.id));
        matchedEdges = Array.from(this.relations.values()).filter(
          (r) => nodeIds.has(r.sourceId) && nodeIds.has(r.targetId)
        );
      } else {
        // Fallback: return full graph
        explanation = 'Wildcard scan: returned active ecosystem topology.';
        matchedNodes = this.getAllEntities();
        matchedEdges = this.getAllRelations();
      }
    }

    const duration = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      query,
      matchedNodes,
      matchedEdges,
      executionTimeMs: duration,
      explanation: `${explanation}. Found ${matchedNodes.length} entities and ${matchedEdges.length} relationships in ${duration}ms.`,
    };
  }
}
