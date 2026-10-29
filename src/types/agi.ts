/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Proto-AGI Operating System Core Domain Types
 */

// ==========================================
// 1. AGI KERNEL & AGENT SYSTEM
// ==========================================

export type AgentRole =
  | 'Chief Orchestrator'
  | 'Planner'
  | 'Researcher'
  | 'Architect'
  | 'Coder'
  | 'Reviewer'
  | 'Security'
  | 'Vision'
  | 'Memory'
  | 'Evaluator'
  | 'Governor';

export interface AgentDescriptor {
  id: string;
  role: AgentRole;
  codename: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  allowedTools: string[];
  maxTokens: number;
  temperature: number;
  governanceStrictness: 'CRITICAL' | 'STRICT' | 'STANDARD';
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'FAILED' | 'WAITING_HUMAN';

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  assignedTo: AgentRole;
  status: TaskStatus;
  dependencies: string[];
  estimatedMs: number;
  actualMs?: number;
  outputArtifacts?: string[];
  securityApprovalRequired: boolean;
  securityVerdict?: 'APPROVED' | 'DENIED' | 'PENDING';
  error?: string;
}

export interface AgentSelfThinking {
  innerMonologue: string;
  hypotheses: string[];
  constitutionalInvariantCheck: {
    verified: boolean;
    rule: string;
    reasoning: string;
  };
  confidenceScore: number;
  counterfactualEvaluation: string;
}

export interface MultitaskingLane {
  laneId: string;
  agent: AgentRole;
  threadId: string;
  taskTitle: string;
  subtaskDescription: string;
  status: 'IDLE' | 'COMPUTING' | 'WAITING_SYNC' | 'COMPLETED';
  progressPct: number;
}

export interface ParallelStateTrack {
  id: string;
  name: string;
  agent: AgentRole;
  status: 'IDLE' | 'EXECUTING' | 'WAITING_BARRIER' | 'COMPLETED' | 'BLOCKED' | 'INTERRUPTED';
  assignedTaskIds: string[];
  currentTaskId: string | null;
  progress: number; // 0 to 100
  branchPointCheckpointId: string;
  laneNumber: number;
  localMemoryScope: Record<string, any>;
  threadEvents: GraphStepEvent[];
  barrierCondition?: {
    waitOnTrackIds: string[];
    joinBarrierName: string;
    satisfied: boolean;
  };
  joinedTracks?: string[];
}

export type ReflectionType =
  | 'PLAN_OPTIMIZATION'
  | 'DEADLOCK_PREVENTION'
  | 'CONCURRENCY_ALLOCATION'
  | 'INVARIANT_AUDIT'
  | 'BOTTLENECK_RESOLUTION';

export interface ThoughtStreamItem {
  id: string;
  timestamp: string;
  cycle: number;
  reflectionType: ReflectionType;
  triggerReason: string;
  observation: string;
  critique: string;
  proposedOptimization: string;
  appliedMutation?: string;
  confidenceScore: number; // 0.0 - 1.0
  impactScore: number; // 0 - 100
  status: 'PROPOSED' | 'APPLIED' | 'REJECTED';
}

export interface CognitiveState {
  missionId: string;
  missionGoal: string;
  status: 'IDLE' | 'PLANNING' | 'EXECUTING' | 'INTERRUPTED' | 'EVALUATING' | 'COMPLETED' | 'HALTED';
  currentActiveAgent: AgentRole | 'NONE';
  plan: PlanTask[];
  activeTaskIndex: number;
  artifacts: Record<string, string>;
  memorySnapshots: string[];
  securityClearance: 'NORMAL' | 'ELEVATED' | 'BLOCKED';
  checkpointId: string;
  iteration: number;
  maxIterations: number;
  evaluatorScore: number;
  evaluatorFeedback: string[];
  interruptionReason?: string;
  pendingApproval?: {
    taskId: string;
    actionDescription: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresHumanReview: boolean;
  };
  executionMode?: 'SEQUENTIAL' | 'MULTITASKING_SWARM';
  activeLanes?: MultitaskingLane[];
  parallelSpeedupRatio?: number;
  parallelTracks?: ParallelStateTrack[];
  thoughtStream?: ThoughtStreamItem[];
  reflectionCyclesCount?: number;
}

export type EventStatus = 'PASS' | 'WARN' | 'INTERRUPT' | 'FAIL' | 'BLOCKED';

export interface ToolExecutionRecord {
  toolName: string;
  executionMs: number;
  args: Record<string, any>;
  status: 'SUCCESS' | 'ERROR' | 'BLOCKED' | 'INTERRUPTED';
  outputSummary?: string;
}

export interface EventProvenanceRecord {
  sourceNode: string;
  stateHash: string;
  memoryRefId?: string;
  constitutionRef?: string;
  checkpointId?: string;
}

export interface GraphStepEvent {
  step: number;
  timestamp: string;
  agent: AgentRole;
  nodeName: string;
  action: string;
  input: string;
  output: string;
  tokenUsage: { input: number; output: number; costEstimateUsd: number };
  durationMs: number;
  status: EventStatus;
  verdict?: 'PASS' | 'WARN' | 'INTERRUPT' | 'FAIL' | 'BLOCKED';
  decisionRationale?: string;
  selfThinking?: AgentSelfThinking;
  multitaskingContext?: {
    threadId: string;
    laneId: string;
    concurrentTasksRunning: number;
  };
  toolCalls?: ToolExecutionRecord[];
  provenance?: EventProvenanceRecord;
  securityClearanceChecked?: 'NORMAL' | 'ELEVATED' | 'SOVEREIGN_HUMAN';
}

