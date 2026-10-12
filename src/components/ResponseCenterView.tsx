'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import {
  ShieldCheck,
  AlertOctagon,
  Clock,
  CheckCircle2,
  FileText,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { ThreatEntity } from '@/types/threat';

export default function ResponseCenterView() {
  const { threats, updateThreatStatus, setSelectedThreatId, selectedBrand } = useThreat();
  const [selectedResponseThreat, setSelectedResponseThreat] = useState<ThreatEntity | null>(
    threats.find(t => t.status === 'action_requested') || threats[0] || null
  );
  const [copiedDraft, setCopiedDraft] = useState(false);

  if (threats.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Threat Response & Takedown Coordination Center
            </h2>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-[#1f293d] bg-[#0c1220] p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Takedown Queue Clear</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            0 threats currently requiring takedown or platform enforcement. When you evaluate threats and request takedowns, provider abuse workflows and automated legal notices will be managed here.
          </p>
        </div>
      </div>
    );
  }

  const activeTakedowns = threats.filter(t => t.status === 'action_requested');
  const resolvedTakedowns = threats.filter(t => t.status === 'resolved');
  const falsePositives = threats.filter(t => t.status === 'false_positive');

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const getPlatformChecklist = (platform: string) => {
    switch (platform) {
      case 'x':
        return [
          'Verify official trademark documentation on file',
          'Document confusingly similar bio text and avatar appropriation',
          'Ensure link redirection destination is recorded',
          'Submit via X Brand Impersonation Safety Portal',
        ];
      case 'web':
        return [
          'Perform passive DNS lookup and identify designated abuse hostmaster',
          'Validate evidence of deceptive login or credential harvesting input form',
          'Check Certificate Transparency logs for CA issuer abuse contact',
          'File RFC 2142 abuse report to registrar and hosting provider',
          'Submit domain flag to Google SafeBrowsing and Microsoft Defender SmartScreen',
        ];
      case 'instagram':
      case 'facebook':
        return [
          'Provide registered trademark registration serial numbers',
          'Highlight misleading customer care representation in profile bio',
          'Submit through Meta Brand Rights Protection manager',
        ];
      default:
        return [
          'Record static binary hashes and manifest permission dump',
          'Verify authorized developer account credentials',
          'Submit developer policy violation notice to app store trust & safety desk',
        ];
    }
  };

  return (
    <div className="space-y-4">
      {/* Response Center Header */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Threat Response & Takedown Coordination Center
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Orchestrate verified abuse submissions, registrar takedown packages, and end-to-end resolution tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
            Pending Dispatch: <strong>{activeTakedowns.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Neutralized: <strong>{resolvedTakedowns.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Takedowns List */}
        <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b253b]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Takedown Action Queue ({threats.filter(t => t.status === 'action_requested' || t.status === 'investigating').length})
            </h3>
            <span className="text-[10px] font-mono text-gray-500">Active SLA: 24h</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto">
            {threats
              .filter(t => t.status === 'action_requested' || t.status === 'investigating' || t.status === 'resolved')
              .map((threat) => {
                const isSelected = selectedResponseThreat?.id === threat.id;
                return (
                  <div
                    key={threat.id}
                    onClick={() => setSelectedResponseThreat(threat)}
                    className={`cursor-pointer rounded-lg p-3 border transition ${
                      isSelected
                        ? 'border-amber-500 bg-[#141e33]'
                        : 'border-[#1b253b] bg-[#0d1424] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                        {threat.name}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        threat.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : threat.status === 'action_requested'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {threat.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 font-mono truncate">
                      {threat.targetIdentifier}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span>Platform: {threat.platform.toUpperCase()}</span>
                      <span className="text-red-400 font-bold">Score: {threat.riskScore}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: Platform Abuse Generator & Checklist */}
        <div className="lg:col-span-2 rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-col justify-between">
          {selectedResponseThreat ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    TAKEDOWN WORKFLOW COORDINATOR
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {selectedResponseThreat.name} ({selectedResponseThreat.targetIdentifier})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedThreatId(selectedResponseThreat.id)}
                    className="rounded bg-[#1a243c] border border-[#253456] px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-500/20 transition"
                  >
                    View Evidence in Drawer →
                  </button>
                </div>
              </div>

              {/* Status and Provider Reference Card */}
              <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 block">CURRENT STATUS</span>
                  <strong className="text-white uppercase">{selectedResponseThreat.status}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">TARGET PLATFORM</span>
                  <strong className="text-cyan-400 uppercase">{selectedResponseThreat.platform}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">TICKET REFERENCE</span>
                  <strong className="text-amber-400">{selectedResponseThreat.takedownStatus?.referenceTicket || 'PENDING SUBMISSION'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">DISPATCHED DESK</span>
                  <strong className="text-purple-400">{selectedResponseThreat.takedownStatus?.providerContacted || 'Designated Registrar'}</strong>
                </div>
              </div>

              {/* Platform Reporting Checklist */}
              <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3 space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  PLATFORM VERIFICATION CHECKLIST ({selectedResponseThreat.platform.toUpperCase()})
                </span>
                <div className="space-y-1.5 text-xs text-gray-300">
                  {getPlatformChecklist(selectedResponseThreat.platform).map((chk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Platform Abuse Form Text */}
              <div className="rounded-lg bg-[#090d16] border border-[#1b253b] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                    PRE-FORMULATED PLATFORM ABUSE PACKAGE (STANDARDIZED RFC/LEGAL FORMAT)
                  </span>
                  <button
                    onClick={() => handleCopyDraft(
                      `ABUSE REPORT: ${selectedResponseThreat.targetIdentifier}\nBrand: ${selectedBrand.name}\nEvidence: ${selectedResponseThreat.explainabilitySummary}`
                    )}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition font-mono"
                  >
                    {copiedDraft ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedDraft ? 'Copied!' : 'Copy Template'}</span>
                  </button>
                </div>

                <div className="p-3 rounded bg-[#0d1322] border border-[#162033] font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
{`To: ${selectedResponseThreat.takedownStatus?.providerContacted || 'Designated Trust & Safety Desk'}
Subject: URGENT: Brand Impersonation & Digital Fraud Takedown Notice - ${selectedResponseThreat.targetIdentifier}

Dear Trust & Safety Operations,

On behalf of ${selectedBrand.name} (${selectedBrand.officialDomains[0]}), we hereby notify you of an unlawful digital risk entity operating on your platform:

Target Asset: ${selectedResponseThreat.targetIdentifier}
Severity Rating: ${selectedResponseThreat.severity.toUpperCase()} (Risk Score: ${selectedResponseThreat.riskScore}/100)
Detection Telemetry: ${selectedResponseThreat.detectedAt}

Grounds for Suspension:
1. The reported asset intentionally misrepresents itself as official representatives of ${selectedBrand.name}.
2. Evidence of deceptive social engineering targeting consumers: ${selectedResponseThreat.explainabilitySummary}
3. Technical indicators corroborating malicious intent: ${selectedResponseThreat.evidence.map(e => e.title).join('; ')}.

Pursuant to your platform's Terms of Service and applicable anti-phishing statutes, we request immediate suspension and quarantine of this asset.

Submitted via ScamSentry DRPP Automation Desk.`}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1b253b]">
                {selectedResponseThreat.status !== 'resolved' ? (
                  <button
                    onClick={() => updateThreatStatus(selectedResponseThreat.id, 'resolved', 'Registrar confirmed domain suspension.')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-950/40"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm Takedown & Mark Resolved</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Threat Successfully Neutralized
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500">
              Select a threat finding from the queue to view its takedown workflow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
