'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import { MonitoringConnector } from '@/types/threat';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  ExternalLink,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export default function ConnectorsView() {
  const { connectors } = useThreat();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSimulateSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 1200);
  };

  const getSourceBadge = (type: string) => {
    switch (type) {
      case 'live':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
            LIVE INTEGRATION
          </span>
        );
      case 'imported':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
            IMPORTED FEED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
            SYNTHETIC DEMO
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Telemetry Ingestion & Monitoring Connectors
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time pipelines streaming social posts, domain registrations, APK mirrors, and global threat intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            6 / 6 Connectors Operational
          </span>
        </div>
      </div>

      {/* Data Source Notice Banner */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 flex items-start gap-3 text-xs text-blue-200">
        <Radio className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white block">Transparent Evidentiary Provenance Policy:</strong>
          ScamSentry explicitly labels each data feed: <strong className="text-emerald-300">LIVE</strong> (active API integration), <strong className="text-purple-300">IMPORTED</strong> (third-party dataset/feed), and <strong className="text-blue-300">SYNTHETIC DEMO</strong> (generated for safe demonstration and testing).
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {connectors.map((connector) => {
          const isSyncing = syncingId === connector.id;

          return (
            <div
              key={connector.id}
              className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-3 flex flex-col justify-between hover:border-gray-600 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white truncate max-w-[180px]">
                    {connector.name}
                  </h3>
                  {getSourceBadge(connector.sourceType)}
                </div>

                <div className="mt-3 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>STATUS</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-400">
                    <span>SYNC FREQUENCY</span>
                    <span className="text-gray-200">Every {connector.frequencyMinutes} min</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-400">
                    <span>EVENTS INGESTED (24H)</span>
                    <span className="text-amber-400 font-bold">{connector.eventsIngestedLast24h.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-400">
                    <span>API QUOTA CONSUMPTION</span>
                    <span className="text-gray-200">{connector.apiQuotaUsedPercentage}%</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-400">
                    <span>AVERAGE LATENCY</span>
                    <span className="text-cyan-400">{connector.latencyMs}ms</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1b253b] flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-mono">
                  Sync: {new Date(connector.lastSync).toLocaleTimeString()}
                </span>

                <button
                  onClick={() => handleSimulateSync(connector.id)}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 rounded bg-[#182338] border border-[#23314f] px-2.5 py-1 text-[11px] font-mono text-gray-300 hover:text-white hover:bg-[#1e2d4a] transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Poll Connector'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