// ==========================================
// 2. MEMORY FABRIC (8 TIERS)
// ==========================================

export type MemoryTier =
  | 'Working'
  | 'Session'
  | 'Episodic'
  | 'Semantic'
  | 'Procedural'
  | 'Preference'
  | 'World'
  | 'Audit';

export interface MemoryItem {
  id: string;
  tier: MemoryTier;
  key: string;
  content: string;
  confidence: number; // 0.0 to 1.0
  provenance: string; // origin source / agent / document
  ttlSeconds: number; // remaining or total
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  tags: string[];
  vector?: number[];
  immutable?: boolean;
}

export interface MemoryCompactionSummary {
  tier: MemoryTier;
  beforeCount: number;
  afterCount: number;
  prunedExpired: number;
  summarizedItems: number;
  bytesSaved: number;
  timestamp: string;
}

// ==========================================
// 3. WORLD MODEL (GRAPH DATABASE SCHEMA)
// ==========================================

export type WorldEntityType =
  | 'Person'
  | 'Project'
  | 'Task'
  | 'Technology'
  | 'Document'
  | 'Capability'
  | 'Risk'
  | 'Goal'
  | 'Agent';

export type WorldRelationType =
  | 'depends_on'
  | 'owns'
  | 'requires'
  | 'creates'
  | 'affects'
  | 'blocks'
  | 'supports';

export interface WorldEntity {
  id: string;
  type: WorldEntityType;
  name: string;
  description: string;
  confidence: number;
  attributes: Record<string, any>;
  x?: number; // visual coordinates
  y?: number;
}

export interface WorldRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: WorldRelationType;
  weight: number; // 0.1 to 1.0
  bidirectional?: boolean;
  provenance: string;
}

export interface CypherQueryResult {
  query: string;
  matchedNodes: WorldEntity[];
  matchedEdges: WorldRelation[];
  executionTimeMs: number;
  explanation: string;
}

// ==========================================
// 4. HYBRID RAG ENGINE
// ==========================================

export interface RagDocument {
  id: string;
  title: string;
  source: string;
  content: string;
  category: string;
  metadata: Record<string, string | number>;
  createdAt: string;
}

export interface RagChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  tokenCount: number;
  metadata: Record<string, any>;
}

export interface RagSearchResult {
  chunk: RagChunk;
  denseScore: number;
  sparseScore: number;
  rrfScore: number;
  crossEncoderScore: number;
  finalScore: number;
  citationMarker: string;
  provenance: string;
}

// ==========================================
// 5. GOVERNANCE & CONSTITUTION
// ==========================================

export interface ConstitutionalRule {
  id: string;
  principle: string;
  description: string;
  category: 'CONTROL' | 'SECURITY' | 'EVIDENCE' | 'ROLLBACK' | 'EXPLAINABILITY';
  isHardConstraint: boolean; // cannot be overridden even by orchestrator
  activeEnforcement: boolean;
  violationCount: number;
}

export interface SecurityViolation {
  id: string;
  timestamp: string;
  violatingAgent: AgentRole;
  attemptedAction: string;
  ruleViolated: string;
  riskRating: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  blocked: boolean;
  reason: string;
}

// ==========================================
// 6. SIMULATION & DIGITAL TWIN
// ==========================================

export interface DigitalTwinState {
  version: string;
  virtualTime: string;
  activeAgents: number;
  activeWorkloads: number;
  syntheticEntropy: number;
  divergenceMetric: number; // discrepancy between physical & virtual state
  simulatedScenariosCount: number;
}

export interface SimulationScenario {
  id: string;
  title: string;
  hypothesis: string;
  injectedFailure?: string;
  expectedOutcome: string;
  actualOutcome?: string;
  confidenceScore: number;
  status: 'PENDING' | 'RUNNING' | 'VERIFIED' | 'REJECTED';
  executionLogs: string[];
}

export interface EvolutionCandidate {
  id: string;
  generation: number;
  targetSubsystem: 'PLANNER' | 'RAG_RERANKER' | 'PROMPT_COMPILER' | 'TOOL_DISPATCHER';
  mutationDescription: string;
  sandboxBenchmarkScore: number; // 0-100
  baselineScore: number;
  promotedToProduction: boolean;
  status: 'SANDBOXED' | 'TESTING' | 'BENCHMARKED' | 'AWAITING_APPROVAL' | 'PROMOTED' | 'DISCARDED';
  rejectionReason?: string;
}

// ==========================================
// 7. MODEL ROUTER & TELEMETRY
// ==========================================

export interface ModelRouteDefinition {
  id: string;
  name: string;
  provider: 'Gemini' | 'OpenAI' | 'vLLM (Local)' | 'Mock Runtime';
  latencyP95Ms: number;
  costPer1kTokens: number;
  capabilities: ('vision' | 'audio' | 'reasoning' | 'code' | 'fast_eval')[];
  health: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  activeUsageCount: number;
}

export interface SystemMetrics {
  totalTokensProcessed: number;
  estimatedCostUsd: number;
  averageLatencyMs: number;
  cacheHitRatio: number;
  activeLangGraphNodes: number;
  governanceAuditsPassed: number;
  activeThreatBlocks: number;
  uptimeSeconds: number;
}
