'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Globe,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function ReportsView() {
  const { threats, campaigns, selectedBrand } = useThreat();
  const [reportPeriod, setReportPeriod] = useState('Past 7 Days (Oct 05 - Oct 12, 2026)');

  const totalThreats = threats.length;
  const criticalCount = threats.filter(t => t.severity === 'critical').length;
  const highCount = threats.filter(t => t.severity === 'high').length;
  const resolvedCount = threats.filter(t => t.status === 'resolved').length;
  const falsePositiveCount = threats.filter(t => t.status === 'false_positive').length;
  const falsePositiveRate = ((falsePositiveCount / Math.max(1, totalThreats)) * 100).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      title: `Executive Digital Risk Protection Briefing - ${selectedBrand.name}`,
      generatedAt: new Date().toISOString(),
      reportingPeriod: reportPeriod,
      scope: {
        brand: selectedBrand.name,
        domains: selectedBrand.officialDomains,
        industry: selectedBrand.industry,
      },
      metrics: {
        totalThreats,
        criticalThreats: criticalCount,
        highThreats: highCount,
        resolvedThreats: resolvedCount,
        falsePositiveRate: `${falsePositiveRate}%`,
        activeCampaigns: campaigns.length,
      },
      threatFindings: threats,
      methodology: 'Hybrid rule engine combined with fuzzy lexical string matching and automated sandboxed DOM inspection.',
      limitations: 'Passive DNS telemetry depends on third-party root zone synchronization latency.',
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `DRPP-Executive-Report-${selectedBrand.name}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header and Print Controls */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Executive Threat & Risk Intelligence Reports
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            C-suite & Board ready digital risk briefings with verified attribution and response metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-[#0d1424] px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Raw JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition shadow-md shadow-amber-950/40"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Report Sheet */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-6 space-y-6 text-gray-200 print:bg-white print:text-black print:border-none print:p-0">
        {/* Report Title Header */}
        <div className="border-b border-[#1f293d] pb-4 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              SCAMSENTRY DIGITAL RISK PROTECTION PLATFORM • CONFIDENTIAL
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Executive Threat & Brand Abuse Assessment
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Target Entity: <strong className="text-white">{selectedBrand.name}</strong> • Period: {reportPeriod}
            </p>
          </div>

          <div className="text-right text-[10px] font-mono text-gray-400">
            <div>Classification: TLP:AMBER</div>
            <div>Generated: Oct 12, 2026</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-4 space-y-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wide">
            1. EXECUTIVE RISK SUMMARY
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            During the evaluated monitoring window, ScamSentry detected a total of <strong>{totalThreats} digital risk events</strong> targeting {selectedBrand.name}&apos;s customer ecosystem and brand assets. Of these, <strong>{criticalCount} critical-severity incidents</strong> represented active credential and funds-diversion vectors, predominantly orchestrated through coordinated lookalike domains and impersonated customer support handles.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3">
            <span className="text-[10px] text-gray-400 block">TOTAL THREATS</span>
            <strong className="text-xl text-white">{totalThreats}</strong>
          </div>
          <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3">
            <span className="text-[10px] text-gray-400 block">CRITICAL VECTORS</span>
            <strong className="text-xl text-red-400">{criticalCount}</strong>
          </div>
          <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3">
            <span className="text-[10px] text-gray-400 block">RESOLVED INCIDENTS</span>
            <strong className="text-xl text-emerald-400">{resolvedCount}</strong>
          </div>
          <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3">
            <span className="text-[10px] text-gray-400 block">FALSE POSITIVE RATE</span>
            <strong className="text-xl text-cyan-400">{falsePositiveRate}%</strong>
          </div>
        </div>

        {/* High Risk Entities Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wide">
            2. HIGHEST SEVERITY THREAT FINDINGS
          </h3>
          <div className="rounded-lg border border-[#1b253b] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0d1424] border-b border-[#1b253b] text-[10px] font-mono text-gray-400 uppercase">
                  <th className="p-2.5">Threat Identifier</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">Risk Score</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b253b]">
                {threats.slice(0, 4).map((t) => (
                  <tr key={t.id} className="text-gray-300">
                    <td className="p-2.5 font-semibold text-white font-mono">{t.targetIdentifier}</td>
                    <td className="p-2.5 capitalize">{t.category.replace(/_/g, ' ')}</td>
                    <td className="p-2.5 font-bold uppercase text-red-400">{t.severity}</td>
                    <td className="p-2.5 font-mono text-amber-400">{t.riskScore}/100</td>
                    <td className="p-2.5 uppercase font-mono text-[10px]">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology and Scope Limitations */}
        <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-4 space-y-2 text-xs">
          <h3 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wide">
            3. DETECTION METHODOLOGY & PLATFORM LIMITATIONS
          </h3>
          <p className="text-gray-300 leading-relaxed">
            <strong>Scoring Methodology:</strong> Evaluated using multi-factor normalized criteria incorporating Brand & Executive Similarity (25%), Deceptive Keyword & Intent Patterns (25%), Technical Observable Signals (20%), Target Blast Radius (15%), and Evidence Confidence (15%).
          </p>
          <p className="text-gray-400 text-[11px] leading-relaxed pt-1">
            <strong>Evidentiary Limitations:</strong> This report represents telemetry harvested from authorized open intelligence feeds and brand listening APIs. Findings with insufficient evidence are explicitly flagged as unconfirmed potential threats and mandate manual analyst corroboration before legal takedown initiation.
          </p>
        </div>
      </div>
    </div>
  );
}
