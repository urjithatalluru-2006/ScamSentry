'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import { Campaign } from '@/types/threat';
import {
  Network,
  ShieldAlert,
  Globe,
  Users,
  Smartphone,
  Terminal,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

export default function CampaignGraph() {
  const { campaigns, setSelectedThreatId, selectedBrand } = useThreat();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || 'camp-miragepay');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#1f293d] bg-[#0c1220] p-10 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
          <Network className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">No Coordinated Campaigns Detected</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Coordinated syndicate clusters appear when multiple threats share C2 reverse proxies, registrar accounts, or cross-platform lure handles. Ingest threats to begin relationship mapping.
        </p>
      </div>
    );
  }

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  const brandName = selectedBrand.name;
  const brandStem = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'brand';

  // Coordinated nodes for Campaign Syndicate
  const graphNodes = [
    {
      id: 'brand-core',
      label: selectedBrand.name,
      sublabel: 'Target Protected Brand',
      type: 'brand',
      x: 350,
      y: 70,
      color: '#3b82f6',
      icon: 'Shield',
      details: 'Registered brand entity containing official domains and trademarks.',
    },
    {
      id: 'camp-core',
      label: activeCampaign.name,
      sublabel: activeCampaign.threatActorGroup || 'Threat Cluster',
      type: 'campaign',
      x: 350,
      y: 190,
      color: '#ef4444',
      icon: 'Campaign',
      details: activeCampaign.description,
    },
    {
      id: 'node-account-1',
      label: `@${brandStem}_support_agent`,
      sublabel: 'Social Lure (X)',
      type: 'account',
      threatId: `threat-${brandStem}-1`,
      x: 120,
      y: 320,
      color: '#a855f7',
      icon: 'Users',
      details: 'Impersonating official support on X to siphon customer complaints.',
      evidence: `Bio links to tinyurl redirecting to ${brandStem}-verify.cc`,
    },
    {
      id: 'node-domain-1',
      label: `${brandStem}-verify.cc`,
      sublabel: 'Central C2 Phish',
      type: 'domain',
      threatId: `threat-${brandStem}-2`,
      x: 350,
      y: 330,
      color: '#06b6d4',
      icon: 'Globe',
      details: 'Harvests 2FA OTP codes and banking credentials.',
      evidence: 'Identical Let\'s Encrypt certificate and reverse proxy C2',
    },
    {
      id: 'node-app-1',
      label: `com.${brandStem}.fastwallet`,
      sublabel: 'Banking Trojan APK',
      type: 'app',
      threatId: `threat-${brandStem}-3`,
      x: 580,
      y: 320,
      color: '#f97316',
      icon: 'Smartphone',
      details: 'Malicious Android package with SMS intercept privileges.',
      evidence: `C2 beacon telemetry points to ${brandStem}-verify.cc API endpoint`,
    },
    {
      id: 'node-ioc-tg',
      label: '@support_resolution_desk',
      sublabel: 'Telegram Command Node',
      type: 'ioc',
      x: 180,
      y: 450,
      color: '#eab308',
      icon: 'Terminal',
      details: 'Shared automated Telegram bot funneling victims.',
      evidence: 'Hardcoded in social bio and APK contact strings',
    },
    {
      id: 'node-ioc-wallet',
      label: '0x71C...a49B',
      sublabel: 'USDT Loot Wallet',
      type: 'ioc',
      x: 520,
      y: 450,
      color: '#eab308',
      icon: 'Terminal',
      details: 'Shared on-chain destination for fraudulent payments.',
      evidence: 'Identified across 3 fake verification contracts',
    },
  ];

  // Connections / Links
  const graphLinks = [
    { source: 'brand-core', target: 'camp-core', label: 'Hostilely Targeted' },
    { source: 'camp-core', target: 'node-account-1', label: 'Syndicated Lure' },
    { source: 'camp-core', target: 'node-domain-1', label: 'Primary C2 Node' },
    { source: 'camp-core', target: 'node-app-1', label: 'Payload Mirror' },
    { source: 'node-account-1', target: 'node-domain-1', label: 'Bio Redirect' },
    { source: 'node-app-1', target: 'node-domain-1', label: 'C2 Exfiltration' },
    { source: 'node-account-1', target: 'node-ioc-tg', label: 'Contact Funnel' },
    { source: 'node-domain-1', target: 'node-ioc-wallet', label: 'Drainer Target' },
  ];

  return (
    <div className="space-y-4">
      {/* Campaign Selector & Header */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-red-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Fraud Campaign & Entity Relationship Intelligence
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Cross-entity correlation engine linking accounts, domains, mobile trojans, and IOCs based on verified infrastructure overlaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase">Select Campaign:</span>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="rounded-lg border border-[#1f293d] bg-[#0d1424] px-3 py-1.5 text-xs text-amber-300 font-semibold focus:border-amber-500 focus:outline-none"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.severity.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive SVG Entity Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-[#1f293d] bg-[#090d16] p-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-2 pt-1 border-b border-[#162033] pb-2">
            <span>GRAPH PROJECTION: INFRASTRUCTURE TOPOLOGY</span>
            <span className="text-amber-400">7 Nodes • 8 Evidence Correlations</span>
          </div>

          <div className="w-full h-[520px] relative overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 700 520">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b4d6e" />
                </marker>
              </defs>

              {/* Connecting Edges */}
              {graphLinks.map((link, idx) => {
                const s = graphNodes.find(n => n.id === link.source)!;
                const t = graphNodes.find(n => n.id === link.target)!;
                return (
                  <g key={idx}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke="#27354f"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      markerEnd="url(#arrow)"
                    />
                    <text
                      x={(s.x + t.x) / 2}
                      y={(s.y + t.y) / 2 - 6}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {link.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {graphNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-110"
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    <circle
                      r={isSelected ? 30 : 24}
                      fill="#111726"
                      stroke={node.color}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="filter drop-shadow-md"
                    />
                    <circle
                      r={isSelected ? 34 : 28}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="1"
                      strokeOpacity="0.3"
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {node.type.substring(0, 3).toUpperCase()}
                    </text>

                    {/* Label below node */}
                    <text
                      textAnchor="middle"
                      dy="40"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {node.label}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="52"
                      fill="#94a3b8"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {node.sublabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono px-2 border-t border-[#162033] pt-2">
            <span>Click any node to inspect telemetry and link evidence</span>
            <span>Algorithm: Force-Directed Telemetry Graph</span>
          </div>
        </div>

        {/* Selected Node Details & Evidence Inspector */}
        <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#1b253b]">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                ENTITY CORRELATION DETAILS
              </span>
              <h3 className="text-sm font-bold text-white mt-1">
                {selectedNode ? selectedNode.label : activeCampaign.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedNode ? selectedNode.sublabel : activeCampaign.description}
              </p>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0d1424] border border-[#1a253c] space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase">OBSERVABLE BEHAVIOR</span>
                <p className="text-gray-200">
                  {selectedNode ? selectedNode.details : 'Multi-channel syndication targeting banking credentials and token authorization.'}
                </p>
              </div>

              {selectedNode?.evidence && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 space-y-1">
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold">
                    CORROBORATING LINK EVIDENCE
                  </span>
                  <p className="text-red-200 text-xs">{selectedNode.evidence}</p>
                </div>
              )}

              <div className="p-3 rounded-lg bg-[#0d1424] border border-[#1a253c] space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase">
                  SHARED INFRASTRUCTURE INDICATORS ({activeCampaign.sharedIndicators.length})
                </span>
                <div className="space-y-1">
                  {activeCampaign.sharedIndicators.map((ind, i) => (
                    <div key={i} className="flex items-center justify-between font-mono text-[11px] text-gray-300">
                      <span className="text-gray-400 uppercase">{ind.type}:</span>
                      <strong className="text-amber-400">{ind.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1b253b] space-y-2">
            {selectedNode?.threatId && (
              <button
                onClick={() => setSelectedThreatId(selectedNode.threatId)}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400 transition"
              >
                <span>Open Deep Threat Investigation</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <div className="text-[10px] text-gray-500 text-center font-mono">
              Campaign Attribution Confidence: 94%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
