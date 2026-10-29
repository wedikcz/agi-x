/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | LangGraph Audit Trail, Self-Thinking & Multitasking Tests
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LangGraphEngine } from '../langgraph/engine';

test('LangGraph Event Log: Captures High-Fidelity Audit Trails and Provenance', () => {
  const engine = new LangGraphEngine();
  engine.startMission('Autonomous OpenShift Cluster Deployment');

  const history = engine.getStepHistory();
  assert.equal(history.length >= 1, true, 'Initial mission bootstrap step must be recorded in history');

  const bootstrapStep = history[0];
  assert.equal(bootstrapStep.status, 'PASS');
  assert.ok(bootstrapStep.decisionRationale, 'Decision rationale must be populated');
  assert.ok(bootstrapStep.selfThinking, 'Self-thinking deliberation must be present');
  assert.ok(bootstrapStep.selfThinking.innerMonologue.length > 0, 'Inner monologue must not be empty');
  assert.ok(bootstrapStep.selfThinking.hypotheses.length >= 1, 'Hypotheses must be considered');
  assert.ok(bootstrapStep.selfThinking.confidenceScore >= 0.9, 'Confidence score must be high');
  assert.ok(bootstrapStep.provenance?.stateHash.startsWith('sha256:'), 'State hash must be a sha256 digest');
  assert.ok(bootstrapStep.toolCalls && bootstrapStep.toolCalls.length > 0, 'Tool calls must be recorded');
  assert.equal(bootstrapStep.toolCalls[0].toolName, 'create_dag');
  assert.equal(bootstrapStep.toolCalls[0].status, 'SUCCESS');
});

test('LangGraph Multitasking: Supports Swarm Concurrency and Mode Toggling', () => {
  const engine = new LangGraphEngine();
  engine.startMission('Verify Swarm Concurrency');

  const state = engine.getState();
  assert.equal(state.executionMode, 'MULTITASKING_SWARM');
  assert.ok(state.activeLanes && state.activeLanes.length === 4, '4 parallel multitasking lanes must be initialized');
  assert.ok((state.parallelSpeedupRatio || 0) > 2.0, 'Parallel speedup ratio must exceed 2.0x');

  const toggled = engine.toggleExecutionMode();
  assert.equal(toggled, 'SEQUENTIAL');
  assert.equal(engine.getState().executionMode, 'SEQUENTIAL');

  const toggledBack = engine.toggleExecutionMode();
  assert.equal(toggledBack, 'MULTITASKING_SWARM');
});

test('LangGraph Human Interrupt: Enforces Constitutional Safety & Provenance on Halt/Approve', () => {
  const engine = new LangGraphEngine();
  engine.startMission('Privileged Gate Test');

  // Step through until interrupt
  let interruptTriggered = false;
  for (let i = 0; i < 8; i++) {
    const result = engine.executeNextStep();
    if (result.interrupted) {
      interruptTriggered = true;
      break;
    }
  }

  assert.equal(interruptTriggered, true, 'Security task must trigger human interrupt');
  const currentState = engine.getState();
  assert.equal(currentState.status, 'INTERRUPTED');

  // Verify interrupt event is captured in stepHistory with status INTERRUPT
  const history = engine.getStepHistory();
  const interruptEvent = history.find((e) => e.status === 'INTERRUPT');
  assert.ok(interruptEvent, 'Interrupt event must exist in stepHistory');
  assert.equal(interruptEvent.agent, 'Security');
  assert.equal(interruptEvent.securityClearanceChecked, 'SOVEREIGN_HUMAN');
  assert.ok(interruptEvent.toolCalls?.some((t) => t.toolName === 'trigger_security_interrupt'));

  // Approve interrupt and verify resume
  const approved = engine.approveInterrupt(true, 'Cryptographic operator seal verified');
  assert.equal(approved, true);
  assert.equal(engine.getState().status, 'EXECUTING');

  const latestEvent = engine.getStepHistory().slice(-1)[0];
  assert.equal(latestEvent.agent, 'Governor');
  assert.equal(latestEvent.status, 'PASS');
  assert.ok(latestEvent.toolCalls?.some((t) => t.toolName === 'verify_signature'));
});
