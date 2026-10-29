/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | World Model Graph & Cypher Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldModelGraph } from '../world-model/graph';

test('World Graph: Entity and Relationship CRUD', () => {
  const graph = new WorldModelGraph();
  const initialEntities = graph.getAllEntities().length;
  const initialRelations = graph.getAllRelations().length;

  // Add new entity
  const newCap = graph.addEntity({
    type: 'Capability',
    name: 'Quantum-Resistant Signing',
    description: 'Post-quantum Kyber/Dilithium signature scheme for immutable audit ledger.',
    confidence: 0.99,
    attributes: { algorithm: 'CRYSTALS-Dilithium', keySize: 256 },
  });

  assert.ok(newCap.id);
  assert.equal(graph.getAllEntities().length, initialEntities + 1);

  // Add new relation
  const newRel = graph.addRelation({
    sourceId: 'ent-proj-01',
    targetId: newCap.id,
    type: 'requires',
    weight: 0.95,
    provenance: 'Future Roadmap Specification v9.0',
  });

  assert.ok(newRel.id);
  assert.equal(graph.getAllRelations().length, initialRelations + 1);
});

test('World Graph: Cycle Detection on Artificial Loop', () => {
  const graph = new WorldModelGraph();
  
  // Baseline is acyclic
  assert.equal(graph.detectCycles().hasCycle, false);

  // Inject a circular dependency: A requires B, B requires C, C requires A
  const nodeA = graph.addEntity({ type: 'Task', name: 'Task Alpha', description: '', confidence: 1, attributes: {} });
  const nodeB = graph.addEntity({ type: 'Task', name: 'Task Beta', description: '', confidence: 1, attributes: {} });
  const nodeC = graph.addEntity({ type: 'Task', name: 'Task Gamma', description: '', confidence: 1, attributes: {} });

  graph.addRelation({ sourceId: nodeA.id, targetId: nodeB.id, type: 'requires', weight: 1, provenance: 'test' });
  graph.addRelation({ sourceId: nodeB.id, targetId: nodeC.id, type: 'requires', weight: 1, provenance: 'test' });
  graph.addRelation({ sourceId: nodeC.id, targetId: nodeA.id, type: 'requires', weight: 1, provenance: 'test' });

  const cycleResult = graph.detectCycles();
  assert.equal(cycleResult.hasCycle, true);
  assert.ok(Array.isArray(cycleResult.cyclePath));
  assert.ok((cycleResult.cyclePath?.length ?? 0) >= 1);
});

test('World Graph: Multi-Hop Blast Radius Traversal', () => {
  const graph = new WorldModelGraph();
  
  // Traverse from PavelAGI-X Omega Project root
  const impact = graph.analyzeImpact('ent-proj-01');
  assert.ok(impact.impactedEntities.length >= 3);
  assert.ok(impact.propagationPath.length >= 3);

  // Verify that downstream dependencies (e.g. Technology, Capability) are found in traversal
  const foundTech = impact.impactedEntities.some((e) => e.type === 'Technology');
  assert.equal(foundTech, true);
});

test('World Graph: OpenCypher Pattern Matching', () => {
  const graph = new WorldModelGraph();

  // Pattern query
  const res1 = graph.executeCypher('MATCH (n:Person)');
  assert.ok(res1.matchedNodes.length >= 1);
  assert.ok(res1.matchedNodes.some((n) => n.name.includes('Pavel')));

  // Relationship query
  const res2 = graph.executeCypher('MATCH (r:Risk)-[:blocks]->(g:Goal)');
  assert.ok(res2.executionTimeMs >= 0);
});
