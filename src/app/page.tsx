'use client';

import React, { useEffect } from 'react';
import { ThreatProvider, useThreat } from '@/context/ThreatContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MetricCards from '@/components/MetricCards';
import ThreatAnalyticsCharts from '@/components/Charts';
import ThreatTable from '@/components/ThreatTable';
import InvestigationDrawer from '@/components/InvestigationDrawer';
import AICopilotModal from '@/components/AICopilotModal';
import LiveScannerModal from '@/components/LiveScannerModal';
import CampaignGraph from '@/components/CampaignGraph';
import ResponseCenterView from '@/components/ResponseCenterView';
import BrandAssetManager from '@/components/BrandAssetManager';
import ConnectorsView from '@/components/ConnectorsView';
import ReportsView from '@/components/ReportsView';
import AuditLogView from '@/components/AuditLogView';
import QuickTargetInputBar from '@/components/QuickTargetInputBar';
import {
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
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

function DashboardContent() {
  const {
    activeTab,
    selectedBrand,
    setCategoryFilter,
    setStatusFilter,
    threats,
    campaigns,
    setIsScannerOpen,
    setIsCopilotOpen,
    loadSampleTelemetryForCurrentBrand,
    resetToEmptyState,
  } = useThreat();

  // Synchronize category filters when switching tabs
  useEffect(() => {
    if (activeTab === 'social_impersonation') {
      setCategoryFilter('social_impersonation');
    } else if (activeTab === 'phishing_website') {
      setCategoryFilter('phishing_website');
    } else if (activeTab === 'suspicious_mobile_app') {
      setCategoryFilter('suspicious_mobile_app');
    } else if (activeTab === 'investigations') {
      setStatusFilter('investigating');
    } else if (activeTab === 'overview' || activeTab === 'threat_feed') {
      setCategoryFilter('all');
      setStatusFilter('all');
    }
  }, [activeTab, setCategoryFilter, setStatusFilter]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#070a12] overflow-y-auto">
      <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Workspace Banner */}
        <div className="rounded-xl border border-[#1f293d] bg-gradient-to-r from-[#111726] to-[#0c1220] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-1.5 shadow-sm shadow-amber-500/10">
              <img src="/logo-icon.png" alt="ScamSentry Shield" className="h-6 w-6 object-contain select-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
                  Digital Risk Protection Platform
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  {threats.length === 0 ? 'CLEAN EMPTY STATE' : `${threats.length} THREATS MONITORED`}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Protecting <strong className="text-amber-400">{selectedBrand.name}</strong> • Official Domain:{' '}
                <span className="font-mono text-gray-300">{selectedBrand.officialDomains[0]}</span> • Sensitivity:{' '}
                <span className="font-mono text-emerald-400 uppercase">{selectedBrand.monitoringSensitivity}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {threats.length === 0 ? (
              <button
                onClick={loadSampleTelemetryForCurrentBrand}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white hover:border-cyan-500 transition"
              >
                <span>Load Sample Threats</span>
              </button>
            ) : (
              <button
                onClick={resetToEmptyState}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-red-400 transition"
              >
                <span>Clear to Empty State</span>
              </button>
            )}

            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition"
            >
              <span>Scan New Target</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/25 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask Copilot</span>
            </button>
          </div>
        </div>

        {/* Quick Dynamic Target Scanner Input Bar */}
        <QuickTargetInputBar />

        {/* Clean Empty State Card if no threats */}
        {threats.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#1f293d] bg-[#0c1220] p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Clean Threat Surface for {selectedBrand.name}</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              No active digital risk entities detected. Use the Live Threat Scanner to evaluate custom URLs, social handles, or mobile apps, or load realistic sample telemetry to test response workflows.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-amber-400"
              >
                Scan Target Now
              </button>
              <button
                onClick={loadSampleTelemetryForCurrentBrand}
                className="rounded-lg border border-[#1f293d] bg-[#111726] px-3.5 py-1.5 text-xs font-medium text-cyan-300 hover:text-white"
              >
                Load Sample Telemetry for {selectedBrand.name}
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MetricCards />
            <ThreatAnalyticsCharts />
            <ThreatTable />
          </div>
        )}

        {/* TAB 2: THREAT INTELLIGENCE (FEED) */}
        {activeTab === 'threat_feed' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Global Threat Intelligence Feed
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Continuous automated discovery across web crawlers, social listening APIs, certificate transparency, and third-party mirrors.
              </p>
            </div>
            <ThreatTable />
          </div>
        )}

        {/* TAB 3: SOCIAL IMPERSONATION */}
        {activeTab === 'social_impersonation' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
              <div className="flex items-center gap-2 text-purple-300">
                <Users className="h-5 w-5" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Social Media Impersonation & VIP Protection
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Detects deceptive handles, executive impersonation, fake customer support accounts, and unverified giveaways across X, Instagram, Facebook, and Telegram.
              </p>
            </div>
            <ThreatTable />
          </div>
        )}

        {/* TAB 4: DOMAINS & PHISHING */}
        {activeTab === 'phishing_website' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Globe className="h-5 w-5" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Brand Impersonation & Phishing Website Detection
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Monitors lookalike domains, homoglyph typosquatting, deceptive subdomains, newly issued SSL certificates, and credential harvesting forms targeting customers.
              </p>
            </div>
            <ThreatTable />
          </div>
        )}

        {/* TAB 5: MOBILE APP RISKS */}
        {activeTab === 'suspicious_mobile_app' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
              <div className="flex items-center gap-2 text-orange-300">
                <Smartphone className="h-5 w-5" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Suspicious Mobile Application & Trojanned APK Intelligence
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Tracks rogue Android APKs and unofficial store listings appropriating brand logos, requesting dangerous telecommunication permissions, or executing overlay banking fraud.
              </p>
            </div>
            <ThreatTable />
          </div>
        )}

        {/* TAB 6: SCAM CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <CampaignGraph />
          </div>
        )}

        {/* TAB 7: INVESTIGATION CASES */}
        {activeTab === 'investigations' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-amber-300">
                <FolderGit2 className="h-5 w-5" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Active Investigation Workspace & Triage Queue
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Prioritize high-risk findings, review sandboxed DOM payloads, corroborate telemetry, and assign response actions.
              </p>
            </div>
            <ThreatTable />
          </div>
        )}

        {/* TAB 8: AI COPILOT */}
        {activeTab === 'copilot' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-xl border border-purple-500/30 bg-[#111726] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Autonomous Threat Investigation Copilot
                  </h2>
                  <p className="text-xs text-gray-400">
                    Grounded intelligence engine with real-time access to telemetry, campaigns, and registered trademarks.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0d1424] border border-[#1b253b] space-y-2">
                <p className="text-xs text-gray-300 leading-relaxed">
                  The AI Copilot operates in strict compliance with evidentiary provenance standards. It analyzes real signals, formulates platform abuse notices, and identifies campaign clusters without fabricating facts.
                </p>
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition shadow-md shadow-purple-950/50"
                >
                  Launch Interactive Copilot Session →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: RESPONSE CENTER */}
        {activeTab === 'response' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <ResponseCenterView />
          </div>
        )}

        {/* TAB 10: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <ReportsView />
          </div>
        )}

        {/* TAB 11: BRAND ASSETS */}
        {activeTab === 'brand_assets' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <BrandAssetManager />
          </div>
        )}

        {/* TAB 12: CONNECTORS */}
        {activeTab === 'connectors' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <ConnectorsView />
          </div>
        )}

        {/* TAB 13: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <AuditLogView />
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <InvestigationDrawer />
      <AICopilotModal />
      <LiveScannerModal />
    </div>
  );
}

export default function Home() {
  return (
    <ThreatProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-[#070a12]">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <DashboardContent />
        </div>
      </div>
    </ThreatProvider>
  );
}
