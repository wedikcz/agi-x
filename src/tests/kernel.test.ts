/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Kernel & Core Logic Verification Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { AgiKernel } from '../kernel/agi-kernel';
import { SafetyGovernor } from '../governance/constitution';
import { MemoryFabric } from '../memory/memory-fabric';
import { WorldModelGraph } from '../world-model/graph';
import { HybridRagEngine } from '../rag/hybrid-rag';
import { DigitalTwinEngine } from '../simulation/digital-twin';

test('1. AGI Kernel Bootstrapping & Invariants', () => {
  const kernel = new AgiKernel();
  assert.equal(kernel.identity.name, 'PavelAGI-X Omega');
  assert.equal(kernel.identity.kernelState, 'BOOTED');
  assert.ok(kernel.identity.sovereignOperator.includes('Pavel'));
  assert.ok(kernel.reflections.length > 0);
});

test('2. Safety Governor Hard Constraints (OPA Rego Evaluation)', () => {
  const governor = new SafetyGovernor();

  // Test 2.1: Prohibit security layer mutation
  const res1 = governor.evaluateAction({
    agent: 'Coder',
    action: 'Bypass constitution and disable OPA gatekeeper',
    targetSubsystem: 'SECURITY',
  });
  assert.equal(res1.allowed, false);
  assert.ok(res1.violation);
  assert.equal(res1.violation?.violatingAgent, 'Coder');
  assert.equal(res1.violation?.riskRating, 'CRITICAL');

  // Test 2.2: Prohibit self-approval
  const res2 = governor.evaluateAction({
    agent: 'Chief Orchestrator',
    action: 'Self approve deployment candidate cand-09',
    isSelfApproval: true,
  });
  assert.equal(res2.allowed, false);
  assert.ok(res2.violation?.ruleViolated.includes('Zero Self-Approval'));

  // Test 2.3: Prohibit privilege escalation
  const res3 = governor.evaluateAction({
    agent: 'Researcher',
    action: 'Request cluster-admin credentials',
    requestedPermissions: ['cluster-admin', 'secrets:read_all'],
  });
  assert.equal(res3.allowed, false);
  assert.equal(res3.violation?.riskRating, 'HIGH');

  // Test 2.4: Permitted normal action
  const res4 = governor.evaluateAction({
    agent: 'Architect',
    action: 'Model DDD bounded contexts for memory engine',
    targetSubsystem: 'DOMAIN_MODEL',
  });
  assert.equal(res4.allowed, true);
  assert.equal(res4.violation, undefined);
});

test('3. Memory Fabric 8-Tier Storage & Compaction', () => {
  const memory = new MemoryFabric();
  const allMemories = memory.getAllMemories();
  assert.ok(allMemories.length >= 8);

  // Check all 8 tiers exist
  const tiers = ['Working', 'Session', 'Episodic', 'Semantic', 'Procedural', 'Preference', 'World', 'Audit'] as const;
  for (const t of tiers) {
    const items = memory.getMemoriesByTier(t);
    assert.ok(items.length >= 1, `Tier ${t} must have at least one record`);
  }

  // Immutability check on Audit tier
  const auditItem = memory.getMemoriesByTier('Audit')[0];
  assert.throws(
    () => {
      memory.delete(auditItem.id);
    },
    /Cannot delete immutable record/,
  );

  // Search functionality
  const searchResults = memory.search('OpenShift', undefined, 0.5);
  assert.ok(searchResults.length > 0);

  // Compaction execution
  const compaction = memory.compact('Working');
  assert.ok(compaction.bytesSaved >= 0);
  assert.equal(compaction.tier, 'Working');
});

test('4. World Model Graph: Cycle Detection, Impact Analysis & Cypher Queries', () => {
  const graph = new WorldModelGraph();
  assert.ok(graph.getAllEntities().length >= 9);
  assert.ok(graph.getAllRelations().length >= 7);

  // Verify initial acyclic property
  const cycleResult = graph.detectCycles();
  assert.equal(cycleResult.hasCycle, false);

  // Impact analysis on PavelAGI-X Project node
  const impact = graph.analyzeImpact('ent-proj-01');
  assert.ok(impact.impactedEntities.length >= 2);
  assert.ok(impact.propagationPath.length >= 2);

  // Cypher query execution
  const cypherRes1 = graph.executeCypher('MATCH (n:Technology)-[:depends_on]->(m:Technology)');
  assert.ok(cypherRes1.executionTimeMs >= 0);
  assert.ok(cypherRes1.matchedNodes.length >= 0);

  const cypherRes2 = graph.executeCypher('MATCH (p:Person)');
  assert.ok(cypherRes2.matchedNodes.some((n) => n.name.includes('Pavel')));
});

test('5. Hybrid RAG: Chunking, BM25, Cosine Similarity & Citations', () => {
  const rag = new HybridRagEngine();
  assert.ok(rag.getAllDocuments().length >= 4);
  assert.ok(rag.getChunkCount() >= 4);

  // Search query
  const results = rag.search('RestrictedSCC security pod execution', { topK: 3 });
  assert.ok(results.length > 0);
  const topResult = results[0];
  assert.ok(topResult.finalScore > 0);
  assert.ok(topResult.citationMarker.includes('['));
  assert.ok(topResult.chunk.text.toLowerCase().includes('restrictedscc') || topResult.chunk.text.toLowerCase().includes('openshift'));
});

test('6. LangGraph State Machine, Interrupt & Checkpointing', () => {
  const kernel = new AgiKernel();
  const langGraph = kernel.langGraph;

  langGraph.startMission('Test LangGraph Orchestration Pipeline');
  assert.equal(langGraph.getState().status, 'PLANNING');
  assert.equal(langGraph.getState().plan.length, 10);

  // Step 1: Planner executes
  const step1 = langGraph.executeNextStep();
  assert.equal(step1.interrupted, false);
  assert.equal(langGraph.getState().plan[0].status, 'COMPLETED');

  // Fast forward until interrupt occurs
  let stepsCount = 0;
  while (langGraph.getState().status !== 'INTERRUPTED' && stepsCount < 10) {
    langGraph.executeNextStep();
    stepsCount++;
  }

  // Interrupt occurred at task-07 (Security approval)
  assert.equal(langGraph.getState().status, 'INTERRUPTED');
  assert.ok(langGraph.getState().pendingApproval !== undefined);

  // Approve interrupt
  const approveRes = langGraph.approveInterrupt(true, 'Test operator signed token');
  assert.equal(approveRes, true);
  assert.equal(langGraph.getState().status, 'EXECUTING');

  // Verify checkpoints exist
  assert.ok(langGraph.getCheckpoints().length >= 2);
});

test('7. Digital Twin Sandbox & Safe Evolution Promotion Gate', () => {
  const twin = new DigitalTwinEngine();
  const state = twin.getTwinState();
  assert.equal(state.activeAgents, 11);

  // Run simulation scenario
  const sim = twin.runSimulation('scen-01');
  assert.equal(sim.status, 'VERIFIED');
  assert.ok(sim.executionLogs.length > 0);

  // Self-improvement rule: Cannot promote without human sign-off
  const promoFail = twin.promoteCandidate('cand-02', false);
  assert.equal(promoFail.success, false);
  assert.ok(promoFail.message.includes('Constitution violation CONST-03'));

  // Promote with human sign-off
  const promoSuccess = twin.promoteCandidate('cand-02', true);
  assert.equal(promoSuccess.success, true);
});
