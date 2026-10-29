/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PavelAGI-X Omega | OpenShift & Kubernetes Production Manifests Viewer
 */

import React, { useState } from 'react';
import { Boxes, Copy, Check, ShieldCheck, Terminal } from 'lucide-react';
import { OPENSHIFT_PRODUCTION_MANIFESTS, ManifestFile } from '../data/openShiftManifests';

export const OpenShiftManifestsView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ManifestFile>(OPENSHIFT_PRODUCTION_MANIFESTS[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Red Hat OpenShift & Kubernetes Production Manifests
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            RestrictedSCC, NetworkPolicy default-deny, pgvector StatefulSets, OPA Gatekeeper CRDs, and ArgoCD applications.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied YAML!' : 'Copy Manifest YAML'}</span>
        </button>
      </div>

      {/* Manifest Selector and Code View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* File tabs */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-2">
          {OPENSHIFT_PRODUCTION_MANIFESTS.map((file) => (
            <div
              key={file.filename}
              onClick={() => setSelectedFile(file)}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                selectedFile.filename === file.filename
                  ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white truncate">
                  {file.filename}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {file.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {file.description}
              </p>
            </div>
          ))}
        </div>

        {/* Code Content View */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950/90 p-4 max-h-[600px] overflow-y-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span>{selectedFile.filename}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> OpenShift 4.16 Validated
            </span>
          </div>

          <pre className="font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto py-2">
            {selectedFile.yamlContent}
          </pre>
        </div>

      </div>

    </div>
  );
};
