'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import { ThreatEntity, LifecycleStatus, Severity } from '@/types/threat';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Terminal,
  FileText,
  Clock,
  Sparkles,
  Send,
  Download,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  Lock,
  Eye,
  Server,
  Layers,
  UserCheck,
  Smartphone,
  Users,
  Fingerprint,
  Zap,
  Building,
  Radio,
  FileWarning,
} from 'lucide-react';

export default function InvestigationDrawer() {
  const {
    selectedThreat,
    setSelectedThreatId,
    updateThreatStatus,
    assignThreat,
    addThreatNote,
    requestTakedown,
    markFalsePositive,
    setIsCopilotOpen,
    currentUserRole,
    selectedBrand,
  } = useThreat();

  const [activeTab, setActiveTab] = useState<'evidence_chain' | 'ioc_correlation' | 'sandbox' | 'ai_analysis' | 'timeline' | 'case'>('evidence_chain');
  const [newNote, setNewNote] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTakedownText, setCopiedTakedownText] = useState(false);
  const [isTakedownModalOpen, setIsTakedownModalOpen] = useState(false);
  const [isFalsePositiveModalOpen, setIsFalsePositiveModalOpen] = useState(false);
  const [falsePositiveReason, setFalsePositiveReason] = useState('');
  const [takedownProvider, setTakedownProvider] = useState('Registrar Abuse Desk / Host');
  const [takedownNotes, setTakedownNotes] = useState('');
  const [isExported, setIsExported] = useState(false);

  if (!selectedThreat) return null;

  const brandName = selectedThreat.brandName || selectedBrand.name;
  const chain = selectedThreat.evidenceChain || {
    typosquattingLeetspeak: {
      detected: true,
      originalBrand: brandName,
      targetString: selectedThreat.targetIdentifier,
      substitutions: [],
      patternType: 'Lookalike Trademark Appending',
      details: `Target incorporates brand name "${brandName}" alongside deceptive suffixes.`,
    },
    deceptiveAffixes: {
      detected: true,
      affixesFound: ['_support', 'verify'],
      intentRisk: 'high' as const,
      details: 'Identified deceptive customer care lures and verification triggers.',
    },
    visualLogoSimilarity: {
      percentageScore: 94,
      matchMethod: 'Perceptual Hash & Neural Asset Match',
      referenceAsset: `${brandName} Vector Logo`,
      badge: 'High Replica' as const,
      details: 'Visual match against protected brand mark.',
    },
    phishingOrPermissionsAudit: {
      isPhishingForm: selectedThreat.category === 'phishing_website',
      harvestedFields: ['Password', '2FA Tokens'],
      maliciousPermissions: selectedThreat.category === 'suspicious_mobile_app' ? ['READ_SMS', 'RECEIVE_SMS'] : [],
      riskSummary: 'Phishing and unauthorized credential interception mechanisms present.',
      details: 'Technical indicators confirm malicious exfiltration endpoints.',
    },
  };

  const publisher = selectedThreat.publisherOrDeveloper || {
    organizationName: 'Unverified External Registrant',
    developerAccount: selectedThreat.category === 'suspicious_mobile_app' ? 'Third-Party Mirror Publisher' : undefined,
    registrar: selectedThreat.category === 'phishing_website' ? 'Privacy Protected Hosting Service' : undefined,
    hostingAsn: 'AS49453 Bulletproof Transit Provider',
    country: 'Offshore / High Privacy Jurisdiction',
    registrationDate: '2026-10-09',
  };

  const iocs = selectedThreat.linkedIocs || [
    { type: 'ip', value: '185.220.101.42', label: 'C2 Reverse Proxy Host' },
    { type: 'telegram', value: '@support_resolution_desk', label: 'Telegram Lure Bot' },
    { type: 'crypto_wallet', value: '0x71C...a49B', label: 'Fraud Loot Wallet' },
  ];

  const verdict = selectedThreat.safetyVerdict || {
    level: selectedThreat.riskScore >= 75 ? 'critical' : selectedThreat.riskScore >= 50 ? 'high' : 'medium',
    title: selectedThreat.riskScore >= 75 ? 'CRITICAL THREAT — DO NOT INTERACT' : 'HIGH RISK — SUSPECTED MALICIOUS ENTITY',
    recommendation: selectedThreat.riskScore >= 75
      ? 'Extreme danger of credential exfiltration or fund drainage. Do not open URLs, do not input tokens. Initiate urgent automated takedown dispatch.'
      : 'Strong indicators of brand impersonation and customer diversion. Block on corporate DNS resolvers and submit platform abuse notice.',
    actionSummary: 'Quarantine and block network egress to this asset immediately.',
  };

  const handleCopyIdentifier = () => {
    navigator.clipboard.writeText(selectedThreat.targetIdentifier);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addThreatNote(selectedThreat.id, newNote.trim());
    setNewNote('');
  };

  const handleConfirmTakedown = () => {
    requestTakedown(selectedThreat.id, takedownProvider, takedownNotes);
    setIsTakedownModalOpen(false);
  };

  const handleConfirmFalsePositive = () => {
    if (!falsePositiveReason.trim()) return;
    markFalsePositive(selectedThreat.id, falsePositiveReason.trim());
    setIsFalsePositiveModalOpen(false);
    setFalsePositiveReason('');
  };

  const handleExportEvidence = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedThreat, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `evidence-package-${selectedThreat.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'x':
      case 'instagram':
      case 'facebook':
      case 'telegram':
      case 'linkedin':
      case 'tiktok':
        return <Users className="h-4 w-4 text-purple-400" />;
      case 'web':
        return <Globe className="h-4 w-4 text-cyan-400" />;
      default:
        return <Smartphone className="h-4 w-4 text-orange-400" />;
    }
  };

  const generatePreformattedTakedownNotice = () => {
    return `### FORMAL DIGITAL BRAND INFRINGEMENT & ABUSE TAKEDOWN NOTICE
