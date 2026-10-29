/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | 8-Tier Memory Fabric Inspector
 */

import React, { useState } from 'react';
import {
  Brain,
  Search,
  Sparkles,
  Lock,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AgiKernel } from '../kernel/agi-kernel';
import { MemoryTier, MemoryItem, MemoryCompactionSummary } from '../types/agi';

interface MemoryViewProps {
  kernel: AgiKernel;
  onRefresh: () => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({ kernel, onRefresh }) => {
  const memoryFabric = kernel.memoryFabric;
  const [selectedTier, setSelectedTier] = useState<MemoryTier | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [compactionSummary, setCompactionSummary] = useState<MemoryCompactionSummary | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New item form state
  const [newTier, setNewTier] = useState<MemoryTier>('Working');
  const [newKey, setNewKey] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('');

  const tiers: MemoryTier[] = [
    'Working',
    'Session',
    'Episodic',
    'Semantic',
    'Procedural',
    'Preference',
    'World',
    'Audit',
  ];

  const handleSearch = () => {
    onRefresh();
  };

  const handleCompaction = (tierToCompact?: MemoryTier) => {
    const summary = memoryFabric.compact(tierToCompact || (selectedTier === 'ALL' ? 'Working' : selectedTier));
    setCompactionSummary(summary);
    onRefresh();
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newContent.trim()) return;

    memoryFabric.store({
      tier: newTier,
      key: newKey.trim(),
      content: newContent.trim(),
      confidence: 0.98,
      provenance: 'Operator Manual Entry',
      ttlSeconds: newTier === 'Working' ? 300 : newTier === 'Session' ? 3600 : 86400 * 30,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setNewKey('');
    setNewContent('');
    setNewTags('');
    setShowAddModal(false);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    try {
      memoryFabric.delete(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Cannot delete immutable record');
    }
  };

  const displayedMemories = searchQuery.trim()
    ? memoryFabric.search(searchQuery, selectedTier === 'ALL' ? undefined : selectedTier)
    : selectedTier === 'ALL'
    ? memoryFabric.getAllMemories()
    : memoryFabric.getMemoriesByTier(selectedTier);

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Compaction Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              8-Tier Memory Fabric Manager
            </h2>
            <span className="text-xs font-mono text-slate-400">
              ({memoryFabric.getAllMemories().length} Total Records)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Stratified cognitive storage with TTL decay, semantic retrieval, and cryptographic audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleCompaction()}
            className="px-3.5 py-1.5 rounded-lg border border-indigo-700 bg-indigo-950/60 hover:bg-indigo-900/80 text-xs font-semibold text-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Prunes expired short-term memories and summarizes stale records"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Compact Working Memory</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory Record</span>
          </button>
        </div>
      </div>

      {/* Compaction Result Notification Banner */}
      {compactionSummary && (
        <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/30 p-3.5 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Compaction completed for <strong>{compactionSummary.tier}</strong> tier:
              pruned {compactionSummary.prunedExpired} expired items, saved {compactionSummary.bytesSaved} bytes of RAM context.
            </span>
          </div>
          <button
            onClick={() => setCompactionSummary(null)}
            className="text-slate-400 hover:text-slate-200 text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tier Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Tier tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setSelectedTier('ALL')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedTier === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tiers ({memoryFabric.getAllMemories().length})
          </button>
          {tiers.map((t) => {
            const count = memoryFabric.getMemoriesByTier(t).length;
            return (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedTier === t
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search key, content, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Memory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedMemories.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-slate-850 rounded-xl">
            No memories match the current search or tier filter.
          </div>
        ) : (
          displayedMemories.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-indigo-300 truncate" title={m.key}>
                    {m.key}
                  </div>
                  
                  {/* Metadata display without static candy pills */}
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <span className="text-cyan-400">{m.tier}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-emerald-400">{(m.confidence * 100).toFixed(0)}% conf</span>
                    {m.immutable && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-400 flex items-center gap-0.5" title="Immutable cryptographic record">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                  {m.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <span>Source: {m.provenance}</span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    TTL: {m.ttlSeconds}s
                  </span>
                </div>

                {!m.immutable && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                    title="Evict memory record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Insert New Memory Item
            </h3>

            <form onSubmit={handleAddMemory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Memory Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as MemoryTier)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                >
                  {tiers.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Identifier Key</label>
                <input
                  type="text"
                  placeholder="e.g. k8s_ingress_tls_policy"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Content / Assertion</label>
                <textarea
                  rows={3}
                  placeholder="Enter the factual statement, policy, or learning..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Comma-separated Tags</label>
                <input
                  type="text"
                  placeholder="k8s, security, ingress, tls"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                >
                  Store Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
