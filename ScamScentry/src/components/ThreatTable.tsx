'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import { ThreatEntity, Severity, LifecycleStatus } from '@/types/threat';
import {
  ShieldAlert,
  Globe,
  Users,
  Smartphone,
  Network,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  AlertOctagon,
  ShieldCheck,
  XCircle,
  MoreVertical,
} from 'lucide-react';

export default function ThreatTable() {
  const {
    threats,
    filteredThreats,
    setSelectedThreatId,
    setIsCopilotOpen,
    severityFilter,
    setSeverityFilter,
    platformFilter,
    setPlatformFilter,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    updateThreatStatus,
  } = useThreat();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'low':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  const getStatusBadge = (status: LifecycleStatus) => {
    switch (status) {
      case 'detected':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'triaged':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'investigating':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'action_requested':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'resolved':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'false_positive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'phishing_website':
        return <Globe className="h-3.5 w-3.5 text-cyan-400" />;
      case 'social_impersonation':
        return <Users className="h-3.5 w-3.5 text-purple-400" />;
      case 'suspicious_mobile_app':
        return <Smartphone className="h-3.5 w-3.5 text-orange-400" />;
      default:
        return <Network className="h-3.5 w-3.5 text-red-400" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="rounded-xl border border-[#1f293d] bg-[#111726] shadow-xl overflow-hidden flex flex-col">
      {/* Table Filter & Control Header */}
      <div className="p-3.5 border-b border-[#1f293d] bg-[#0d1424] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold text-white tracking-wide">Threat Signals Feed</span>
          <span className="text-[10px] font-mono rounded bg-[#182338] px-2 py-0.5 text-gray-400">
            {filteredThreats.length} findings
          </span>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-[#1f293d] bg-[#111726] px-2.5 py-1 text-xs text-gray-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (75-100)</option>
            <option value="high">High (50-74)</option>
            <option value="medium">Medium (25-49)</option>
            <option value="low">Low (0-24)</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[#1f293d] bg-[#111726] px-2.5 py-1 text-xs text-gray-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="phishing_website">Phishing Domains</option>
            <option value="social_impersonation">Social Impersonation</option>
            <option value="suspicious_mobile_app">Mobile App Risks</option>
            <option value="fraud_campaign">Campaign Clusters</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#1f293d] bg-[#111726] px-2.5 py-1 text-xs text-gray-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Lifecycle Stages</option>
            <option value="detected">Detected</option>
            <option value="triaged">Triaged</option>
            <option value="investigating">Investigating</option>
            <option value="action_requested">Action Requested</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>

          {(severityFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSeverityFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
                setPlatformFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2 px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f293d] bg-[#090e1a] text-[10px] font-mono uppercase tracking-wider text-gray-400">
              <th className="py-2.5 px-3">Entity Identifier</th>
              <th className="py-2.5 px-3">Category & Platform</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Risk Score</th>
              <th className="py-2.5 px-3">Provenance</th>
              <th className="py-2.5 px-3">Lifecycle Status</th>
              <th className="py-2.5 px-3">Detected At</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2438] text-xs">
            {filteredThreats.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-300">
                      {threats.length === 0 ? 'Threat Feed is Empty' : 'No Threat Findings Matching Filter Parameters'}
                    </span>
                    <p className="text-[11px] text-gray-500">
                      {threats.length === 0
                        ? 'Input a domain URL, social media handle, or Android package ID to execute dynamic risk scoring.'
                        : 'Try adjusting your severity, platform, category, or search filters.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredThreats.map((threat) => {
                return (
                  <tr
                    key={threat.id}
                    className="hover:bg-[#141c2e] transition-colors group cursor-pointer"
                    onClick={() => setSelectedThreatId(threat.id)}
                  >
                    {/* Entity Identity */}
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">{getCategoryIcon(threat.category)}</div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                            <span>{threat.name}</span>
                            {threat.campaignName && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {threat.campaignName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono mt-0.5">
                            <span className="truncate max-w-[200px]">{threat.targetIdentifier}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(threat.targetIdentifier, threat.id);
                              }}
                              className="text-gray-500 hover:text-white transition"
                              title="Copy identifier"
                            >
                              {copiedId === threat.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Platform */}
                    <td className="py-3 px-3">
                      <div className="text-gray-300 capitalize text-xs">
                        {threat.category.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 uppercase mt-0.5">
                        {threat.platform.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(
                          threat.severity
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {threat.severity}
                      </span>
                    </td>

                    {/* Risk Score Gauge */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 rounded-full bg-[#1e293b] overflow-hidden">
                          <div
                            style={{ width: `${threat.riskScore}%` }}
                            className={`h-full ${
                              threat.riskScore >= 75
                                ? 'bg-red-500'
                                : threat.riskScore >= 50
                                ? 'bg-orange-500'
                                : threat.riskScore >= 25
                                ? 'bg-amber-400'
                                : 'bg-blue-400'
                            }`}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs text-white">
                          {threat.riskScore}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-500 font-mono">
                        {threat.confidenceScore}% conf.
                      </span>
                    </td>

                    {/* Data Source Provenance */}
                    <td className="py-3 px-3">
                      {threat.dataSource === 'synthetic_demo' ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          SYNTHETIC DEMO
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          LIVE INGESTED
                        </span>
                      )}
                    </td>

                    {/* Lifecycle Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${getStatusBadge(
                          threat.status
                        )}`}
                      >
                        {threat.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-[11px] font-mono text-gray-400">
                      {formatTimestamp(threat.detectedAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedThreatId(threat.id);
                            setIsCopilotOpen(true);
                          }}
                          className="p-1 rounded hover:bg-purple-500/20 text-purple-400 transition"
                          title="Ask Copilot about this finding"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedThreatId(threat.id);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-[#18233a] border border-[#23314f] px-2 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition"
                        >
                          <span>Investigate</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
