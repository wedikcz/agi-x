/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Hybrid RAG Engine
 * Dense Vector + Sparse BM25 + Reciprocal Rank Fusion + Cross-Encoder Reranker
 */

import { RagDocument, RagChunk, RagSearchResult } from '../types/agi';

export class HybridRagEngine {
  private documents: Map<string, RagDocument> = new Map();
  private chunks: RagChunk[] = [];
  private idfMap: Map<string, number> = new Map();

  constructor() {
    this.seedCorpus();
  }

  private seedCorpus(): void {
    const seedDocs: RagDocument[] = [
      {
        id: 'doc-01',
        title: 'OpenShift_Security_Architecture_v4.16.md',
        source: 'Red Hat Enterprise Standards',
        category: 'INFRASTRUCTURE',
        metadata: { classification: 'CONFIDENTIAL', revision: 4.16 },
        createdAt: '2026-10-15T08:00:00Z',
        content: `OpenShift Security Context Constraints (SCC) restrict pod execution privileges. In PavelAGI-X Omega, all agent containers run strictly under RestrictedSCC with readOnlyRootFilesystem enabled. Linux capabilities like CAP_SYS_ADMIN and CAP_NET_ADMIN are explicitly dropped. Pod Security Standards require admission controllers to enforce isolation. Secrets are fetched dynamically from HashiCorp Vault via SPIFFE/SPIRE mutual TLS tokens.`,
      },
      {
        id: 'doc-02',
        title: 'LangGraph_Orchestrator_Invariants_ADR.md',
        source: 'AGI Kernel Core ADR Repository',
        category: 'AGENT_ARCHITECTURE',
        metadata: { classification: 'INTERNAL', revision: 2.1 },
        createdAt: '2026-10-20T11:30:00Z',
        content: `The LangGraph orchestration graph executes non-linear agent tasks. State persistence is backed by PostgreSQL checkpoints with write-ahead logging. If a task requires elevated cluster actions or database migration, the Chief Orchestrator triggers an INTERRUPT event. The graph execution suspends until human cryptographic approval is verified. No node can unilaterally bypass the Security Governor or clear its own interruption.`,
      },
      {
        id: 'doc-03',
        title: 'Neo4j_World_Model_Schema_Spec.md',
        source: 'World Model Knowledge Base',
        category: 'WORLD_MODEL',
        metadata: { classification: 'INTERNAL', revision: 1.0 },
        createdAt: '2026-10-22T14:15:00Z',
        content: `The World Model maintains entities: Person, Project, Task, Technology, Document, Capability, Risk, Goal, Agent. Relationships include depends_on, owns, requires, creates, affects, blocks, and supports. The graph is queried via OpenCypher for real-time impact analysis. When a critical infrastructure incident is registered on Technology node, outbound traversal identifies all blocked Goals and impacted Tasks within 50 milliseconds.`,
      },
      {
        id: 'doc-04',
        title: 'MultiTier_Memory_Compaction_Protocol.md',
        source: 'Cognitive Science & Memory Lab',
        category: 'MEMORY',
        metadata: { classification: 'RESTRICTED', revision: 3.0 },
        createdAt: '2026-10-25T09:45:00Z',
        content: `Memory Fabric maintains 8 tiers: Working, Session, Episodic, Semantic, Procedural, Preference, World, and Audit. Working memory has a 300-second TTL and decays quickly. The compaction daemon scans for low-utility items using recency, frequency, and semantic redundancy metrics. Redundant items are synthesized into high-density episodic summaries, reducing RAM consumption by up to 68% while preserving factual provenance.`,
      },
    ];

    for (const doc of seedDocs) {
      this.indexDocument(doc);
    }
  }

  /**
   * Deterministic simulated semantic embedding for testing & retrieval
   */
  private generateMockEmbedding(text: string, dim: number = 64): number[] {
    const vec: number[] = new Array(dim).fill(0);
    const clean = text.toLowerCase();
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      const slot = (code * (i + 1)) % dim;
      vec[slot] += (code % 10) / 10;
    }
    // L2 Normalize
    let norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vec.map((v) => v / norm);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  public indexDocument(doc: RagDocument, chunkSize: number = 220, overlap: number = 40): void {
    this.documents.set(doc.id, doc);

    // Recursive chunking
    const words = doc.content.split(/\s+/);
    let chunkIndex = 0;
    let i = 0;

    while (i < words.length) {
      const chunkWords = words.slice(i, i + Math.floor(chunkSize / 6));
      const chunkText = chunkWords.join(' ');

      if (chunkText.trim().length > 0) {
        const chunkId = `${doc.id}-chk-${chunkIndex}`;
        const chunk: RagChunk = {
          id: chunkId,
          documentId: doc.id,
          documentTitle: doc.title,
          chunkIndex,
          text: chunkText,
          embedding: this.generateMockEmbedding(chunkText),
          tokenCount: chunkWords.length,
          metadata: { ...doc.metadata, category: doc.category, source: doc.source },
        };
        this.chunks.push(chunk);
        chunkIndex++;
      }

      i += Math.max(1, Math.floor((chunkSize - overlap) / 6));
    }

    this.recomputeIdf();
  }

