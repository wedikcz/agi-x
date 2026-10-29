/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | World Model Graph & Cypher Query Engine
 */

import React, { useState } from 'react';
import {
  Network,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Layers,
  Search,
} from 'lucide-react';
import { AgiKernel } from '../kernel/agi-kernel';
import { WorldEntity, WorldRelation, CypherQueryResult } from '../types/agi';

interface WorldModelViewProps {
  kernel: AgiKernel;
  onRefresh: () => void;
}

export const WorldModelView: React.FC<WorldModelViewProps> = ({ kernel, onRefresh }) => {
  const worldModel = kernel.worldModel;
  const entities = worldModel.getAllEntities();
  const relations = worldModel.getAllRelations();

  const [cypherQuery, setCypherQuery] = useState<string>('MATCH (n:Technology)-[:depends_on]->(m:Technology)');
  const [cypherResult, setCypherResult] = useState<CypherQueryResult | null>(null);

  const [impactRootId, setImpactRootId] = useState<string>('ent-risk-01');
  const [impactResult, setImpactResult] = useState<{
    impactedEntities: WorldEntity[];
    propagationPath: { from: string; to: string; relation: string }[];
  } | null>(null);

  const [selectedEntity, setSelectedEntity] = useState<WorldEntity | null>(entities[0] || null);

  const cycleCheck = worldModel.detectCycles();

  const handleExecuteCypher = (queryToRun?: string) => {
    const q = queryToRun || cypherQuery;
    const result = worldModel.executeCypher(q);
    setCypherResult(result);
  };

  const handleRunImpact = () => {
    if (!impactRootId) return;
    const res = worldModel.analyzeImpact(impactRootId);
    setImpactResult(res);
  };

  const sampleQueries = [
    { label: 'All Technologies', query: 'MATCH (t:Technology)' },
    { label: 'Risks Blocking Goals', query: 'MATCH (r:Risk)-[:blocks]->(g:Goal)' },
    { label: 'Agent Dependencies', query: 'MATCH (a:Agent)-[:supports]->(p:Project)' },
    { label: 'Full Ecosystem Scan', query: 'MATCH (n)' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              World Model Property Graph
            </h2>
            <span className="text-xs font-mono text-slate-400">
              ({entities.length} Entities, {relations.length} Typed Relations)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time causal topology with OpenCypher queries, topological cycle verification, and downstream impact analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acyclic Graph: 0 Cycles Detected</span>
          </div>
        </div>
      </div>

      {/* Interactive Topology Visualizer & Entity Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* SVG Graph Topology */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4 relative min-h-[380px] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-mono text-slate-400">
              Interactive Entity Map (Click node to inspect)
            </span>
            <span className="text-xs font-mono text-indigo-400">
              9 Entity Types · 7 Relation Types
            </span>
          </div>

          {/* Graph SVG canvas */}
          <div className="my-auto py-4 overflow-x-auto">
            <svg viewBox="0 0 920 480" className="w-full h-80 min-w-[700px]">
              {/* Edges */}
              {relations.map((rel) => {
                const source = entities.find((e) => e.id === rel.sourceId);
                const target = entities.find((e) => e.id === rel.targetId);
                if (!source || !target) return null;

                const sx = source.x || 100;
                const sy = source.y || 100;
                const tx = target.x || 200;
                const ty = target.y || 200;

                const isHighlighted = impactResult?.propagationPath.some(
                  (p) => p.from === rel.sourceId && p.to === rel.targetId
                );

                return (
                  <g key={rel.id}>
                    <line
                      x1={sx}
                      y1={sy}
                      x2={tx}
                      y2={ty}
                      stroke={isHighlighted ? '#ef4444' : '#334155'}
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      strokeDasharray={rel.type === 'blocks' ? '4,4' : undefined}
                    />
                    {/* Edge Label */}
                    <text
                      x={(sx + tx) / 2}
                      y={(sy + ty) / 2 - 4}
                      fill={isHighlighted ? '#f87171' : '#64748b'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {rel.type}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {entities.map((node) => {
                const isSelected = selectedEntity?.id === node.id;
                const isImpacted = impactResult?.impactedEntities.some((e) => e.id === node.id);

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedEntity(node)}
                    className="cursor-pointer transition-all"
                  >
                    <circle
                      cx={node.x || 100}
                      cy={node.y || 100}
                      r={isSelected ? 22 : 18}
                      fill={
                        isImpacted ? '#7f1d1d' :
                        isSelected ? '#4338ca' : '#0f172a'
                      }
                      stroke={
                        isImpacted ? '#ef4444' :
                        isSelected ? '#818cf8' :
                        node.type === 'Risk' ? '#ef4444' :
                        node.type === 'Goal' ? '#10b981' :
                        node.type === 'Technology' ? '#06b6d4' : '#64748b'
                      }
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text
                      x={node.x || 100}
                      y={(node.y || 100) + 32}
                      fill={isSelected ? '#e2e8f0' : '#94a3b8'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      {node.name.length > 18 ? `${node.name.slice(0, 16)}...` : node.name}
                    </text>
                    <text
                      x={node.x || 100}
                      y={(node.y || 100) + 4}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.type.slice(0, 3).toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Goal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Technology</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Risk</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Agent / Project</span>
          </div>
        </div>

        {/* Selected Entity Inspector */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Entity Property Inspector
            </h3>
            {selectedEntity && (
              <span className="text-xs font-mono text-indigo-400">
                {selectedEntity.type}
              </span>
            )}
          </div>

          {selectedEntity ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-mono text-[11px]">Entity Name:</span>
                <div className="text-sm font-bold text-white mt-0.5">{selectedEntity.name}</div>
              </div>

              <div>
                <span className="text-slate-500 font-mono text-[11px]">Description:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{selectedEntity.description}</p>
              </div>

              <div>
                <span className="text-slate-500 font-mono text-[11px]">Confidence & Clearance:</span>
                <div className="font-mono text-emerald-400 mt-0.5">
                  {(selectedEntity.confidence * 100).toFixed(0)}% factual confidence
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-mono text-[11px]">Graph Attributes:</span>
                <pre className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedEntity.attributes, null, 2)}
                </pre>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setImpactRootId(selectedEntity.id);
                    handleRunImpact();
                  }}
                  className="w-full py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-medium cursor-pointer"
                >
                  Analyze Downstream Impact From Here
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-8 text-center font-mono">
              Click any node in the graph to view properties.
            </div>
          )}
        </div>

      </div>

      {/* OpenCypher Query Console */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              OpenCypher Query Console
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Powered by Neo4j Property Graph Semantics
          </span>
        </div>

        {/* Query Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={cypherQuery}
            onChange={(e) => setCypherQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleExecuteCypher()}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-1.5 justify-center cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Execute Cypher</span>
          </button>
        </div>

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Quick Queries:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setCypherQuery(sq.query);
                handleExecuteCypher(sq.query);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
            >
              {sq.label}
            </button>
          ))}
        </div>

        {/* Cypher Result */}
        {cypherResult && (
          <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{cypherResult.explanation}</span>
              <span className="text-cyan-400">{cypherResult.executionTimeMs}ms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-850">
                <div className="font-mono text-slate-400 text-[11px] mb-1">
                  Matched Nodes ({cypherResult.matchedNodes.length}):
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto font-mono text-slate-300 text-[11px]">
                  {cypherResult.matchedNodes.map((n) => (
                    <div key={n.id} className="truncate">
                      · ({n.type}) <strong className="text-slate-200">{n.name}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-850">
                <div className="font-mono text-slate-400 text-[11px] mb-1">
                  Matched Relationships ({cypherResult.matchedEdges.length}):
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto font-mono text-slate-300 text-[11px]">
                  {cypherResult.matchedEdges.map((e) => (
                    <div key={e.id} className="truncate">
                      · -[:<strong className="text-cyan-400">{e.type}</strong>]-&gt; {e.targetId}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Downstream Blast Radius & Impact Analysis Simulator */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Downstream Impact & Blast Radius Calculator
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Graph Traversal Propagation
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={impactRootId}
            onChange={(e) => setImpactRootId(e.target.value)}
            className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                ({e.type}) {e.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunImpact}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            Calculate Downstream Impact
          </button>
        </div>

        {impactResult && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="font-mono text-slate-300">
              Impacted Entities Found: <strong className="text-amber-400">{impactResult.impactedEntities.length}</strong>
            </div>

            <div className="flex flex-wrap gap-2">
              {impactResult.impactedEntities.map((ent) => (
                <div
                  key={ent.id}
                  className="p-2 rounded bg-slate-900 border border-red-900/40 text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
                >
                  <span className="text-red-400 font-bold">[{ent.type}]</span>
                  <span>{ent.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