DATE: ${new Date().toISOString()}
DESIGNATED DESK: ${takedownProvider}

AFFECTED TRADEMARK OWNER: ${brandName}
OFFICIAL DOMAIN: ${selectedBrand.officialDomains[0] || 'https://brand-domain.com'}

INFRINGING ASSET IDENTIFIER: ${selectedThreat.targetIdentifier}
PLATFORM TYPE: ${selectedThreat.platform.toUpperCase()}
CATEGORY: ${selectedThreat.category.replace(/_/g, ' ').toUpperCase()}
CALCULATED RISK SEVERITY: ${selectedThreat.severity.toUpperCase()} (Score: ${selectedThreat.riskScore}/100)

EVIDENCE INDICATOR CHAIN:
1. TYPOSQUATTING / LEETSPEAK:
   - Pattern: ${chain.typosquattingLeetspeak.patternType}
   - Details: ${chain.typosquattingLeetspeak.details}

2. DECEPTIVE AFFIXES:
   - Matched Terms: ${chain.deceptiveAffixes.affixesFound.join(', ') || 'N/A'}
   - Intent Classification: ${chain.deceptiveAffixes.intentRisk.toUpperCase()}

3. AI & VISUAL LOGO SIMILARITY:
   - Visual Match Score: ${chain.visualLogoSimilarity.percentageScore}% (${chain.visualLogoSimilarity.badge})
   - Method: ${chain.visualLogoSimilarity.matchMethod}

4. PHISHING / PERMISSIONS AUDIT:
   - Form Harvest Audit: ${chain.phishingOrPermissionsAudit.isPhishingForm ? chain.phishingOrPermissionsAudit.harvestedFields.join(', ') : 'None'}
   - Malicious Permissions: ${chain.phishingOrPermissionsAudit.maliciousPermissions.join(', ') || 'None'}

5. CORRELATED IOCS:
   ${iocs.map(ioc => `- ${ioc.type.toUpperCase()}: ${ioc.value} (${ioc.label})`).join('\n   ')}

