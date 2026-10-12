'use client';

import React from 'react';
import { useThreat } from '@/context/ThreatContext';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Search,
  Globe,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export default function MetricCards() {
  const { threats, campaigns, setSeverityFilter, setCategoryFilter, setStatusFilter, setActiveTab } = useThreat();

  const totalThreats = threats.length;
  const criticalHigh = threats.filter(t => t.severity === 'critical' || t.severity === 'high').length;
  const requiringInvestigation = threats.filter(t => t.status === 'investigating' || t.status === 'triaged' || t.status === 'detected').length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const suspiciousDomains = threats.filter(t => t.category === 'phishing_website').length;
  const suspiciousApps = threats.filter(t => t.category === 'suspicious_mobile_app').length;
  const resolvedCount = threats.filter(t => t.status === 'resolved').length;

  // Real-time calculation of Mean Time To Resolution (MTTR)
  const resolvedWithTimelines = threats.filter(t => t.status === 'resolved' && t.detectedAt);
  let avgHoursDisplay = '--';
  if (resolvedWithTimelines.length > 0) {
    const totalMs = resolvedWithTimelines.reduce((acc, curr) => {
      const detected = new Date(curr.detectedAt).getTime();
      const resolved = curr.timeline.find(tl => tl.type === 'resolution');
      const resTime = resolved ? new Date(resolved.timestamp).getTime() : new Date().getTime();
      return acc + (resTime - detected);
    }, 0);
    const avgHours = Number((totalMs / resolvedWithTimelines.length / (1000 * 60 * 60)).toFixed(1));
    avgHoursDisplay = `${avgHours}h`;
  }

  const cards = [
    {
      title: 'Total Detected Threats',
      value: totalThreats,
      subtitle: totalThreats === 0 ? 'Clean surface (0 findings)' : `${totalThreats} active findings`,
      icon: ShieldAlert,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      onClick: () => {
        setSeverityFilter('all');
        setStatusFilter('all');
        setCategoryFilter('all');
        setActiveTab('threat_feed');
      },
    },
    {
      title: 'Critical & High Risks',
      value: criticalHigh,
      subtitle: totalThreats === 0 ? '0 critical risks' : `${((criticalHigh / totalThreats) * 100).toFixed(0)}% of total volume`,
      icon: Flame,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      badge: criticalHigh > 0 ? 'Action Required' : undefined,
      onClick: () => {
        setSeverityFilter('critical');
        setActiveTab('threat_feed');
      },
    },
    {
      title: 'Active Investigations',
      value: requiringInvestigation,
      subtitle: requiringInvestigation === 0 ? 'Queue clear' : 'Triage & analysis queue',
      icon: Search,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      onClick: () => {
        setStatusFilter('investigating');
        setActiveTab('investigations');
      },
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      subtitle: activeCampaigns === 0 ? '0 linked clusters' : 'Coordinated clusters',
      icon: AlertTriangle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      onClick: () => {
        setActiveTab('campaigns');
      },
    },
    {
      title: 'Phishing Domains',
      value: suspiciousDomains,
      subtitle: suspiciousDomains === 0 ? '0 lookalikes detected' : 'Lookalikes & spoofed URLs',
      icon: Globe,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      onClick: () => {
        setCategoryFilter('phishing_website');
        setActiveTab('phishing_website');
      },
    },
    {
      title: 'Rogue Mobile Apps',
      value: suspiciousApps,
      subtitle: suspiciousApps === 0 ? '0 rogue packages' : 'Third-party APK & store clones',
      icon: Smartphone,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      onClick: () => {
        setCategoryFilter('suspicious_mobile_app');
        setActiveTab('suspicious_mobile_app');
      },
    },
    {
      title: 'Threats Neutralized',
      value: resolvedCount,
      subtitle: resolvedCount === 0 ? '0 resolved incidents' : 'Takedown success 100%',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      onClick: () => {
        setStatusFilter('resolved');
        setActiveTab('response');
      },
    },
    {
      title: 'Mean Time to Resolve',
      value: avgHoursDisplay,
      subtitle: resolvedWithTimelines.length === 0 ? 'Awaiting resolutions' : 'Calculated from live timeline',
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      onClick: () => {
        setActiveTab('reports');
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            onClick={c.onClick}
            className={`group cursor-pointer rounded-xl border ${c.borderColor} bg-[#111726] p-3.5 hover:bg-[#151e33] transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-black/60 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-400 tracking-wide">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-lg ${c.bgColor} ${c.color} border border-white/5`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono tracking-tight text-white group-hover:text-amber-300 transition-colors">
                {c.value}
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-amber-400 transition-colors" />
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
              <span>{c.subtitle}</span>
              {c.badge && (
                <span className="rounded bg-red-500/15 px-1 py-0.2 font-semibold text-red-400 font-mono">
                  {c.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
