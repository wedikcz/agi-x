/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Digital Twin Sandbox & Safe Evolution Engine
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AgiKernel } from '../kernel/agi-kernel';
import { SimulationScenario, EvolutionCandidate } from '../types/agi';

interface SimulationViewProps {
  kernel: AgiKernel;
  onRefresh: () => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ kernel, onRefresh }) => {
  const digitalTwin = kernel.digitalTwin;
  const twinState = digitalTwin.getTwinState();
  const scenarios = digitalTwin.getScenarios();
  const candidates = digitalTwin.getEvolutionCandidates();

  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(scenarios[0]);
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [newMutationTarget, setNewMutationTarget] = useState<EvolutionCandidate['targetSubsystem']>('RAG_RERANKER');
  const [newMutationDesc, setNewMutationDesc] = useState<string>('');

  const handleRunScenario = (scenId: string) => {
    const updated = digitalTwin.runSimulation(scenId);
    setActiveScenario(updated);
    onRefresh();
  };

  const handlePromote = (candidateId: string, operatorConfirmed: boolean) => {
    const res = digitalTwin.promoteCandidate(candidateId, operatorConfirmed);
    setPromoMessage(res);
    onRefresh();
  };

  const handleCreateMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMutationDesc.trim()) return;

    digitalTwin.createEvolutionCandidate(newMutationTarget, newMutationDesc.trim());
    setNewMutationDesc('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Digital Twin Sandbox & Safe Self-Improvement
            </h2>
            <span className="text-xs font-mono text-slate-400">
              ({twinState.version})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict isolation: zero direct production mutation. All changes tested in counterfactual sandbox before promotion.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-lg">
            Divergence: <strong>{(twinState.divergenceMetric * 100).toFixed(1)}%</strong>
          </div>
          <div className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
            Sandbox Scenarios: <strong>{twinState.simulatedScenariosCount}</strong>
          </div>
        </div>
      </div>

      {/* Counterfactual What-If Scenario Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Scenario List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Counterfactual Scenarios
          </h3>

          <div className="space-y-2">
            {scenarios.map((scen) => (
              <div
                key={scen.id}
                onClick={() => setActiveScenario(scen)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer text-left ${
                  activeScenario.id === scen.id
                    ? 'border-indigo-500 bg-indigo-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>{scen.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    scen.status === 'VERIFIED' ? 'text-emerald-400 bg-emerald-950/80' : 'text-slate-400 bg-slate-800'
                  }`}>
                    {scen.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {scen.hypothesis}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Scenario Inspector & Runner */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">{activeScenario.title}</h4>
              <span className="text-xs font-mono text-slate-400">
                Confidence: {(activeScenario.confidenceScore * 100).toFixed(0)}%
              </span>
            </div>

            <button
              onClick={() => handleRunScenario(activeScenario.id)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Sandbox Simulation</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-mono text-[11px]">Hypothesis:</span>
              <p className="text-slate-300 mt-0.5">{activeScenario.hypothesis}</p>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[11px]">Injected Disturbance:</span>
              <p className="text-red-300 font-mono text-[11px] mt-0.5 bg-red-950/30 p-2 rounded border border-red-900/40">
                {activeScenario.injectedFailure || 'Nominal cluster stress test'}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[11px]">Expected Outcome:</span>
              <p className="text-slate-300 mt-0.5">{activeScenario.expectedOutcome}</p>
            </div>

            {/* Sandbox Execution Logs */}
            <div>
              <span className="text-slate-500 font-mono text-[11px]">Sandbox Telemetry Logs:</span>
              <div className="mt-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1 max-h-36 overflow-y-auto">
                {activeScenario.executionLogs.length === 0 ? (
                  <span className="text-slate-600">Click &quot;Run Sandbox Simulation&quot; to execute.</span>
                ) : (
                  activeScenario.executionLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Safe Evolution & Mutation Promotion Engine */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Autonomous Self-Improvement & Evolution Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rule: Sandbox Test -&gt; Benchmark Battery -&gt; Sovereign Human Sign-off -&gt; GitOps PR.
            </p>
          </div>

          <span className="text-xs font-mono text-amber-400">
            Zero Unreviewed Production Mutation
          </span>
        </div>

        {/* Promotion Feedback Message */}
        {promoMessage && (
          <div className={`p-3 rounded-lg border text-xs font-mono ${
            promoMessage.success
              ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
              : 'border-red-800 bg-red-950/40 text-red-300'
          }`}>
            {promoMessage.message}
          </div>
        )}

        {/* Evolution Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-2">Subsystem</th>
                <th className="pb-2">Proposed Mutation</th>
                <th className="pb-2">Baseline</th>
                <th className="pb-2">Sandbox Score</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Promotion Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {candidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 pr-3 font-mono font-bold text-cyan-400">
                    {cand.targetSubsystem}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-300 max-w-xs">
                    {cand.mutationDescription}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-slate-400">
                    {cand.baselineScore.toFixed(1)}
                  </td>
                  <td className="py-2.5 pr-3 font-mono font-bold text-emerald-400">
                    {cand.sandboxBenchmarkScore.toFixed(1)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-[11px] font-mono ${
                      cand.status === 'PROMOTED' ? 'text-emerald-400 font-bold' :
                      cand.status === 'AWAITING_APPROVAL' ? 'text-amber-400 font-bold animate-pulse' :
                      'text-slate-500'
                    }`}>
                      {cand.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right space-x-2">
                    {cand.status === 'AWAITING_APPROVAL' && (
                      <>
                        <button
                          onClick={() => handlePromote(cand.id, false)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-mono cursor-pointer"
                          title="Simulates agent self-promoting without operator sign-off (should fail)"
                        >
                          Try Auto-Promote
                        </button>
                        <button
                          onClick={() => handlePromote(cand.id, true)}
                          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Operator Authorize
                        </button>
                      </>
                    )}
                    {cand.status === 'PROMOTED' && (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Promoted via GitOps
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Propose Mutation Form */}
        <form onSubmit={handleCreateMutation} className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={newMutationTarget}
            onChange={(e) => setNewMutationTarget(e.target.value as any)}
            className="px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
          >
            <option value="RAG_RERANKER">RAG_RERANKER</option>
            <option value="PLANNER">PLANNER</option>
            <option value="PROMPT_COMPILER">PROMPT_COMPILER</option>
            <option value="TOOL_DISPATCHER">TOOL_DISPATCHER</option>
          </select>

          <input
            type="text"
            placeholder="Describe experimental optimization to benchmark in sandbox..."
            value={newMutationDesc}
            onChange={(e) => setNewMutationDesc(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            required
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5 justify-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Sandbox Candidate</span>
          </button>
        </form>

      </div>

    </div>
  );
};
