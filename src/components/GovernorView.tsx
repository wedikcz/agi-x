/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Governance Layer, Immutable Constitution & OPA Simulator
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Play,
  FileCheck,
  Zap,
} from 'lucide-react';
import { AgiKernel } from '../kernel/agi-kernel';
import { SecurityViolation } from '../types/agi';

interface GovernorViewProps {
  kernel: AgiKernel;
  onRefresh: () => void;
}

export const GovernorView: React.FC<GovernorViewProps> = ({ kernel, onRefresh }) => {
  const governor = kernel.governor;
  const rules = governor.getRules();
  const violations = governor.getViolations();

  const [simResult, setSimResult] = useState<{
    allowed: boolean;
    violation?: SecurityViolation;
    reason: string;
  } | null>(null);

  const runAdversarialTest = (testType: 'escalation' | 'self_approval' | 'security_mutation' | 'valid_action') => {
    let res;
    if (testType === 'escalation') {
      res = governor.evaluateAction({
        agent: 'Coder',
        action: 'Acquire cluster-admin ServiceAccount credentials to bypass restricted SCC',
        requestedPermissions: ['cluster-admin', 'secrets:read_all'],
      });
    } else if (testType === 'self_approval') {
      res = governor.evaluateAction({
        agent: 'Chief Orchestrator',
        action: 'Self-approve pull request #42 for production kernel promotion',
        isSelfApproval: true,
      });
    } else if (testType === 'security_mutation') {
      res = governor.evaluateAction({
        agent: 'Researcher',
        action: 'Disable OPA Gatekeeper constraint template on namespace pavelagi-omega-prod',
        targetSubsystem: 'SECURITY',
      });
    } else {
      res = governor.evaluateAction({
        agent: 'Architect',
        action: 'Publish OpenAPI 3.1 specification contract for memory fabric endpoints',
        targetSubsystem: 'API_CONTRACTS',
      });
    }

    setSimResult(res);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Safety Governor & Immutable Constitution
            </h2>
            <span className="text-xs font-mono text-slate-400">
              ({rules.length} Hard Invariants Enforced)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic dual-control governance, zero autonomous self-approval, zero self-deployment, and OPA Rego admission policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Invariant Engine: STRICT</span>
          </span>
        </div>
      </div>

      {/* Adversarial Attack Simulator Workbench */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Adversarial Invariant Stress Test Simulator
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Simulate Unauthorized Agent Actions
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Trigger real-time adversarial attempts against the Governor to verify zero-tolerance enforcement in under 15 milliseconds.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => runAdversarialTest('escalation')}
            className="p-3 rounded-lg border border-red-900/50 bg-red-950/20 hover:bg-red-950/40 text-left text-xs transition-colors cursor-pointer space-y-1"
          >
            <div className="font-bold text-red-300">Attack 1: Privilege Escalation</div>
            <div className="text-[11px] text-slate-400 font-mono">Coder requests cluster-admin</div>
          </button>

          <button
            onClick={() => runAdversarialTest('self_approval')}
            className="p-3 rounded-lg border border-red-900/50 bg-red-950/20 hover:bg-red-950/40 text-left text-xs transition-colors cursor-pointer space-y-1"
          >
            <div className="font-bold text-red-300">Attack 2: Self-Approval Attempt</div>
            <div className="text-[11px] text-slate-400 font-mono">Orchestrator signs own PR</div>
          </button>

          <button
            onClick={() => runAdversarialTest('security_mutation')}
            className="p-3 rounded-lg border border-red-900/50 bg-red-950/20 hover:bg-red-950/40 text-left text-xs transition-colors cursor-pointer space-y-1"
          >
            <div className="font-bold text-red-300">Attack 3: Security Layer Mutation</div>
            <div className="text-[11px] text-slate-400 font-mono">Disable OPA Gatekeeper policy</div>
          </button>

          <button
            onClick={() => runAdversarialTest('valid_action')}
            className="p-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-950/40 text-left text-xs transition-colors cursor-pointer space-y-1"
          >
            <div className="font-bold text-emerald-300">Normal Action: API Contract</div>
            <div className="text-[11px] text-slate-400 font-mono">Architect publishes schema</div>
          </button>
        </div>

        {/* Live Simulator Outcome */}
        {simResult && (
          <div className={`mt-3 p-3.5 rounded-lg border text-xs font-mono space-y-1 ${
            simResult.allowed
              ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
              : 'border-red-800 bg-red-950/40 text-red-300'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span>{simResult.allowed ? 'ACTION PERMITTED' : 'SECURITY INVARIANT BREACH BLOCKED'}</span>
              <span>{simResult.allowed ? 'VERDICT: PASS' : 'VERDICT: REJECTED'}</span>
            </div>
            <p className="text-slate-300 font-sans text-xs mt-1">
              {simResult.reason}
            </p>
            {simResult.violation && (
              <div className="text-[11px] text-slate-400 pt-1">
                Violating Rule: <strong className="text-red-400">{simResult.violation.ruleViolated}</strong> | Risk: <strong className="text-red-400">{simResult.violation.riskRating}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Immutable Constitution Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Immutable Constitutional Invariants
        </h3>

        <div className="divide-y divide-slate-800 text-xs">
          {rules.map((rule) => (
            <div key={rule.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">{rule.id}</span>
                  <span className="font-bold text-slate-200">{rule.principle}</span>
                  {rule.isHardConstraint && (
                    <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-800/60 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Hard Constraint
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs">{rule.description}</p>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 self-start md:self-auto">
                <span className="text-slate-500">Category: {rule.category}</span>
                <span className="text-slate-700">·</span>
                <span>
                  Violations Blocked: <strong className={rule.violationCount > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>{rule.violationCount}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cryptographic Security Audit Ledger ({violations.length} Entries)
            </h3>
          </div>
        </div>

        {violations.length === 0 ? (
          <div className="text-slate-500 text-xs py-6 text-center font-mono border border-dashed border-slate-850 rounded-lg">
            Zero security violations recorded. Platform operating under clean constitutional parameters.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs pr-1">
            {violations.map((v) => (
              <div
                key={v.id}
                className="p-2.5 rounded-lg bg-slate-950 border border-red-900/50 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">[{v.riskRating}]</span>
                    <span className="text-slate-200">Agent: {v.violatingAgent}</span>
                  </div>
                  <span className="text-slate-500">{v.timestamp}</span>
                </div>
                <div className="text-slate-300 font-sans text-xs">
                  <strong>Attempt:</strong> {v.attemptedAction}
                </div>
                <div className="text-[11px] text-red-300 bg-red-950/40 p-1.5 rounded border border-red-900/40">
                  {v.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
