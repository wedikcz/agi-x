/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | Architecture & Specification Repository (38 Sections)
 */

import React, { useState } from 'react';
import { BookOpen, Copy, Check, Search, ChevronRight } from 'lucide-react';
import { ARCHITECTURE_SECTIONS, DocSection } from '../data/architectureDocs';

export const ArchitectureDocsView: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<DocSection>(ARCHITECTURE_SECTIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = [
    'ALL',
    'Foundation & Strategy',
    'Data & Schemas',
    'Cognitive & Agents',
    'Security & Governance',
    'Infrastructure & Operations',
  ];

  const filteredSections = ARCHITECTURE_SECTIONS.filter((sec) => {
    if (selectedCategory !== 'ALL' && sec.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.markdownContent.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedSection.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Comprehensive Architectural Specifications (38 Sections)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full enterprise Proto-AGI blueprint, ADRs, DDD contexts, schemas, security threat models, and operational runbooks.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Markdown!' : 'Copy Section Markdown'}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search specifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Two-Pane Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Table of Contents sidebar */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3 max-h-[620px] overflow-y-auto space-y-1">
          {filteredSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSection(sec)}
              className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                selectedSection.id === sec.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="truncate pr-2">
                <div>{sec.title}</div>
                <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                  {sec.summary}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
            </button>
          ))}
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950/80 p-6 max-h-[620px] overflow-y-auto font-sans text-xs leading-relaxed text-slate-300">
          <div className="prose prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:text-slate-200 prose-headings:text-slate-100 prose-headings:font-bold prose-a:text-indigo-400">
            <pre className="whitespace-pre-wrap font-sans bg-transparent border-0 p-0 text-slate-200 text-xs">
              {selectedSection.markdownContent}
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
};
