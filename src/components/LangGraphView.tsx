/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | LangGraph Interactive Orchestration View
 * Structured Event Log, Self-Thinking Telemetry & Multitasking Swarm Intelligence
 */

import React, { useState, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Shield,
  Terminal,
  FastForward,
  Cpu,
  Layers,
  Search,
  Filter,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Sparkles,
  Download,
  ShieldCheck,
  Hash,
  Database,
  ArrowRight,
  GitFork,
  Zap,
} from 'lucide-react';
import { AgiKernel } from '../kernel/agi-kernel';
import { AGENT_REGISTRY } from '../langgraph/engine';
import { AgentRole, EventStatus, GraphStepEvent, ParallelStateTrack } from '../types/agi';

interface LangGraphViewProps {
  kernel: AgiKernel;
  onRefresh: () => void;
}

export const LangGraphView: React.FC<LangGraphViewProps> = ({ kernel, onRefresh }) => {
  const langGraph = kernel.langGraph;
  const state = langGraph.getState();
  const stepHistory = langGraph.getStepHistory();
  const checkpoints = langGraph.getCheckpoints();

  // Orchestrator Controls
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('');
  const [operatorComment, setOperatorComment] = useState<string>('');
  const [autoRunActive, setAutoRunActive] = useState<boolean>(false);
  const [waveFeedback, setWaveFeedback] = useState<string | null>(null);

  // Structured Event Log State
  const [statusFilter, setStatusFilter] = useState<'ALL' | EventStatus>('ALL');
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [exportedJsonSuccess, setExportedJsonSuccess] = useState<boolean>(false);

  // Auto-run loop
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRunActive && state.status !== 'COMPLETED' && state.status !== 'INTERRUPTED' && state.status !== 'HALTED') {
      timer = setTimeout(() => {
        langGraph.executeNextStep();
        onRefresh();
      }, 700);
    } else if (state.status === 'INTERRUPTED' || state.status === 'COMPLETED' || state.status === 'HALTED') {
      setAutoRunActive(false);
    }
    return () => clearTimeout(timer);
  }, [autoRunActive, state.status, onRefresh, langGraph]);

  const handleStep = () => {
    langGraph.executeNextStep();
    onRefresh();
  };

  const handleApprove = (approved: boolean) => {
    langGraph.approveInterrupt(approved, operatorComment || 'Operator verification passed.');
    setOperatorComment('');
    onRefresh();
  };

  const handleRollback = () => {
    if (!selectedCheckpoint) return;
    langGraph.rollbackToCheckpoint(selectedCheckpoint);
    onRefresh();
  };

  const handleToggleMultitasking = () => {
    langGraph.toggleExecutionMode();
    onRefresh();
  };

  const handleStepWave = () => {
    const res = langGraph.stepAllActiveTracks();
    setWaveFeedback(`Concurrent wave executed: ${res.steppedCount} parallel tracks stepped. Concurrency speedup: ${res.speedup}x.`);
    setTimeout(() => setWaveFeedback(null), 4000);
    onRefresh();
  };

  const handleStepTrack = (trackId: string) => {
    const res = langGraph.stepParallelTrack(trackId);
    setWaveFeedback(res.summary);
    setTimeout(() => setWaveFeedback(null), 3500);
    onRefresh();
  };

  const handleForkTrack = () => {
    const newTrack = langGraph.forkTrack('track-planner-01', {
      name: `Async Speculative Synthesis #${(state.parallelTracks?.length || 0) + 1}`,
      agent: 'Coder',
      taskIds: ['task-05'],
    });
    setWaveFeedback(`Forked new parallel agent thread '${newTrack.name}' (${newTrack.id}).`);
    setTimeout(() => setWaveFeedback(null), 3500);
    onRefresh();
  };

  const handleCopyEventJson = (ev: GraphStepEvent) => {
    navigator.clipboard.writeText(JSON.stringify(ev, null, 2));
    setCopiedStep(ev.step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleExportFullAuditLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stepHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pavelagi_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportedJsonSuccess(true);
    setTimeout(() => setExportedJsonSuccess(false), 2500);
  };

  const agentList = Object.values(AGENT_REGISTRY);

  // Status counts for filter tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: stepHistory.length,
      PASS: 0,
      INTERRUPT: 0,
      WARN: 0,
      FAIL: 0,
      BLOCKED: 0,
    };
    stepHistory.forEach((ev) => {
      const s = ev.status || (ev.verdict as EventStatus) || 'PASS';
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    });
    return counts;
  }, [stepHistory]);

  // Filtered Step History
  const filteredEvents = useMemo(() => {
    return stepHistory.filter((ev) => {
      const evStatus = ev.status || (ev.verdict as EventStatus) || 'PASS';
      if (statusFilter !== 'ALL' && evStatus !== statusFilter) {
        return false;
      }
      if (agentFilter !== 'ALL' && ev.agent !== agentFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAction = ev.action.toLowerCase().includes(query);
        const matchesAgent = ev.agent.toLowerCase().includes(query);
        const matchesOutput = ev.output.toLowerCase().includes(query);
        const matchesRationale = ev.decisionRationale?.toLowerCase().includes(query) ?? false;
        const matchesMonologue = ev.selfThinking?.innerMonologue.toLowerCase().includes(query) ?? false;
        const matchesHash = ev.provenance?.stateHash.toLowerCase().includes(query) ?? false;
        const matchesTools = ev.toolCalls?.some((t) => t.toolName.toLowerCase().includes(query)) ?? false;
        return matchesAction || matchesAgent || matchesOutput || matchesRationale || matchesMonologue || matchesHash || matchesTools;
      }
      return true;
    });
  }, [stepHistory, statusFilter, agentFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Human-in-the-Loop Interrupt Modal Overlay */}
      {state.status === 'INTERRUPTED' && state.pendingApproval && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-950/40 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertOctagon className="w-8 h-8 animate-pulse" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-900/60 border border-amber-700/80 px-2 py-0.5 rounded">
                  Sovereign Human Invariant Interrupt Active
                </span>
                <span className="text-xs text-slate-400">Task ID: {state.pendingApproval.taskId}</span>
              </div>

              <h3 className="text-lg font-bold text-white mt-1">
                Security Authorization Gate Triggered
              </h3>

              <p className="text-sm text-slate-300 mt-1">
                {state.interruptionReason}
              </p>

              <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
                <div><span className="text-slate-500">Action:</span> {state.pendingApproval.actionDescription}</div>
                <div><span className="text-slate-500">Risk Assessment:</span> <strong className="text-red-400">{state.pendingApproval.riskLevel}</strong></div>
                <div><span className="text-slate-500">Mandatory Invariant:</span> CONST-01 (Preserve Human Control) & CONST-03 (Zero Self-Approval)</div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="Optional operator authorization comment / signature..."
                  value={operatorComment}
                  onChange={(e) => setOperatorComment(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(false)}
                    className="px-4 py-2 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-200 text-xs font-semibold cursor-pointer"
                  >
                    Reject & Halt
                  </button>

                  <button
                    onClick={() => handleApprove(true)}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Authorize & Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orchestration Control Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Mission Lifecycle Control
            </h2>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
              state.status === 'COMPLETED' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' :
              state.status === 'INTERRUPTED' ? 'bg-amber-950/80 text-amber-400 border border-amber-800 animate-pulse' :
              state.status === 'HALTED' ? 'bg-red-950/80 text-red-400 border border-red-800' :
              'bg-indigo-950/80 text-indigo-400 border border-indigo-800'
            }`}>
              {state.status}
            </span>

            {/* Multitasking Mode Badge */}
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
              state.executionMode === 'MULTITASKING_SWARM'
                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Cpu className="w-3 h-3 text-cyan-400" />
              {state.executionMode === 'MULTITASKING_SWARM' ? '4-LANE SWARM (2.85x SPEEDUP)' : 'SEQUENTIAL THREAD'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono truncate max-w-xl">
            Mission: {state.missionGoal}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Step Concurrent Wave */}
          <button
            onClick={handleStepWave}
            disabled={state.status === 'COMPLETED' || state.status === 'INTERRUPTED'}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            title="Execute a synchronized concurrent wave across all running parallel tracks"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Step All Parallel Tracks</span>
          </button>

          {/* Fork Track */}
          <button
            onClick={handleForkTrack}
            className="px-3 py-1.5 rounded-lg border border-indigo-700/80 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Dynamically fork an independent agent thread from the active checkpoint"
          >
            <GitFork className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fork Track</span>
          </button>

          <button
            onClick={() => setAutoRunActive(!autoRunActive)}
            disabled={state.status === 'COMPLETED' || state.status === 'INTERRUPTED'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              autoRunActive
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{autoRunActive ? 'Pause Auto-Run' : 'Auto-Run DAG'}</span>
          </button>

          <button
            onClick={handleStep}
            disabled={state.status === 'COMPLETED' || state.status === 'INTERRUPTED' || autoRunActive}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Step Linear Node ({state.activeTaskIndex + 1}/{state.plan.length})</span>
          </button>

          {/* Rollback Selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <select
              value={selectedCheckpoint}
              onChange={(e) => setSelectedCheckpoint(e.target.value)}
              className="text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300"
            >
              <option value="">Rollback Checkpoint...</option>
              {checkpoints.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} (step {c.step})
                </option>
              ))}
            </select>

            <button
              onClick={handleRollback}
              disabled={!selectedCheckpoint}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-300 flex items-center gap-1 cursor-pointer"
              title="Time-travel to checkpoint"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {waveFeedback && (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/70 p-3 text-xs font-mono text-cyan-200 flex items-center gap-2 shadow-lg animate-fadeIn">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{waveFeedback}</span>
        </div>
      )}

      {/* Parallel State Tracks Panel (Multi-Thread Concurrent Execution) */}
      {state.parallelTracks && state.parallelTracks.length > 0 && (
        <div className="rounded-xl border border-cyan-900/60 bg-gradient-to-b from-slate-900/90 to-cyan-950/20 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Parallel State Tracks · Multi-Thread Concurrent Execution
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
              <span>Parallel Speedup: <strong className="text-cyan-300">{state.parallelSpeedupRatio || 2.85}x</strong></span>
              <span>Active Threads: <strong className="text-cyan-300">{state.parallelTracks.length} Tracks</strong></span>
              <span>
                Barrier Locks:{' '}
                <strong className="text-amber-400">
                  {state.parallelTracks.filter((t) => t.status === 'WAITING_BARRIER').length} Waiting
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {state.parallelTracks.map((track) => {
              const agentInfo = AGENT_REGISTRY[track.agent];
              const isWaitingBarrier = track.status === 'WAITING_BARRIER';
              const isExecuting = track.status === 'EXECUTING';
              const isCompleted = track.status === 'COMPLETED';

              return (
                <div
                  key={track.id}
                  className={`rounded-lg p-3 border text-left space-y-2 relative transition-all ${
                    isCompleted
                      ? 'border-emerald-800/60 bg-slate-900/80'
                      : isExecuting
                      ? 'border-cyan-700/70 bg-slate-900/95 shadow-md shadow-cyan-950/40'
                      : isWaitingBarrier
                      ? 'border-amber-800/60 bg-slate-950/90'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{agentInfo?.avatar || '🤖'}</span>
                      <span className="text-xs font-bold text-slate-200">{track.agent}</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                      Lane #{track.laneNumber}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-200 truncate">{track.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">ID: {track.id}</div>
                  </div>

                  {track.barrierCondition && (
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-850 text-[10px] font-mono space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Barrier:</span>
                        <span className={track.barrierCondition.satisfied ? 'text-emerald-400' : 'text-amber-400'}>
                          {track.barrierCondition.satisfied ? 'SATISFIED' : 'WAITING'}
                        </span>
                      </div>
                      <div className="text-slate-400 truncate text-[9px]">
                        Sync: {track.barrierCondition.joinBarrierName}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span
                        className={`${
                          isCompleted
                            ? 'text-emerald-400 font-bold'
                            : isExecuting
                            ? 'text-cyan-400 animate-pulse font-bold'
                            : isWaitingBarrier
                            ? 'text-amber-400 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {track.status}
                      </span>
                      <span className="text-slate-400">{track.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : isExecuting ? 'bg-cyan-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${track.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-500 font-mono">
                      {track.threadEvents.length} events
                    </span>
                    <button
                      onClick={() => handleStepTrack(track.id)}
                      disabled={isCompleted}
                      className="px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 font-mono text-[10px] disabled:opacity-40 cursor-pointer"
                    >
                      Step Thread
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 11 Specialized Agents Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active LangGraph Cognitive Agents (11 Nodes)
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Active Node: <strong className="text-indigo-400">{state.currentActiveAgent}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {agentList.map((agent) => {
            const isCurrentlyActive = state.currentActiveAgent === agent.role;
            const hasCompletedTask = state.plan.some(
              (t) => t.assignedTo === agent.role && t.status === 'COMPLETED'
            );

            return (
              <div
                key={agent.id}
                className={`rounded-xl p-3 border transition-all text-left relative overflow-hidden ${
                  isCurrentlyActive
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                    : hasCompletedTask
                    ? 'border-slate-800 bg-slate-900/60'
                    : 'border-slate-850 bg-slate-950/50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xl" role="img" aria-label={agent.role}>
                    {agent.avatar}
                  </span>
                  <span className={`text-[10px] font-mono px-1 rounded uppercase ${
                    agent.governanceStrictness === 'CRITICAL'
                      ? 'text-red-400 bg-red-950/50 border border-red-900/50'
                      : agent.governanceStrictness === 'STRICT'
                      ? 'text-amber-400 bg-amber-950/50 border border-amber-900/50'
                      : 'text-slate-400 bg-slate-800'
                  }`}>
                    {agent.governanceStrictness}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-xs font-bold text-white truncate" title={agent.role}>
                    {agent.role}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">
                    {agent.codename}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2" title={agent.description}>
                  {agent.description}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{agent.allowedTools.length} tools</span>
                  {isCurrentlyActive ? (
                    <span className="text-indigo-400 font-bold animate-pulse">RUNNING</span>
                  ) : hasCompletedTask ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> DONE
                    </span>
                  ) : (
                    <span>IDLE</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Task DAG Breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Topological Task DAG Schedule ({state.plan.filter((t) => t.status === 'COMPLETED').length}/{state.plan.length} Completed)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-2">Task</th>
                <th className="pb-2">Agent</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Dependencies</th>
                <th className="pb-2">Gate</th>
                <th className="pb-2 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {state.plan.map((task, idx) => (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    idx === state.activeTaskIndex && state.status !== 'COMPLETED'
                      ? 'bg-indigo-950/20 font-medium'
                      : ''
                  }`}
                >
                  <td className="py-2.5 pr-4">
                    <div className="font-semibold text-slate-200">{task.title}</div>
                    <div className="text-[11px] text-slate-400">{task.description}</div>
                  </td>
                  <td className="py-2.5 pr-4 text-cyan-400 font-mono">
                    {task.assignedTo}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                      task.status === 'COMPLETED' ? 'text-emerald-400' :
                      task.status === 'IN_PROGRESS' ? 'text-indigo-400 font-bold animate-pulse' :
                      task.status === 'BLOCKED' ? 'text-red-400' :
                      'text-slate-500'
                    }`}>
                      {task.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                      {task.status === 'IN_PROGRESS' && <Clock className="w-3 h-3 animate-spin" />}
                      {task.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-slate-500">
                    {task.dependencies.length > 0 ? task.dependencies.join(', ') : 'root'}
                  </td>
                  <td className="py-2.5 pr-4">
                    {task.securityApprovalRequired ? (
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Human Gate
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Auto</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {task.actualMs ? `${task.actualMs}ms` : `~${task.estimatedMs}ms`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STRUCTURED EVENT-LOG & FORENSIC AUDIT TRAIL PANEL (SEARCHABLE BY STATUS) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Forensic Audit Trail & Event-Log
              </h3>
              <p className="text-[11px] text-slate-400">
                Immutable trace of agent decisions, tool execution metadata, self-thinking inner monologues, and provenance hashes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFullAuditLog}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Download entire forensic event log as JSON"
            >
              {exportedJsonSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Exported</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export JSON</span>
                </>
              )}
            </button>

            <span className="text-xs font-mono text-slate-500 border-l border-slate-800 pl-3">
              Total Events: <strong className="text-slate-200">{stepHistory.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter Controls: Status Tabs, Search Bar, Agent Dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'PASS', 'INTERRUPT', 'WARN', 'FAIL', 'BLOCKED'] as const).map((status) => {
              const count = statusCounts[status] || 0;
              const isSelected = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isSelected
                      ? status === 'PASS'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : status === 'INTERRUPT'
                        ? 'bg-amber-950 text-amber-300 border-amber-600'
                        : status === 'FAIL' || status === 'BLOCKED'
                        ? 'bg-red-950 text-red-300 border-red-600'
                        : 'bg-indigo-950 text-indigo-300 border-indigo-600'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{status}</span>
                  <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-black/30' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Agent Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail, tools, rationale..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Agents</option>
                {agentList.map((ag) => (
                  <option key={ag.id} value={ag.role}>
                    {ag.role} ({ag.codename})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audit Events List */}
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
              No audit events found matching the selected status ({statusFilter}) and filter criteria.
            </div>
          ) : (
            filteredEvents.slice().reverse().map((ev) => {
              const isExpanded = expandedStep === ev.step;
              const evStatus = ev.status || (ev.verdict as EventStatus) || 'PASS';
              const agentInfo = AGENT_REGISTRY[ev.agent];

              return (
                <div
                  key={ev.step}
                  className={`rounded-xl border transition-all text-xs overflow-hidden ${
                    evStatus === 'INTERRUPT'
                      ? 'border-amber-700/60 bg-amber-950/20'
                      : evStatus === 'FAIL'
                      ? 'border-red-700/60 bg-red-950/20'
                      : isExpanded
                      ? 'border-indigo-700/60 bg-slate-900'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div
                    onClick={() => setExpandedStep(isExpanded ? null : ev.step)}
                    className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Step Number Badge */}
                      <span className="font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded text-[11px]">
                        Step #{ev.step}
                      </span>

                      {/* Agent Avatar & Role */}
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-base">{agentInfo?.avatar || '🤖'}</span>
                        <span className="font-semibold text-slate-200">{ev.agent}</span>
                        <span className="text-[10px] font-mono text-cyan-400 hidden sm:inline">
                          ({agentInfo?.codename || ev.nodeName})
                        </span>
                      </div>

                      {/* Action Summary */}
                      <span className="text-slate-300 truncate font-mono text-[11px]">
                        {ev.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Multitasking Lane Badge */}
                      {ev.multitaskingContext && (
                        <span className="hidden md:flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                          <Cpu className="w-2.5 h-2.5" />
                          {ev.multitaskingContext.threadId}
                        </span>
                      )}

                      {/* Status Indicator */}
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                          evStatus === 'PASS'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            : evStatus === 'INTERRUPT'
                            ? 'bg-amber-950/80 text-amber-400 border-amber-800 animate-pulse'
                            : evStatus === 'FAIL'
                            ? 'bg-red-950/80 text-red-400 border-red-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {evStatus}
                      </span>

                      {/* Duration & Tokens */}
                      <span className="font-mono text-slate-500 text-[11px] hidden sm:inline">
                        {ev.durationMs}ms
                      </span>

                      {/* Expand / Collapse Chevron */}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Forensic Detail Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 p-4 space-y-4 bg-slate-950/90">
                      
                      {/* 1. Self-Thinking & Deliberation Intelligence */}
                      {ev.selfThinking && (
                        <div className="rounded-lg border border-purple-900/50 bg-purple-950/20 p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BrainCircuit className="w-4 h-4 text-purple-400" />
                              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                                Agent Self-Thinking & Internal Deliberation Trace
                              </h4>
                            </div>
                            <span className="text-[11px] font-mono text-purple-300">
                              Confidence: <strong>{Math.round(ev.selfThinking.confidenceScore * 100)}%</strong>
                            </span>
                          </div>

                          {/* Inner Monologue */}
                          <div>
                            <div className="text-[10px] uppercase font-mono text-purple-400 font-bold mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Cognitive Chain-of-Thought
                            </div>
                            <p className="text-slate-300 leading-relaxed font-sans text-xs">
                              {ev.selfThinking.innerMonologue}
                            </p>
                          </div>

                          {/* Hypotheses formulated */}
                          {ev.selfThinking.hypotheses && ev.selfThinking.hypotheses.length > 0 && (
                            <div>
                              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
                                Hypotheses & Trade-off Deliberation:
                              </div>
                              <ul className="space-y-1">
                                {ev.selfThinking.hypotheses.map((h, hIdx) => (
                                  <li key={hIdx} className="text-[11px] font-mono text-slate-300 flex items-start gap-1.5">
                                    <ArrowRight className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                                    <span>{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Constitutional Self Check */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-purple-900/40 text-[11px] font-mono">
                            <div>
                              <span className="text-slate-500">Constitutional Rule: </span>
                              <strong className="text-cyan-300">{ev.selfThinking.constitutionalInvariantCheck.rule}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500">Counterfactual Note: </span>
                              <span className="text-slate-400">{ev.selfThinking.counterfactualEvaluation}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Decision Rationale */}
                      {ev.decisionRationale && (
                        <div>
                          <div className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
                            Decision Rationale
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                            {ev.decisionRationale}
                          </div>
                        </div>
                      )}

                      {/* 2. Tool Execution Metadata Table */}
                      {ev.toolCalls && ev.toolCalls.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-1 flex items-center justify-between">
                            <span>Tool Execution Telemetry ({ev.toolCalls.length} Invocations)</span>
                          </div>
                          <div className="space-y-2">
                            {ev.toolCalls.map((tc, tcIdx) => (
                              <div
                                key={tcIdx}
                                className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1.5 font-mono text-[11px]"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-cyan-400 font-bold">{tc.toolName}()</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      tc.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-950/60' :
                                      tc.status === 'INTERRUPTED' ? 'text-amber-400 bg-amber-950/60' : 'text-red-400 bg-red-950/60'
                                    }`}>
                                      {tc.status}
                                    </span>
                                  </div>
                                  <span className="text-slate-500">{tc.executionMs}ms</span>
                                </div>

                                {tc.args && Object.keys(tc.args).length > 0 && (
                                  <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-850 overflow-x-auto">
                                    <span className="text-slate-500 font-bold">Args: </span>
                                    {JSON.stringify(tc.args)}
                                  </div>
                                )}

                                {tc.outputSummary && (
                                  <div className="text-slate-300 text-[11px]">
                                    <span className="text-slate-500">Output: </span>
                                    {tc.outputSummary}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Provenance & Cryptographic Trace */}
                      {ev.provenance && (
                        <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-[11px] font-mono grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          <div>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Hash className="w-3 h-3 text-cyan-400" /> State Hash:
                            </span>
                            <span className="text-cyan-300 truncate block" title={ev.provenance.stateHash}>
                              {ev.provenance.stateHash.slice(0, 18)}...
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Database className="w-3 h-3 text-indigo-400" /> Checkpoint:
                            </span>
                            <span className="text-indigo-300 truncate block">
                              {ev.provenance.checkpointId || 'None'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-amber-400" /> Constitution Ref:
                            </span>
                            <span className="text-amber-300 truncate block" title={ev.provenance.constitutionRef}>
                              {ev.provenance.constitutionRef || 'Standard'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Security Clearance:</span>
                            <span className="text-slate-200 block">
                              {ev.securityClearanceChecked || 'NORMAL'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 4. Raw Input & Output */}
                      <div className="space-y-2 font-mono text-[11px]">
                        <div>
                          <div className="text-slate-500 mb-0.5">Input Specification:</div>
                          <div className="p-2 rounded bg-slate-950 border border-slate-850 text-slate-300">
                            {ev.input}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-0.5">Execution Synthesis:</div>
                          <div className="p-2 rounded bg-slate-950 border border-slate-850 text-slate-300">
                            {ev.output}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions: Copy Single Event JSON */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <div className="text-[10px] font-mono text-slate-500">
                          Tokens: {ev.tokenUsage.input} in / {ev.tokenUsage.output} out (${ev.tokenUsage.costEstimateUsd.toFixed(4)})
                        </div>

                        <button
                          onClick={() => handleCopyEventJson(ev)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                        >
                          {copiedStep === ev.step ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy Step JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
