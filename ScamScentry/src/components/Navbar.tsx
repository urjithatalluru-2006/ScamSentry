'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import {
  Search,
  Bell,
  Sparkles,
  PlusCircle,
  Building2,
  ChevronDown,
  UserCheck,
  Radar,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Edit3,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { UserRole } from '@/types/threat';

export default function Navbar() {
  const {
    brands,
    selectedBrandId,
    setSelectedBrandId,
    selectedBrand,
    setCustomBrandName,
    resetToEmptyState,
    loadSampleTelemetryForCurrentBrand,
    currentUserRole,
    setCurrentUserRole,
    searchQuery,
    setSearchQuery,
    setIsScannerOpen,
    setIsCopilotOpen,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    clearAllNotifications,
    setSelectedThreatId,
  } = useThreat();

  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Custom Brand edit state
  const [customName, setCustomName] = useState(selectedBrand.name);
  const [customDomain, setCustomDomain] = useState(selectedBrand.officialDomains[0] || '');
  const [groqStatus, setGroqStatus] = useState<{ isConfigured: boolean; model: string } | null>(null);

  React.useEffect(() => {
    fetch('/api/groq')
      .then((r) => r.json())
      .then((d) => setGroqStatus(d))
      .catch(() => {});
  }, []);

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    admin: { label: 'Administrator', badge: 'ADMIN', color: 'border-red-500/40 text-red-400 bg-red-500/10' },
    soc_analyst: { label: 'Senior SOC Analyst', badge: 'SOC L2', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    investigator: { label: 'Threat Investigator', badge: 'INTEL', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
    executive: { label: 'Read-Only Executive', badge: 'EXEC', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
  };

  const handleSaveCustomBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setCustomBrandName(customName.trim(), customDomain.trim());
    setIsBrandModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#1f293d] bg-[#090d16]/90 px-4 md:px-6 backdrop-blur-md">
      {/* Brand & Workspace Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ScamSentry - Detect. Protect. Respond."
            className="h-9 md:h-10 w-auto object-contain select-none transition-transform hover:scale-105 duration-200"
          />
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30 font-mono tracking-wider hidden sm:inline-block">
            DRP SOC
          </span>
        </div>

        {/* Brand Selector Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-white">{selectedBrand.name}</span>
            <span className="text-[10px] text-gray-400 hidden sm:inline">({selectedBrand.officialDomains[0]})</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {isBrandDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-lg border border-[#1f293d] bg-[#111726] p-1.5 shadow-2xl shadow-black/90 z-50">
              <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                Select Monitored Brand
              </div>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBrandId(b.id);
                    setCustomName(b.name);
                    setCustomDomain(b.officialDomains[0] || '');
                    setIsBrandDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors ${
                    b.id === selectedBrandId
                      ? 'bg-amber-500/15 text-amber-300 font-medium'
                      : 'text-gray-300 hover:bg-[#192238] hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-[10px] text-gray-400">{b.officialDomains[0]}</div>
                  </div>
                  {b.verified && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
                      Active
                    </span>
                  )}
                </button>
              ))}

              <div className="mt-2 pt-2 border-t border-[#1f293d] space-y-1">
                <button
                  onClick={() => {
                    setIsBrandDropdownOpen(false);
                    setCustomName(selectedBrand.name);
                    setCustomDomain(selectedBrand.officialDomains[0] || '');
                    setIsBrandModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-xs text-amber-400 hover:bg-[#192238] transition font-medium"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Configure / Rename Brand</span>
                </button>

                <button
                  onClick={() => {
                    setIsBrandDropdownOpen(false);
                    resetToEmptyState();
                  }}
                  className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-[#192238] transition font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Close to Empty State (0 Threats)</span>
                </button>

                <button
                  onClick={() => {
                    setIsBrandDropdownOpen(false);
                    loadSampleTelemetryForCurrentBrand();
                  }}
                  className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-xs text-cyan-400 hover:bg-[#192238] transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Load Sample Telemetry</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search & Target Input Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              setIsScannerOpen(true);
            }
          }}
          className="relative w-full"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts or type URL/handle to scan (Press Enter)..."
            className="w-full rounded-lg border border-[#1f293d] bg-[#0e1422] pl-9 pr-8 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </form>
      </div>

      {/* Top Nav Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Groq AI Cloud Connection Badge */}
        {groqStatus?.isConfigured ? (
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Groq AI Active ({groqStatus?.model ? (groqStatus.model.includes('/') ? groqStatus.model.split('/')[1] : groqStatus.model) : 'Online'})</span>
          </span>
        ) : (
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#131b2c] text-gray-400 border border-[#212f4b]">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span>Groq API Key Ready in .env</span>
          </span>
        )}

        {/* On-Demand Live Scan Button */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="relative inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-sm hover:border-amber-400 hover:bg-amber-500/30 transition-all"
        >
          <Radar className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span>Live Scan</span>
        </button>

        {/* AI Copilot Quick Launch */}
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:border-purple-400 hover:bg-purple-500/25 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>AI Copilot</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="relative rounded-lg border border-[#1f293d] bg-[#111726] p-2 text-gray-400 hover:text-white hover:border-gray-600 transition"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm shadow-red-500/50">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-[#1f293d] bg-[#111726] p-2 shadow-2xl shadow-black/90 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#1f293d] px-1">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Real-Time Threat Alerts
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] text-gray-400 hover:text-amber-400"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-xs text-gray-500">No new alerts</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.threatId) setSelectedThreatId(n.threatId);
                        setIsNotifDropdownOpen(false);
                      }}
                      className={`cursor-pointer rounded-lg p-2.5 transition text-left border ${
                        n.read
                          ? 'border-transparent bg-[#0d1320]/60 opacity-60'
                          : 'border-[#1f293d] bg-[#141d30] hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <AlertTriangle className={`h-3 w-3 ${n.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-300 leading-snug">{n.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RBAC Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${roleLabels[currentUserRole].color}`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{roleLabels[currentUserRole].badge}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-[#1f293d] bg-[#111726] p-1.5 shadow-xl shadow-black/80 z-50">
              <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                Switch Security Role
              </div>
              {(['soc_analyst', 'admin', 'investigator', 'executive'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentUserRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition ${
                    currentUserRole === role
                      ? 'bg-amber-500/15 text-amber-300 font-semibold'
                      : 'text-gray-300 hover:bg-[#192238] hover:text-white'
                  }`}
                >
                  <span>{roleLabels[role].label}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-[#090d16] text-gray-400">
                    {roleLabels[role].badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BRAND CUSTOMIZER MODAL */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-amber-500/40 bg-[#111726] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Configure Your Brand Identity</h3>
              </div>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Enter your enterprise brand name and primary domain. All typosquatting checks, heuristic scoring, and abuse reports will immediately adapt to your brand.
            </p>

            <form onSubmit={handleSaveCustomBrand} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  BRAND / COMPANY NAME *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Acme Corp, TechPay, CloudGuard..."
                  className="w-full rounded-lg border border-[#1f293d] bg-[#0d1424] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  OFFICIAL DOMAIN
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. acmepay.com"
                  className="w-full rounded-lg border border-[#1f293d] bg-[#0d1424] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1f293d]">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#1f293d] text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-xs font-bold text-black hover:bg-amber-400 transition"
                >
                  Apply Brand Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