DEMAND FOR RELIEF:
This entity unlawfully exploits registered trademarks and misleads end-consumers into disclosing private credentials. We demand immediate suspension and de-indexing pursuant to platform Terms of Service and international anti-phishing guidelines.

SUBMITTED BY: ScamSentry Autonomous DRP SOC Desk`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-4xl h-full bg-[#0b0f19] border-l border-[#1f293d] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* =========================================================================
            SECTION 1 & 2: HEADER (BASIC DETAILS, RISK SCORE, SEVERITY & SAFETY VERDICT)
           ========================================================================= */}
        <div className="p-4 border-b border-[#1f293d] bg-[#090d16] space-y-3">
          <div className="flex items-center justify-between">
            {/* Basic Entity Details */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                selectedThreat.severity === 'critical' ? 'bg-red-500/15 border-red-500/40 text-red-400' :
                selectedThreat.severity === 'high' ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' :
                'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}>
                {getPlatformIcon(selectedThreat.platform)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">{selectedThreat.name}</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182338] text-gray-300 uppercase border border-[#223049]">
                    {selectedThreat.platform.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    Targeting: {brandName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-0.5">
                  <span className="text-gray-200 font-semibold">{selectedThreat.targetIdentifier}</span>
                  <button onClick={handleCopyIdentifier} className="text-gray-500 hover:text-white transition">
                    {copiedId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <span>• Detected: {new Date(selectedThreat.detectedAt).toLocaleDateString()}</span>
                  <span>• Status: <strong className="text-amber-400 uppercase">{selectedThreat.status}</strong></span>
                </div>
              </div>
            </div>

            {/* Risk Score & Controls */}
            <div className="flex items-center gap-3">
              {/* Numerical Risk Score & Badge */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-white">
                    {selectedThreat.riskScore}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">/100</span>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  selectedThreat.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                  selectedThreat.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {selectedThreat.severity} SEVERITY
                </span>
              </div>

              <button
                onClick={() => setSelectedThreatId(null)}
                className="p-1.5 rounded-lg border border-[#1f293d] bg-[#111726] text-gray-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Publisher / Developer & Safety Verdict Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
            {/* Publisher / Developer Info Card */}
            <div className="rounded-lg bg-[#0d1424] border border-[#1a253c] p-2.5 flex items-center justify-between font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-gray-400 uppercase block">PUBLISHER / REGISTRAR / DEVELOPER</span>
                <strong className="text-gray-200">{publisher.organizationName || 'Unverified External Persona'}</strong>
                <div className="text-[10px] text-gray-500">
                  {publisher.registrar || publisher.developerAccount || publisher.hostingAsn} • {publisher.country}
                </div>
              </div>
              <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </div>

            {/* Actionable Safety Verdict Banner */}
            <div className={`rounded-lg p-2.5 border flex items-center justify-between ${
              verdict.level === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
              verdict.level === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-200' :
              'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold block tracking-wider">
                  USER SAFETY VERDICT
                </span>
                <strong className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertOctagon className="h-3.5 w-3.5 text-current" />
                  {verdict.title}
                </strong>
                <div className="text-[10px] opacity-80 truncate max-w-sm">
                  {verdict.recommendation}
                </div>
              </div>
              <button
                onClick={() => setIsTakedownModalOpen(true)}
                className="flex-shrink-0 ml-2 rounded bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500 shadow-sm transition"
              >
                Takedown Notice
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1f293d] bg-[#0c1220] px-4 gap-4 text-xs font-medium overflow-x-auto scrollbar-none">
          {[
            { id: 'evidence_chain', label: 'Evidence Indicator Chain', icon: Fingerprint },
            { id: 'ioc_correlation', label: 'Campaign & IOC Links', icon: Layers },
            { id: 'sandbox', label: 'Air-Gapped Sandbox', icon: Eye },
            { id: 'ai_analysis', label: 'AI Investigation Briefing', icon: Sparkles },
            { id: 'timeline', label: 'Incident Timeline', icon: Clock },
            { id: 'case', label: 'Analyst Case Notes', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 text-amber-300 font-semibold'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            TAB CONTENT BODY
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: EVIDENCE INDICATOR CHAIN (WHY IT'S A THREAT) */}
          {activeTab === 'evidence_chain' && (
            <div className="space-y-4">
              
              {/* Evidence Chain 4-Quadrant Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* 1. Typosquatting & Leetspeak Breakdown */}
                <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#1b253b]">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                        Typosquatting & Leetspeak Breakdown
                      </span>
                      {chain.typosquattingLeetspeak.detected ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          ANOMALY CONFIRMED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-500/20 text-gray-400">
                          STANDARD TOKEN
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 rounded bg-[#0d1424] border border-[#1a253c] font-mono text-[11px]">
                        <span className="text-[10px] text-gray-500 block">PATTERN IDENTIFIED</span>
                        <strong className="text-amber-400">{chain.typosquattingLeetspeak.patternType}</strong>
                      </div>

                      {chain.typosquattingLeetspeak.substitutions.length > 0 && (
                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs">
                          <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">
                            DETECTED CHARACTER SUBSTITUTIONS:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {chain.typosquattingLeetspeak.substitutions.map((sub, i) => (
                              <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                                &apos;{sub.substituted}&apos; replaces &apos;{sub.original}&apos;
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-300 text-xs leading-relaxed">
                        {chain.typosquattingLeetspeak.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 font-mono pt-2 border-t border-[#1a253c]">
                    Compared against protected brand stem: <strong className="text-gray-300">{chain.typosquattingLeetspeak.originalBrand}</strong>
                  </div>
                </div>

                {/* 2. Deceptive Affixes Detection */}
                <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#1b253b]">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                        Deceptive Affixes & Lures Detection
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        chain.deceptiveAffixes.intentRisk === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        chain.deceptiveAffixes.intentRisk === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {chain.deceptiveAffixes.intentRisk} INTENT RISK
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 block mb-1">MATCHED SOCIAL ENGINEERING AFFIXES</span>
                        <div className="flex flex-wrap gap-1.5">
                          {chain.deceptiveAffixes.affixesFound.map((affix, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                              {affix}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-300 text-xs leading-relaxed pt-1">
                        {chain.deceptiveAffixes.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 font-mono pt-2 border-t border-[#1a253c]">
                    NLP Classifier: Keyword Stalking & Credential Harvesting Intent
                  </div>
                </div>

                {/* 3. AI & Visual Logo Similarity Percentage Score */}
                <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#1b253b]">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Fingerprint className="h-3.5 w-3.5 text-purple-400" />
                        AI & Visual Logo Similarity
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                        {chain.visualLogoSimilarity.badge}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-gray-400">Calculated Visual Proximity:</span>
                        <span className="text-2xl font-black font-mono text-purple-300">
                          {chain.visualLogoSimilarity.percentageScore}%
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-[#182338] overflow-hidden">
                        <div
                          style={{ width: `${chain.visualLogoSimilarity.percentageScore}%` }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        />
                      </div>

                      <div className="p-2 rounded bg-[#0d1424] border border-[#1a253c] text-[11px] text-gray-300 font-mono space-y-0.5">
                        <div>Method: <strong className="text-gray-200">{chain.visualLogoSimilarity.matchMethod}</strong></div>
                        <div>Reference: <strong className="text-purple-300">{chain.visualLogoSimilarity.referenceAsset}</strong></div>
                      </div>

                      <p className="text-gray-300 text-xs">
                        {chain.visualLogoSimilarity.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 font-mono pt-2 border-t border-[#1a253c]">
                    Deep Vision: Convolutional Perceptual Hash
                  </div>
                </div>

                {/* 4. Phishing Intent or Malicious Permissions Audit */}
                <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#1b253b]">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                        Phishing Intent & Permissions Audit
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                        PAYLOAD AUDITED
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      {chain.phishingOrPermissionsAudit.isPhishingForm && (
                        <div className="p-2 rounded bg-red-500/10 border border-red-500/25">
                          <span className="text-[10px] font-mono text-red-400 font-bold block mb-1">
                            HARVESTED CREDENTIAL INPUT FIELDS DISCOVERED:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {chain.phishingOrPermissionsAudit.harvestedFields.map((f, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-black/40 text-red-200 font-mono text-[10px] border border-red-500/30">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {chain.phishingOrPermissionsAudit.maliciousPermissions.length > 0 && (
                        <div className="p-2 rounded bg-orange-500/10 border border-orange-500/25">
                          <span className="text-[10px] font-mono text-orange-400 font-bold block mb-1">
                            DANGEROUS ANDROID MANIFEST PRIVILEGES:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {chain.phishingOrPermissionsAudit.maliciousPermissions.map((p, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-black/40 text-orange-200 font-mono text-[10px] border border-orange-500/30">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-300 text-xs leading-relaxed">
                        {chain.phishingOrPermissionsAudit.riskSummary}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 font-mono pt-2 border-t border-[#1a253c]">
                    Static Manifest & Isolated DOM Form Inspector
                  </div>
                </div>

              </div>

              {/* Multi-Factor Scoring Factors Breakdown */}
              <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#1a2337]">
                  <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                    Deterministic Scoring Model Factors ({selectedThreat.riskScore}/100)
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Normalized Metric System</span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {selectedThreat.scoreBreakdown.map((factor, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-medium">{factor.factor}</span>
                        <span className="font-mono font-bold text-amber-400">
                          {factor.points} / {factor.maxPoints} pts
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#182238] overflow-hidden">
                        <div
                          style={{ width: `${(factor.points / factor.maxPoints) * 100}%` }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAMPAIGN & IOC CORRELATION */}
          {activeTab === 'ioc_correlation' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#1a2337]">
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                      Correlated Indicators of Compromise (IOCs)
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Shared infrastructure linking this alert to wider threat actor operations.
                    </p>
                  </div>
                  {selectedThreat.campaignName && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {selectedThreat.campaignName}
                    </span>
                  )}
                </div>

                {/* Linked IOCs Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {iocs.map((ioc, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#0d1424] border border-[#1a253c] space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                        {ioc.type.toUpperCase()}: {ioc.label}
                      </span>
                      <strong className="text-xs text-white font-mono break-all">{ioc.value}</strong>
                      <div className="text-[10px] text-gray-500 font-mono">
                        Attributed Node
                      </div>
                    </div>
                  ))}
                </div>

                {/* Related Entities in this Syndicate */}
                <div className="space-y-2 pt-2 border-t border-[#1a2337]">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    COORDINATED SYNDICATE MEMBERS ({selectedThreat.relatedEntities.length})
                  </span>
                  {selectedThreat.relatedEntities.length === 0 ? (
                    <p className="text-xs text-gray-500 py-2">No secondary accounts currently grouped in this cluster.</p>
                  ) : (
                    selectedThreat.relatedEntities.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => setSelectedThreatId(rel.id)}
                        className="cursor-pointer rounded-lg bg-[#0d1424] border border-[#1b253b] p-3 flex items-center justify-between hover:border-amber-500/40 transition"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1a243b] text-gray-300 uppercase">
                              {rel.type}
                            </span>
                            <span>{rel.name}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Relationship: <span className="text-amber-300 font-mono">{rel.relationship}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-red-400 font-bold">
                            {rel.riskScore}/100
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AIR-GAPPED SAFE URL SANDBOX */}
          {activeTab === 'sandbox' && (
            <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1a2337]">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                    Air-Gapped Analysis Sandbox & DOM Inspector
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  ISOLATED AIR-GAPPED RENDERER
                </span>
              </div>

              {/* Mock Browser Sandbox Window */}
              <div className="rounded-lg border border-[#223049] bg-[#090d16] overflow-hidden">
                <div className="bg-[#141d30] px-3 py-2 border-b border-[#223049] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-gray-300 truncate max-w-sm">
                      {selectedThreat.targetIdentifier}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">TLS 1.3 / Isolated Probe</span>
                </div>

                <div className="p-4 space-y-3 font-mono text-xs">
                  <div className="rounded bg-[#0c1220] p-3 border border-[#19243a] text-gray-300">
                    <div className="text-emerald-400 mb-1">// HTTP Response Headers (Sanitized)</div>
                    <div>HTTP/1.1 200 OK</div>
                    <div>Server: nginx / bulletproof-proxy</div>
                    <div>Content-Type: text/html; charset=UTF-8</div>
                    <div className="text-amber-400 mt-2">// Intercepted Exfiltration Action Form</div>
                    <div className="text-red-400">&lt;form action=&quot;/api/auth/exfiltrate&quot; method=&quot;POST&quot;&gt;</div>
                    <div className="pl-4 text-gray-400">&lt;input name=&quot;account_username&quot; /&gt;</div>
                    <div className="pl-4 text-gray-400">&lt;input type=&quot;password&quot; name=&quot;account_password&quot; /&gt;</div>
                    <div className="pl-4 text-gray-400">&lt;input name=&quot;2fa_otp_token&quot; /&gt;</div>
                    <div className="text-red-400">&lt;/form&gt;</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded bg-[#101728] border border-[#1a253c]">
                      <span className="text-gray-400 block text-[10px]">HOST IP & ASN</span>
                      <strong className="text-white">185.220.101.42 (AS49453 Hostinger)</strong>
                    </div>
                    <div className="p-2.5 rounded bg-[#101728] border border-[#1a253c]">
                      <span className="text-gray-400 block text-[10px]">CERTIFICATE VALIDITY</span>
                      <strong className="text-amber-400">Issued Ephemeral (Under 72h)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI THREAT ANALYSIS */}
          {activeTab === 'ai_analysis' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase font-mono">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>AI Investigation Briefing</span>
                  <span className="ml-auto text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                    Confidence: {selectedThreat.aiAnalysis.confidenceLevel}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-lg bg-[#111726] border border-[#1f293d] p-3">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                      THREAT SUMMARY
                    </span>
                    <p className="text-gray-200 leading-relaxed">{selectedThreat.aiAnalysis.summary}</p>
                  </div>

                  <div className="rounded-lg bg-[#111726] border border-[#1f293d] p-3">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                      ATTACK METHOD & MODUS OPERANDI
                    </span>
                    <p className="text-gray-200 leading-relaxed">{selectedThreat.aiAnalysis.attackMethod}</p>
                  </div>

                  <div className="rounded-lg bg-[#111726] border border-[#1f293d] p-3">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                      POTENTIAL CUSTOMER BLAST RADIUS
                    </span>
                    <p className="text-gray-200 leading-relaxed">{selectedThreat.aiAnalysis.targetAudienceImpact}</p>
                  </div>

                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                      RECOMMENDED RESPONSE PLAYBOOK
                    </span>
                    <p className="text-amber-200 font-medium leading-relaxed">
                      {selectedThreat.aiAnalysis.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-4">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono pb-2 border-b border-[#1a2337]">
                Incident Event Timeline & Audit Trail
              </h3>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e2a42]">
                {selectedThreat.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <span className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-[#111726] ${
                      event.type === 'detection' ? 'bg-blue-400' :
                      event.type === 'triage' ? 'bg-amber-400' :
                      event.type === 'escalation' ? 'bg-red-400' :
                      event.type === 'takedown' ? 'bg-orange-400' :
                      event.type === 'resolution' ? 'bg-emerald-400' :
                      'bg-purple-400'
                    }`} />

                    <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{event.action}</span>
                        <span className="font-mono text-[10px] text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{event.details}</p>
                      <div className="text-[10px] text-gray-500 font-mono mt-1">
                        Author: {event.author} ({event.role})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CASE MANAGEMENT & NOTES */}
          {activeTab === 'case' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 space-y-3">
                <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono pb-2 border-b border-[#1a2337]">
                  Analyst Internal Case Notes
                </h3>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal observation, correlation note, or takedown reference..."
                    className="flex-1 rounded-lg border border-[#1f293d] bg-[#0d1424] px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition"
                  >
                    Post Note
                  </button>
                </form>

                <div className="space-y-2 mt-3">
                  {selectedThreat.notes.map((note, idx) => (
                    <div key={idx} className="rounded-lg bg-[#0d1424] border border-[#1a253c] p-2.5 text-xs text-gray-300">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-[#1f293d] bg-[#090d16] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportEvidence}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition"
            >
              <Download className="h-3.5 w-3.5 text-gray-400" />
              <span>{isExported ? 'Exported JSON!' : 'Export Evidence'}</span>
            </button>
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/25 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask Copilot</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTakedownModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-500 shadow-md shadow-red-950/40 transition"
            >
              <AlertOctagon className="h-3.5 w-3.5" />
              <span>Generate Automated Takedown Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* ONE-CLICK AUTOMATED TAKEDOWN NOTICE MODAL */}
      {isTakedownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-red-500/40 bg-[#111726] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertOctagon className="h-5 w-5" />
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Automated Takedown Notice Generator
                </h3>
              </div>
              <button onClick={() => setIsTakedownModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Standardized legal abuse notice formulated with documented typosquatting, visual logo similarity, and IOC indicators for <strong>{selectedThreat.targetIdentifier}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  DESTINATION PLATFORM / ABUSE DESK
                </label>
                <select
                  value={takedownProvider}
                  onChange={(e) => setTakedownProvider(e.target.value)}
                  className="w-full rounded-lg border border-[#1f293d] bg-[#0d1424] px-3 py-1.5 text-xs text-gray-200 focus:border-red-500 focus:outline-none"
                >
                  <option value="Registrar Abuse Desk / Host">Registrar Abuse Desk / Host</option>
                  <option value="Meta Brand Rights Protection (Instagram/Facebook)">Meta Brand Rights Protection</option>
                  <option value="X (Twitter) Impersonation & Safety Ops">X (Twitter) Safety Ops</option>
                  <option value="Google Safe Browsing & Google Play Abuse Desk">Google Safe Browsing Desk</option>
                  <option value="Telegram Anti-Scam Bot & Legal Desk">Telegram Anti-Scam Team</option>
                </select>
              </div>

              {/* Preformatted Notice Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    PRE-FORMATTED LEGAL ABUSE REPORT
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatePreformattedTakedownNotice());
                      setCopiedTakedownText(true);
                      setTimeout(() => setCopiedTakedownText(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300"
                  >
                    {copiedTakedownText ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedTakedownText ? 'Copied to Clipboard!' : 'Copy Notice Text'}</span>
                  </button>
                </div>

                <div className="rounded-lg bg-[#080c14] border border-[#1b253b] p-3 font-mono text-[11px] text-gray-300 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                  {generatePreformattedTakedownNotice()}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1f293d]">
              <button
                onClick={() => setIsTakedownModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[#1f293d] text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleConfirmTakedown}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-500 shadow-md shadow-red-900/50"
              >
                Dispatch Official Notice & Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FALSE POSITIVE MANDATORY REASON MODAL */}
      {isFalsePositiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-600 bg-[#111726] p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Dismiss as False Positive</h3>
            <p className="text-xs text-gray-300">
              Audit compliance requires a mandatory justification for dismissing flagged digital assets.
            </p>

            <div>
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                MANDATORY REASON *
              </label>
              <textarea
                value={falsePositiveReason}
                onChange={(e) => setFalsePositiveReason(e.target.value)}
                placeholder="e.g. Authorized partner affiliate domain or verified internal beta test..."
                rows={3}
                required
                className="w-full rounded-lg border border-[#1f293d] bg-[#0d1424] p-2.5 text-xs text-gray-200 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1f293d]">
              <button
                onClick={() => setIsFalsePositiveModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[#1f293d] text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFalsePositive}
                disabled={!falsePositiveReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50"
              >
                Record Dismissal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