  private recomputeIdf(): void {
    this.idfMap.clear();
    const totalDocs = this.chunks.length;
    const docFrequency = new Map<string, number>();

    for (const chunk of this.chunks) {
      const tokens = new Set(chunk.text.toLowerCase().split(/[^a-z0-9_]+/).filter(Boolean));
      for (const tok of tokens) {
        docFrequency.set(tok, (docFrequency.get(tok) || 0) + 1);
      }
    }

    for (const [tok, count] of docFrequency.entries()) {
      // Standard BM25 IDF formulation
      this.idfMap.set(tok, Math.log(1 + (totalDocs - count + 0.5) / (count + 0.5)));
    }
  }

  /**
   * BM25 Sparse Lexical Scoring
   */
  private scoreBm25(queryTokens: string[], chunk: RagChunk): number {
    const k1 = 1.5;
    const b = 0.75;
    const avgLen = 30; // nominal average chunk token count
    const chunkTokens = chunk.text.toLowerCase().split(/[^a-z0-9_]+/).filter(Boolean);
    const docLen = chunkTokens.length;

    let score = 0;
    for (const token of queryTokens) {
      const idf = this.idfMap.get(token) || 0.1;
      const tf = chunkTokens.filter((t) => t === token).length;
      if (tf > 0) {
        const num = tf * (k1 + 1);
        const denom = tf + k1 * (1 - b + b * (docLen / avgLen));
        score += idf * (num / denom);
      }
    }
    return score;
  }

  /**
   * Hybrid Search with RRF and Simulated Cross-Encoder Reranker
   */
  public search(query: string, options?: { topK?: number; categoryFilter?: string }): RagSearchResult[] {
    const topK = options?.topK || 4;
    const categoryFilter = options?.categoryFilter;
    const queryTokens = query.toLowerCase().split(/[^a-z0-9_]+/).filter((t) => t.length > 2);
    const queryEmbedding = this.generateMockEmbedding(query);

    let candidates = this.chunks;
    if (categoryFilter) {
      candidates = candidates.filter((c) => c.metadata?.category === categoryFilter);
    }

    // 1. Compute Dense Similarity
    const denseScores = candidates.map((chunk) => ({
      chunk,
      score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
    }));
    denseScores.sort((a, b) => b.score - a.score);

    // 2. Compute Sparse BM25
    const sparseScores = candidates.map((chunk) => ({
      chunk,
      score: this.scoreBm25(queryTokens, chunk),
    }));
    sparseScores.sort((a, b) => b.score - a.score);

    // 3. Reciprocal Rank Fusion (RRF)
    const k = 60;
    const rrfMap = new Map<string, { chunk: RagChunk; denseRank: number; sparseRank: number; rrf: number }>();

    denseScores.forEach((item, rank) => {
      rrfMap.set(item.chunk.id, {
        chunk: item.chunk,
        denseRank: rank + 1,
        sparseRank: candidates.length + 1,
        rrf: 1 / (k + rank + 1),
      });
    });

    sparseScores.forEach((item, rank) => {
      const existing = rrfMap.get(item.chunk.id);
      if (existing) {
        existing.sparseRank = rank + 1;
        existing.rrf += 1 / (k + rank + 1);
      } else {
        rrfMap.set(item.chunk.id, {
          chunk: item.chunk,
          denseRank: candidates.length + 1,
          sparseRank: rank + 1,
          rrf: 1 / (k + rank + 1),
        });
      }
    });

    const fused = Array.from(rrfMap.values());
    fused.sort((a, b) => b.rrf - a.rrf);

    // 4. Cross-Encoder simulated reranking on top 8 candidates
    const topCandidates = fused.slice(0, 8);
    const results: RagSearchResult[] = topCandidates.map((cand) => {
      const dense = denseScores.find((d) => d.chunk.id === cand.chunk.id)?.score || 0;
      const sparse = sparseScores.find((s) => s.chunk.id === cand.chunk.id)?.score || 0;

      // Cross-encoder simulates multi-head attention over [query, chunkText]
      const exactOverlap = queryTokens.filter((q) => cand.chunk.text.toLowerCase().includes(q)).length;
      const crossEncoderScore = Math.min(1.0, 0.4 * dense + 0.3 * (sparse / 4) + 0.3 * (exactOverlap / (queryTokens.length || 1)));

      const finalScore = Math.round((0.5 * crossEncoderScore + 0.5 * (cand.rrf * 30)) * 100) / 100;

      return {
        chunk: cand.chunk,
        denseScore: Math.round(dense * 100) / 100,
        sparseScore: Math.round(sparse * 100) / 100,
        rrfScore: Math.round(cand.rrf * 1000) / 1000,
        crossEncoderScore: Math.round(crossEncoderScore * 100) / 100,
        finalScore,
        citationMarker: `[${cand.chunk.documentTitle} #chk-${cand.chunk.chunkIndex}]`,
        provenance: `${cand.chunk.metadata?.source || 'Internal Repo'} (v${cand.chunk.metadata?.revision || '1.0'})`,
      };
    });

    results.sort((a, b) => b.finalScore - a.finalScore);
    return results.slice(0, topK);
  }

  public getAllDocuments(): RagDocument[] {
    return Array.from(this.documents.values());
  }

  public getChunkCount(): number {
    return this.chunks.length;
  }
}
