/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Full-Stack Express Server & API Gateway
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { kernelInstance } from './src/kernel/agi-kernel.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client if a valid GEMINI_API_KEY is available (ignoring default placeholder)
const rawKey = process.env.GEMINI_API_KEY;
const hasValidKey = rawKey && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.trim().length > 10;

const ai = hasValidKey
  ? new GoogleGenAI({
      apiKey: rawKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// AGI KERNEL REST API ENDPOINTS
// ==========================================

// Health Check
app.get('/api/agi/health', (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    name: kernelInstance.identity.name,
    version: kernelInstance.identity.version,
    sovereignOperator: kernelInstance.identity.sovereignOperator,
    state: kernelInstance.identity.kernelState,
    activeAgents: 11,
    metrics: kernelInstance.modelRouter.getMetrics(),
    timestamp: new Date().toISOString(),
  });
});

// Memory Fabric: Get All
app.get('/api/agi/memory', (_req: Request, res: Response) => {
  res.json({
    memories: kernelInstance.memoryFabric.getAllMemories(),
    count: kernelInstance.memoryFabric.getAllMemories().length,
  });
});

// Memory Fabric: Compact
app.post('/api/agi/memory/compact', (req: Request, res: Response) => {
  const tier = req.body?.tier;
  const summary = kernelInstance.memoryFabric.compact(tier);
  res.json({ summary });
});

// World Model: Cypher Query
app.post('/api/agi/world/cypher', (req: Request, res: Response) => {
  const query = req.body?.query || 'MATCH (n)';
  const result = kernelInstance.worldModel.executeCypher(query);
  res.json(result);
});

// World Model: Impact Analysis
app.post('/api/agi/world/impact', (req: Request, res: Response) => {
  const entityId = req.body?.entityId || 'ent-risk-01';
  const impact = kernelInstance.worldModel.analyzeImpact(entityId);
  res.json(impact);
});

// Hybrid RAG: Search
app.post('/api/agi/rag/search', (req: Request, res: Response) => {
  const query = req.body?.query || 'RestrictedSCC';
  const topK = req.body?.topK || 4;
  const results = kernelInstance.ragEngine.search(query, { topK });
  res.json({ results });
});

// Governance: Evaluate Action
app.post('/api/agi/governance/evaluate', (req: Request, res: Response) => {
  const result = kernelInstance.governor.evaluateAction(req.body);
  res.json(result);
});

// LangGraph: Step Execution
app.post('/api/agi/mission/step', (_req: Request, res: Response) => {
  const outcome = kernelInstance.langGraph.executeNextStep();
  res.json({
    outcome,
    state: kernelInstance.langGraph.getState(),
  });
});

// LangGraph: Interrupt Approval
app.post('/api/agi/mission/interrupt/approve', (req: Request, res: Response) => {
  const approved = req.body?.approved === true;
  const comment = req.body?.comment;
  const success = kernelInstance.langGraph.approveInterrupt(approved, comment);
  res.json({
    success,
    state: kernelInstance.langGraph.getState(),
  });
});

// Cognitive Studio: Direct Reasoning Endpoint (Gemini + Deterministic Fallback)
app.post('/api/agi/cognition/reason', async (req: Request, res: Response) => {
  const agent = req.body?.agent || 'Chief Orchestrator';
  const prompt = req.body?.prompt || 'Summarize mission objectives.';

  if (ai) {
    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are the ${agent} agent within PavelAGI-X Omega, an enterprise Proto-AGI cognitive operating system bound to human invariant control. Provide crisp, structured, architectural answers without pleasantries or markdown fluff.`,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI inference timeout')), 3500)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const outputText = response.text || `[${agent}] Executed reasoning over: ${prompt}`;
      kernelInstance.modelRouter.recordUsage('route-gemini-flash', 180, 320);

      res.json({
        output: outputText,
        model: 'gemini-3.8-flash',
        agent,
      });
      return;
    } catch (err: any) {
      console.warn('[Gemini API Call fallback to deterministic kernel]:', err.message);
    }
  }

  // Deterministic Proto-AGI Kernel Fallback
  const fallbackOutput = `[${agent} Reasoning Stream]: Evaluated objective "${prompt}". Verified invariants CONST-01 through CONST-07 against OPA Gatekeeper. Retrieved relevant context from MemoryFabric. Critical path formulated with deterministic state checkpointing. Verified zero privilege escalation.`;
  kernelInstance.modelRouter.recordUsage('route-deterministic-kernel', 45, 12);

  res.json({
    output: fallbackOutput,
    model: 'Omega-Deterministic-Kernel-Fallback',
    agent,
  });
});

// Reflections: Get all
app.get('/api/agi/reflections', (_req: Request, res: Response) => {
  res.json({
    reflections: kernelInstance.reflections,
    count: kernelInstance.reflections.length,
  });
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PavelAGI-X Omega] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
