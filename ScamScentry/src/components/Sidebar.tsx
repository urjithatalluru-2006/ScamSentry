'use client';

import React from 'react';
import { useThreat } from '@/context/ThreatContext';
import {
  LayoutDashboard,
  Radio,
  Users,
  Globe,
  Smartphone,
  Network,
  FolderGit2,
  Sparkles,
  ShieldCheck,
  FileBarChart,
  Building,
  Cpu,
  FileClock,
  ExternalLink,
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, threats, campaigns, connectors } = useThreat();

  const socialCount = threats.filter(t => t.category === 'social_impersonation' && t.status !== 'resolved').length;
  const domainCount = threats.filter(t => t.category === 'phishing_website' && t.status !== 'resolved').length;
  const mobileCount = threats.filter(t => t.category === 'suspicious_mobile_app' && t.status !== 'resolved').length;
  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;
  const activeCasesCount = threats.filter(t => t.status === 'investigating' || t.status === 'triaged').length;
  const pendingTakedownsCount = threats.filter(t => t.status === 'action_requested').length;

  const navSections = [
    {
      group: 'THREAT OPERATIONS',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'threat_feed', label: 'Threat Intelligence', icon: Radio, count: threats.length },
        { id: 'social_impersonation', label: 'Social Impersonation', icon: Users, count: socialCount },
        { id: 'phishing_website', label: 'Domains & Phishing', icon: Globe, count: domainCount },
        { id: 'suspicious_mobile_app', label: 'Mobile App Risks', icon: Smartphone, count: mobileCount },
        { id: 'campaigns', label: 'Scam Campaigns', icon: Network, count: activeCampaignsCount, badgeColor: 'bg-red-500/20 text-red-400' },
      ],
    },
    {
      group: 'INVESTIGATION & RESPONSE',
      items: [
        { id: 'investigations', label: 'Investigation Cases', icon: FolderGit2, count: activeCasesCount },
        { id: 'copilot', label: 'AI Copilot Assistant', icon: Sparkles, highlight: true },
        { id: 'response', label: 'Response & Takedown', icon: ShieldCheck, count: pendingTakedownsCount, badgeColor: 'bg-amber-500/20 text-amber-400' },
        { id: 'reports', label: 'Executive Reports', icon: FileBarChart },
      ],
    },
    {
      group: 'ASSETS & INTEGRATIONS',
      items: [
        { id: 'brand_assets', label: 'Brand Asset Inventory', icon: Building },
        { id: 'connectors', label: 'Monitoring Connectors', icon: Cpu, count: connectors.length },
        { id: 'audit', label: 'Security Audit Trail', icon: FileClock },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#1f293d] bg-[#0b0f19] flex flex-col justify-between hidden md:flex">
      <div className="py-4 px-3 space-y-6 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase">
              {section.group}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                        : item.highlight
                        ? 'text-purple-300 hover:bg-purple-500/10 hover:text-purple-200'
                        : 'text-gray-400 hover:bg-[#131b2c] hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : item.highlight ? 'text-purple-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          item.badgeColor || (isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-[#182236] text-gray-400')
                        }`}
                      >
                        {item.count}
                      </span>
                    )}

                    {item.highlight && !item.count && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer System Status Banner */}
      <div className="p-3 border-t border-[#1f293d] bg-[#090d16]">
        <div className="rounded-lg bg-[#111726] border border-[#1f293d] p-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              DRP Engine Online
            </span>
            <span className="text-[10px] font-mono text-emerald-400">99.98%</span>
          </div>
          <p className="mt-1 text-[10px] text-gray-500 leading-tight">
            Hybrid scoring active. All telemetry verified against registered assets.
          </p>
        </div>
      </div>
    </aside>
  );
}
