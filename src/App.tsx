/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Proto-AGI Cognitive Operating System Main Shell
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { LangGraphView } from './components/LangGraphView';
import { CognitiveStudioView } from './components/CognitiveStudioView';
import { MemoryView } from './components/MemoryView';
import { WorldModelView } from './components/WorldModelView';
import { RagView } from './components/RagView';
import { GovernorView } from './components/GovernorView';
import { SimulationView } from './components/SimulationView';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { OpenShiftManifestsView } from './components/OpenShiftManifestsView';
import { AuditHarnessView } from './components/AuditHarnessView';
import { kernelInstance } from './kernel/agi-kernel';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mission-control');
  const [, setRevision] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const forceRefresh = () => {
    setRevision((prev) => prev + 1);
  };

  const handleQuickRun = () => {
    setIsExecuting(true);
    setTimeout(() => {
      kernelInstance.langGraph.executeNextStep();
      setIsExecuting(false);
      forceRefresh();
    }, 150);
  };

  const handleReset = () => {
    kernelInstance.langGraph.resetMission();
    forceRefresh();
  };

  const interruptedCount = kernelInstance.langGraph.getState().status === 'INTERRUPTED' ? 1 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        kernel={kernelInstance}
        onQuickRun={handleQuickRun}
        onReset={handleReset}
        isExecuting={isExecuting}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        interruptedCount={interruptedCount}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'mission-control' && (
          <LangGraphView kernel={kernelInstance} onRefresh={forceRefresh} />
        )}
        {activeTab === 'cognitive-hub' && (
          <CognitiveStudioView kernel={kernelInstance} onRefresh={forceRefresh} />
        )}
        {activeTab === 'memory' && (
          <MemoryView kernel={kernelInstance} onRefresh={forceRefresh} />
        )}
        {activeTab === 'world-model' && (
          <WorldModelView kernel={kernelInstance} onRefresh={forceRefresh} />
        )}
        {activeTab === 'rag' && (
          <RagView kernel={kernelInstance} onRefresh={forceRefresh} />
        )}
        {activeTab === 'governance' && (
          <GovernorView kernel={kernelInstance} onRefresh={forceRefresh} />
        )}
        {activeTab === 'simulation' && (
          <SimulationView kernel={kernelInstance} onRefresh={forceRefresh} />
        )}
        {activeTab === 'architecture' && (
          <ArchitectureDocsView />
        )}
        {activeTab === 'manifests' && (
          <OpenShiftManifestsView />
        )}
        {activeTab === 'audits' && (
          <AuditHarnessView kernel={kernelInstance} onRefresh={forceRefresh} />
        )}
      </main>

      {/* Quiet Provenance Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        PavelAGI-X Omega v1.0.0-PROD · Sovereign Human Invariant Control · Zero Autonomous Privilege Escalation · Apache-2.0
      </footer>
    </div>
  );
}
