/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Workspace Navigation Bar
 */

import React from 'react';
import {
  Workflow,
  Brain,
  Network,
  FileSearch,
  ShieldAlert,
  FlaskConical,
  BookOpen,
  Boxes,
  Award,
  Sparkles,
} from 'lucide-react';

export type ActiveTab =
  | 'mission-control'
  | 'cognitive-hub'
  | 'memory'
  | 'world-model'
  | 'rag'
  | 'governance'
  | 'simulation'
  | 'architecture'
  | 'manifests'
  | 'audits';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  interruptedCount: number;
}

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  interruptedCount,
}) => {
  const tabs: TabItem[] = [
    { id: 'mission-control', label: 'Mission Control', icon: Workflow, badge: interruptedCount > 0 ? 'INTERRUPT' : undefined },
    { id: 'cognitive-hub', label: 'Cognitive Studio & Sensory', icon: Sparkles },
    { id: 'memory', label: 'Memory Fabric', icon: Brain },
    { id: 'world-model', label: 'World Model', icon: Network },
    { id: 'rag', label: 'Hybrid RAG', icon: FileSearch },
    { id: 'governance', label: 'Constitution & OPA', icon: ShieldAlert },
    { id: 'simulation', label: 'Digital Twin', icon: FlaskConical },
    { id: 'architecture', label: 'Architecture Specs', icon: BookOpen },
    { id: 'manifests', label: 'OpenShift Manifests', icon: Boxes },
    { id: 'audits', label: 'Audits & Roadmap', icon: Award },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-1.5 py-0.2 rounded animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
