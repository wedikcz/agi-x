/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Hybrid RAG Inspection Workbench
 */

import React, { useState } from 'react';
import {
  FileSearch,
  Search,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AgiKernel } from '../kernel/agi-kernel';
import { RagSearchResult, RagDocument } from '../types/agi';

interface RagViewProps {
  kernel: AgiKernel;
  onRefresh: () => void;
}

export const RagView: React.FC<RagViewProps> = ({ kernel, onRefresh }) => {
  const ragEngine = kernel.ragEngine;
  const documents = ragEngine.getAllDocuments();

  const [query, setQuery] = useState<string>('RestrictedSCC security context capabilities');
  const [searchResults, setSearchResults] = useState<RagSearchResult[]>(() =>
    ragEngine.search('RestrictedSCC security context capabilities', { topK: 4 })
  );
  const [selectedDoc, setSelectedDoc] = useState<RagDocument | null>(documents[0] || null);

  const handleSearch = (qToRun?: string) => {
    const q = qToRun || query;
    if (!q.trim()) return;
    const results = ragEngine.search(q, { topK: 4 });
    setSearchResults(results);
  };

  const sampleQueries = [
    'RestrictedSCC security context capabilities',
    'LangGraph checkpoint persistence and human interrupt',
    'Neo4j World Model entity relations and cypher',
    '8-Tier Memory Fabric compaction and TTL decay',
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Hybrid RAG Retrieval Engine
            </h2>
            <span className="text-xs font-mono text-slate-400">
              ({documents.length} Docs, {ragEngine.getChunkCount()} Chunks)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dense Cosine Embedding + Sparse BM25 + Reciprocal Rank Fusion (RRF k=60) + Cross-Encoder Reranker.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-lg">
          Zero Hallucination Citation Guarantee
        </div>
      </div>

      {/* Search Bar & Samples */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Query technical corpus..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5 justify-center"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Corpus</span>
          </button>
        </div>

        {/* Query suggestion chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Benchmark Queries:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
            >
              {sq.slice(0, 32)}...
            </button>
          ))}
        </div>
      </div>

      {/* RAG Results Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Ranked Retrieved Chunks with Fused Multimodal Scoring
        </h3>

        <div className="space-y-3">
          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-mono text-xs border border-dashed border-slate-850 rounded-xl">
              No matching chunks found. Try another query.
            </div>
          ) : (
            searchResults.map((res, i) => (
              <div
                key={res.chunk.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      Rank #{i + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {res.chunk.documentTitle}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      chunk #{res.chunk.chunkIndex}
                    </span>
                  </div>

                  {/* Citation Marker & Provenance */}
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span className="text-amber-400">{res.citationMarker}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500">{res.provenance}</span>
                  </div>
                </div>

                {/* Chunk Text */}
                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-850">
                  {res.chunk.text}
                </p>

                {/* Score Breakdown Strip */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                  <div>
                    Dense Cosine: <strong className="text-indigo-400">{(res.denseScore * 100).toFixed(0)}%</strong>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div>
                    Sparse BM25: <strong className="text-cyan-400">{res.sparseScore.toFixed(2)}</strong>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div>
                    RRF Score: <strong className="text-amber-400">{res.rrfScore.toFixed(4)}</strong>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div>
                    Cross-Encoder: <strong className="text-emerald-400">{(res.crossEncoderScore * 100).toFixed(0)}%</strong>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div>
                    Composite Match: <strong className="text-white font-bold">{(res.finalScore * 100).toFixed(0)}%</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Corpus Document Browser */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Indexed Ground-Truth Corpus ({documents.length} Files)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`rounded-lg p-3 border transition-colors cursor-pointer ${
                selectedDoc?.id === doc.id
                  ? 'border-indigo-500 bg-indigo-950/30'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-200 truncate">{doc.title}</span>
                <span className="text-cyan-400">{doc.category}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {doc.content}
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-500">
                Source: {doc.source}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
