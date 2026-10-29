/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | System Header & Real-Time Telemetry Bar
 */

import React from 'react';
import { ShieldCheck, Cpu, Activity, Clock, Database, AlertTriangle, Play, RefreshCw } from 'lucide-react';
import { AgiKernel } from '../kernel/agi-kernel';

interface HeaderProps {
  kernel: AgiKernel;
  onQuickRun: () => void;
  onReset: () => void;
  isExecuting: boolean;
}

export const Header: React.FC<HeaderProps> = ({ kernel, onQuickRun, onReset, isExecuting }) => {
  const state = kernel.langGraph.getState();
  const metrics = kernel.modelRouter.getMetrics();
  const violations = kernel.governor.getViolations();

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Brand & Kernel Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-lg font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                  Ω
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  PavelAGI-X Omega
                </h1>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                  v1.0-PROD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Proto-AGI Cognitive OS <span className="text-slate-600">·</span> Sovereign Operator: <span className="text-slate-200 font-medium">{kernel.identity.sovereignOperator}</span>
              </p>
            </div>
          </div>

          {/* Telemetry Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Governor: <strong className="text-emerald-400 font-semibold">ENFORCED</strong></span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Latency: <strong className="text-slate-200">{metrics.averageLatencyMs}ms</strong></span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tokens: <strong className="text-slate-200">{(metrics.totalTokensProcessed / 1000).toFixed(1)}k</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Memory: <strong className="text-slate-200">8 Tiers</strong></span>
            </div>

            {violations.length > 0 && (
              <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Blocked Threats: <strong>{violations.length}</strong></span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={onReset}
              disabled={isExecuting}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Reset state machine and checkpoints"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onQuickRun}
              disabled={isExecuting || state.status === 'COMPLETED'}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{state.status === 'INTERRUPTED' ? 'Awaiting Human' : isExecuting ? 'Running Step...' : 'Execute Step'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
