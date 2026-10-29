/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Hybrid RAG Engine Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { HybridRagEngine } from '../rag/hybrid-rag';

test('Hybrid RAG: Document Indexing & Chunk Overlap', () => {
  const rag = new HybridRagEngine();
  const initialDocs = rag.getAllDocuments().length;
  const initialChunks = rag.getChunkCount();

  rag.indexDocument({
    id: 'doc-test-01',
    title: 'PostQuantum_Cryptography_Standard.md',
    source: 'NIST Standards',
    category: 'SECURITY',
    metadata: { standard: 'FIPS-203' },
    createdAt: new Date().toISOString(),
    content: 'ML-KEM and ML-DSA are standardized quantum-resistant key-encapsulation mechanisms. In PavelAGI-X Omega, audit signatures use CRYSTALS-Dilithium to ensure zero decryption risk from future Shor algorithm quantum computers.',
  });

  assert.equal(rag.getAllDocuments().length, initialDocs + 1);
  assert.ok(rag.getChunkCount() > initialChunks);
});

test('Hybrid RAG: Exact Technical Term Retrieval Precision', () => {
  const rag = new HybridRagEngine();

  // Querying exact technical term "RestrictedSCC"
  const results = rag.search('RestrictedSCC readOnlyRootFilesystem', { topK: 3 });
  assert.ok(results.length > 0);

  const top = results[0];
  assert.ok(top.chunk.text.includes('RestrictedSCC') || top.chunk.text.includes('readOnlyRootFilesystem'));
  assert.ok(top.finalScore > 0);
  assert.ok(top.citationMarker.startsWith('['));
  assert.ok(top.provenance.length > 0);
});

test('Hybrid RAG: Reciprocal Rank Fusion Consistency', () => {
  const rag = new HybridRagEngine();

  // Search with broad conceptual query
  const res = rag.search('LangGraph checkpoint write-ahead state rollbacks', { topK: 2 });
  assert.ok(res.length > 0);

  // Scores must be bounded between 0 and 1
  for (const r of res) {
    assert.ok(r.denseScore >= 0 && r.denseScore <= 1);
    assert.ok(r.rrfScore > 0);
    assert.ok(r.finalScore >= 0 && r.finalScore <= 1);
  }
});
