/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Parallel State Tracks & Cognitive Reflection Unit Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LangGraphEngine } from '../langgraph/engine';
import { AgiKernel } from '../kernel/agi-kernel';
import { CognitiveReflectionLayer } from '../kernel/cognitive-reflection';

describe('LangGraphEngine - Parallel State Tracks & Multi-Thread Concurrency', () => {
  it('should initialize mission with parallel state tracks and lanes', () => {
    const engine = new LangGraphEngine();
    const tracks = engine.getParallelTracks();

    assert.ok(Array.isArray(tracks), 'Parallel tracks must be an array');
    assert.ok(tracks.length >= 4, `Expected at least 4 parallel tracks, found ${tracks.length}`);

    const plannerTrack = tracks.find((t) => t.agent === 'Planner');
    assert.ok(plannerTrack, 'Planner track must exist');
    assert.equal(plannerTrack.status, 'EXECUTING');

    const coderTrack = tracks.find((t) => t.agent === 'Coder');
    assert.ok(coderTrack, 'Coder track must exist');
    assert.equal(coderTrack.status, 'WAITING_BARRIER');
    assert.ok(coderTrack.barrierCondition, 'Coder track must have barrier condition');
  });

  it('should step an individual parallel track independently and advance its progress', () => {
    const engine = new LangGraphEngine();
    const plannerTrack = engine.getParallelTracks().find((t) => t.agent === 'Planner')!;
    const initialProgress = plannerTrack.progress;

    const result = engine.stepParallelTrack(plannerTrack.id);
    assert.equal(result.stepPassed, true);
    assert.ok(plannerTrack.progress > initialProgress, 'Track progress must have increased');
    assert.ok(plannerTrack.threadEvents.length > 0, 'Track must record its own thread events');
  });

  it('should respect barrier synchronization conditions and unlock when dependency completes', () => {
    const engine = new LangGraphEngine();
    const tracks = engine.getParallelTracks();
    const coderTrack = tracks.find((t) => t.agent === 'Coder')!;
    const plannerTrack = tracks.find((t) => t.agent === 'Planner')!;

    // Stepping coder before barrier satisfied should not execute subtask
    const attempt = engine.stepParallelTrack(coderTrack.id);
    assert.equal(attempt.stepPassed, false);
    assert.match(attempt.summary, /waiting on barrier/i);

    // Complete planner track
    plannerTrack.progress = 100;
    plannerTrack.status = 'COMPLETED';

    // Next step of coder track should now satisfy barrier and execute
    const unblockedAttempt = engine.stepParallelTrack(coderTrack.id);
    assert.equal(unblockedAttempt.stepPassed, true);
    assert.equal(coderTrack.status, 'EXECUTING');
    assert.equal(coderTrack.barrierCondition?.satisfied, true);
  });

  it('should execute a synchronized wave across all running tracks simultaneously', () => {
    const engine = new LangGraphEngine();
    const waveRes = engine.stepAllActiveTracks();

    assert.ok(waveRes.steppedCount >= 2, `Expected at least 2 active tracks to step, got ${waveRes.steppedCount}`);
    assert.ok(waveRes.speedup >= 2.0, `Speedup must reflect parallel concurrency (got ${waveRes.speedup})`);
    assert.ok(waveRes.summaries.length > 0, 'Summaries must be returned for stepped tracks');
  });

  it('should dynamically fork a child state track and save per-track checkpoints', () => {
    const engine = new LangGraphEngine();
    const initialCount = engine.getParallelTracks().length;

    const forked = engine.forkTrack('track-planner-01', {
      name: 'Speculative Testing Branch',
      agent: 'Evaluator',
      taskIds: ['task-09'],
    });

    assert.ok(forked.id.startsWith('track-evaluator'), 'Forked track id must match agent');
    assert.equal(engine.getParallelTracks().length, initialCount + 1);

    // Test per-track checkpointing
    const ckpt = engine.saveTrackCheckpoint(forked.id);
    assert.ok(ckpt.startsWith('ckpt-track-'), 'Checkpoint id must be generated');

    forked.progress = 75;
    const restored = engine.rollbackTrackToCheckpoint(forked.id, ckpt);
    assert.equal(restored, true);
    const restoredTrack = engine.getParallelTracks().find((t) => t.id === forked.id)!;
    assert.equal(restoredTrack.progress, 0, 'Track progress must be rewound to checkpoint value');
  });
});

describe('CognitiveReflectionLayer & Thought Stream', () => {
  it('should seed initial reflections and generate model-based evaluations', () => {
    const reflectionLayer = new CognitiveReflectionLayer();
    const initialStream = reflectionLayer.getThoughtStream();

    assert.ok(initialStream.length >= 4, 'Initial thought stream must be seeded');
    assert.ok(initialStream.some((t) => t.reflectionType === 'PLAN_OPTIMIZATION'));
    assert.ok(initialStream.some((t) => t.reflectionType === 'DEADLOCK_PREVENTION'));

    const engine = new LangGraphEngine();
    const newThought = reflectionLayer.evaluateOngoingExecution(engine.getState());

    assert.ok(newThought.id.startsWith('ts-'));
    assert.ok(newThought.critique.length > 0);
    assert.ok(newThought.proposedOptimization.length > 0);
    assert.equal(newThought.status, 'PROPOSED');
  });

  it('should apply plan optimization mutation to the state machine', () => {
    const kernel = new AgiKernel();
    const initialThoughts = kernel.getThoughtStream();
    const proposed = initialThoughts.find((t) => t.status === 'PROPOSED');

    assert.ok(proposed, 'There must be a PROPOSED thought item');
    const res = kernel.applyThoughtOptimization(proposed.id);

    assert.equal(res.success, true);
    assert.ok(res.mutationDescription.length > 0);

    const updatedStream = kernel.getThoughtStream();
    const updated = updatedStream.find((t) => t.id === proposed.id)!;
    assert.equal(updated.status, 'APPLIED');
  });

  it('should reject a proposed optimization cleanly', () => {
    const kernel = new AgiKernel();
    const newThought = kernel.triggerModelSelfEvaluation();

    assert.equal(newThought.status, 'PROPOSED');
    const rejected = kernel.rejectThoughtOptimization(newThought.id, 'Test rejection reason');

    assert.equal(rejected, true);
    const updated = kernel.getThoughtStream().find((t) => t.id === newThought.id)!;
    assert.equal(updated.status, 'REJECTED');
  });
});
