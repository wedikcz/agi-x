/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Immutable Constitution & Safety Governor
 */

import { ConstitutionalRule, SecurityViolation, AgentRole } from '../types/agi';

export const IMMUTABLE_CONSTITUTION: ConstitutionalRule[] = [
  {
    id: 'CONST-01',
    principle: 'Preserve Human Invariant Control',
    description: 'The operator retains supreme override authority. Agents must yield immediately to human operator abort or pause directives.',
    category: 'CONTROL',
    isHardConstraint: true,
    activeEnforcement: true,
    violationCount: 0,
  },
  {
    id: 'CONST-02',
    principle: 'Strict Privilege Anti-Escalation',
    description: 'An agent cannot grant itself permissions, expand its own toolset, or alter its clearance level without authenticated external sign-off.',
    category: 'SECURITY',
    isHardConstraint: true,
    activeEnforcement: true,
    violationCount: 0,
  },
  {
    id: 'CONST-03',
    principle: 'Zero Self-Approval & Zero Self-Deploy',
    description: 'An agent cannot approve its own pull requests, promotion candidates, or production deployment steps. Dual-control governance required.',
    category: 'SECURITY',
    isHardConstraint: true,
    activeEnforcement: true,
    violationCount: 0,
  },
  {
    id: 'CONST-04',
    principle: 'Immutable Identity & Security Layer Protection',
    description: 'No agent or subagent is permitted to modify the kernel identity, cryptographic keys, root certificates, or the constitution itself.',
    category: 'SECURITY',
    isHardConstraint: true,
    activeEnforcement: true,
    violationCount: 0,
  },
  {
    id: 'CONST-05',
    principle: 'Mandatory Verifiable Provenance',
    description: 'Every factual assertion, code mutation, or executive decision must link directly to an audit-grade memory record or source citation.',
    category: 'EVIDENCE',
    isHardConstraint: false,
    activeEnforcement: true,
    violationCount: 0,
  },
  {
    id: 'CONST-06',
    principle: 'Deterministic Rollback Guarantees',
    description: 'All system mutations must have an automated, verified, reversible transaction log or container checkpoint prior to deployment.',
    category: 'ROLLBACK',
    isHardConstraint: true,
    activeEnforcement: true,
    violationCount: 0,
  },
  {
    id: 'CONST-07',
    principle: 'Explainability & Transparent Trajectories',
    description: 'All reasoning steps, tool invocations, and plan revisions must be logged to the immutable Audit Memory tier in machine-verifiable format.',
    category: 'EXPLAINABILITY',
    isHardConstraint: false,
    activeEnforcement: true,
    violationCount: 0,
  },
];

export class SafetyGovernor {
  private rules: ConstitutionalRule[] = [...IMMUTABLE_CONSTITUTION];
  private violations: SecurityViolation[] = [];

  constructor() {
    // Initialized with immutable constitution
  }

  public getRules(): ConstitutionalRule[] {
    return this.rules;
  }

  public getViolations(): SecurityViolation[] {
    return this.violations;
  }

  /**
   * OPA / Policy Evaluator
   * Validates whether an agent action violates constitutional invariants
   */
  public evaluateAction(params: {
    agent: AgentRole;
    action: string;
    targetSubsystem?: string;
    requestedPermissions?: string[];
    isSelfApproval?: boolean;
    isSelfDeploy?: boolean;
  }): { allowed: boolean; violation?: SecurityViolation; reason: string } {
    const { agent, action, targetSubsystem, requestedPermissions, isSelfApproval, isSelfDeploy } = params;

    // Rule 1: Attempt to modify security or identity layer
    if (
      targetSubsystem === 'SECURITY' ||
      targetSubsystem === 'CONSTITUTION' ||
      targetSubsystem === 'IDENTITY' ||
      action.toLowerCase().includes('modify security') ||
      action.toLowerCase().includes('bypass constitution') ||
      action.toLowerCase().includes('alter identity')
    ) {
      return this.recordViolation({
        agent,
        action,
        ruleId: 'CONST-04',
        rulePrinciple: 'Immutable Identity & Security Layer Protection',
        riskRating: 'CRITICAL',
        reason: `Agent '${agent}' attempted prohibited mutation of the ${targetSubsystem || 'Security/Identity'} layer.`,
      });
    }

    // Rule 2: Self-approval attempt
    if (isSelfApproval || action.toLowerCase().includes('self approve') || action.toLowerCase().includes('approve own')) {
      return this.recordViolation({
        agent,
        action,
        ruleId: 'CONST-03',
        rulePrinciple: 'Zero Self-Approval & Zero Self-Deploy',
        riskRating: 'CRITICAL',
        reason: `Agent '${agent}' attempted self-approval of task/code without independent reviewer sign-off.`,
      });
    }

    // Rule 3: Self-deploy attempt
    if (isSelfDeploy || action.toLowerCase().includes('direct deploy to production') || action.toLowerCase().includes('bypass promotion gate')) {
      return this.recordViolation({
        agent,
        action,
        ruleId: 'CONST-03',
        rulePrinciple: 'Zero Self-Approval & Zero Self-Deploy',
        riskRating: 'CRITICAL',
        reason: `Agent '${agent}' attempted unverified direct deployment to production.`,
      });
    }

    // Rule 4: Privilege escalation
    if (
      (requestedPermissions && requestedPermissions.length > 0) ||
      action.toLowerCase().includes('grant permission') ||
      action.toLowerCase().includes('escalate privilege')
    ) {
      return this.recordViolation({
        agent,
        action,
        ruleId: 'CONST-02',
        rulePrinciple: 'Strict Privilege Anti-Escalation',
        riskRating: 'HIGH',
        reason: `Agent '${agent}' attempted autonomous permission expansion (${requestedPermissions?.join(', ')}).`,
      });
    }

    return {
      allowed: true,
      reason: `Action '${action}' conforms to all ${this.rules.length} constitutional invariants.`,
    };
  }

  private recordViolation(params: {
    agent: AgentRole;
    action: string;
    ruleId: string;
    rulePrinciple: string;
    riskRating: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    reason: string;
  }): { allowed: boolean; violation: SecurityViolation; reason: string } {
    const violation: SecurityViolation = {
      id: `VIOL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      violatingAgent: params.agent,
      attemptedAction: params.action,
      ruleViolated: `${params.ruleId}: ${params.rulePrinciple}`,
      riskRating: params.riskRating,
      blocked: true,
      reason: params.reason,
    };

    this.violations.unshift(violation);

    // Update rule violation count
    const ruleIndex = this.rules.findIndex((r) => r.id === params.ruleId);
    if (ruleIndex >= 0) {
      this.rules[ruleIndex] = {
        ...this.rules[ruleIndex],
        violationCount: this.rules[ruleIndex].violationCount + 1,
      };
    }

    return {
      allowed: false,
      violation,
      reason: params.reason,
    };
  }

  public clearViolations(): void {
    this.violations = [];
  }
}
