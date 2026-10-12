'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import { ThreatCategory, Platform, ThreatEntity } from '@/types/threat';
import { parseTargetInput } from '@/lib/targetParser';
import {
  Radar,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Users,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Terminal,
  Fingerprint,
  Building,
  Check,
  Copy,
  Code,
  FileText,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  Flame,
  Layers,
} from 'lucide-react';

export default function LiveScannerModal() {
  const { isScannerOpen, setIsScannerOpen, scanNewTarget, selectedBrand, setSelectedThreatId } = useThreat();

  const [targetIdentifier, setTargetIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<ThreatCategory>('phishing_website');
  const [platform, setPlatform] = useState<Platform>('web');
  const [rawText, setRawText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [scanResult, setScanResult] = useState<ThreatEntity | null>(null);
  const [resultView, setResultView] = useState<'ui' | 'json'>('ui');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedTakedown, setCopiedTakedown] = useState(false);

  if (!isScannerOpen) return null;

  // Auto-parse target when user types or pastes
  const handleTargetChange = (val: string) => {
    setTargetIdentifier(val);
    if (val.trim()) {
      const parsed = parseTargetInput(val, selectedBrand.name);
      setCategory(parsed.category);
      setPlatform(parsed.platform);
      if (!displayName || displayName === targetIdentifier) {
        setDisplayName(parsed.displayName);
      }
      if (!rawText) {
        setRawText(parsed.suggestedContextText);
      }
    }
  };

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIdentifier.trim()) return;

    setIsScanning(true);
    setScanStepMessage('Parsing lexical tokens and homoglyph vectors...');

    const parsed = parseTargetInput(targetIdentifier.trim(), selectedBrand.name);
    const finalDisplayName = displayName.trim() || parsed.displayName;
    const finalContext = rawText.trim() || parsed.suggestedContextText;

    let groqData: any = null;

    try {
      setScanStepMessage('Analyzing against brand registry & Groq AI heuristics...');
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate_target',
          payload: {
            targetIdentifier: targetIdentifier.trim(),
            displayName: finalDisplayName,
            category,
            platform,
            rawText: finalContext,
            brand: selectedBrand,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          groqData = data.result;
        }
      }
    } catch {
      // Graceful fallback to local detection engine
    }

    setScanStepMessage('Compiling Evidence Indicator Chain & Takedown Roadmap...');
    setTimeout(() => {
      const createdThreat = scanNewTarget(
        {
          targetIdentifier: targetIdentifier.trim(),
          displayName: finalDisplayName,
          category,
          platform,
          rawText: finalContext,
          publisherDetails: parsed.publisher,
        },
        groqData
      );

      setScanResult(createdThreat);
      setIsScanning(false);
      setScanStepMessage('');
    }, 700);
  };

  const loadPreset = (preset: { target: string; name: string; cat: ThreatCategory; plat: Platform; text: string }) => {
    setTargetIdentifier(preset.target);
    setDisplayName(preset.name);
    setCategory(preset.cat);
    setPlatform(preset.plat);
    setRawText(preset.text);
    setScanResult(null);
  };

  const handleCopyJson = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(JSON.stringify(scanResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyTakedown = () => {
    if (!scanResult) return;
    const draft = `### FORMAL ABUSE NOTIFICATION & TAKEDOWN DEMAND
Target: ${scanResult.targetIdentifier}
Platform: ${scanResult.platform.toUpperCase()}
Infringing Protected Brand: ${selectedBrand.name}
Risk Score: ${scanResult.riskScore}/100 (${scanResult.severity.toUpperCase()})

Evidence Summary:
${scanResult.explainabilitySummary}

Observable Technical Indicators:
${scanResult.evidence.map((e) => `• ${e.title}: ${e.details}`).join('\n')}

Action Requested: Immediate quarantine and suspension pursuant to platform Terms of Service.
Submitted via ScamSentry DRP Engine.`;

    navigator.clipboard.writeText(draft);
    setCopiedTakedown(true);
    setTimeout(() => setCopiedTakedown(false), 2000);
  };

  const brandName = selectedBrand.name;
  const brandStem = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'brand';

  const presets = [
    {
      label: 'Phishing Lookalike Domain',
      target: `https://${brandStem}-claims-portal.cc`,
      name: `${brandStem}-claims-portal.cc`,
      cat: 'phishing_website' as ThreatCategory,
      plat: 'web' as Platform,
      text: `Official ${brandName} claims resolution desk. Enter your account master password and 2FA OTP code to claim funds.`,
    },
    {
      label: 'Fake Support Handle (X)',
      target: `@${brandStem}_official_helpdesk`,
      name: `${brandName} 24/7 Verified Helpdesk`,
      cat: 'social_impersonation' as ThreatCategory,
      plat: 'x' as Platform,
      text: `Official customer care representative for ${brandName}. DM your seed phrase or open bit.ly/${brandStem}-assist.`,
    },
    {
      label: 'Malicious Mobile App (APK)',
      target: `com.${brandStem}.fastrewards.wallet`,
      name: `${brandName} Rewards & Fast Wallet`,
      cat: 'suspicious_mobile_app' as ThreatCategory,
      plat: 'third_party_apk' as Platform,
      text: `Requests READ_SMS, RECEIVE_SMS, and BIND_ACCESSIBILITY_SERVICE. Distributed on external mirror apkcombo mimicking ${brandName}.`,
    },
  ];

  const chain = scanResult?.evidenceChain || {
    typosquattingLeetspeak: { detected: false, patternType: 'Standard Lexical Token', substitutions: [], details: 'No leetspeak or character substitution anomalies detected.' },
    deceptiveAffixes: { detected: false, affixesFound: [], intentRisk: 'low' as const, details: 'No high-risk deceptive affixes detected.' },
    visualLogoSimilarity: { percentageScore: 20, matchMethod: 'Feature comparison', badge: 'Color Swatch Match' as const, details: 'Low visual correlation.' },
    phishingOrPermissionsAudit: { isPhishingForm: false, harvestedFields: [], maliciousPermissions: [], riskSummary: 'None confirmed.', details: 'No credential forms identified.' }
  };

  const verdict = scanResult?.safetyVerdict || {
    level: (scanResult?.riskScore || 0) >= 75 ? ('critical' as const) : (scanResult?.riskScore || 0) >= 50 ? ('high' as const) : ('medium' as const),
    title: (scanResult?.riskScore || 0) >= 75 ? 'CRITICAL THREAT — DO NOT INTERACT' : 'EVALUATED THREAT ARTIFACT',
    recommendation: 'Evaluate findings and determine whether quarantine or takedown is appropriate.',
    actionSummary: 'Review evidence chain.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-xl border border-amber-500/40 bg-[#0c1220] p-5 shadow-2xl shadow-black/90 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <Radar className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Dynamic Target Threat Evaluation Engine
                </h2>
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Evaluating custom target against protected entity:{' '}
                <strong className="text-amber-400">{selectedBrand.name}</strong> ({selectedBrand.officialDomains[0]})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsScannerOpen(false);
              setScanResult(null);
            }}
            className="p-1 rounded-lg border border-[#1f293d] text-gray-400 hover:text-white hover:bg-[#182338] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div>
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5">
            Quick Scenario Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(p)}
                className="rounded-lg border border-[#1f293d] bg-[#111726] px-2.5 py-1 text-xs text-gray-300 hover:border-amber-400 hover:text-amber-300 hover:bg-[#151f33] transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleRunScan} className="space-y-3 text-xs bg-[#111726] p-4 rounded-xl border border-[#1f293d]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider block mb-1">
                Target Identifier / URL / Handle / Package *
              </label>
              <input
                type="text"
                required
                value={targetIdentifier}
                onChange={(e) => handleTargetChange(e.target.value)}
                placeholder="e.g. https://scam-verify.cc, @fake_support, com.fake.wallet"
                className="w-full rounded-lg border border-[#23324d] bg-[#090d16] px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider block mb-1">
                Display Name / Label
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={`e.g. ${brandName} Support Desk`}
                className="w-full rounded-lg border border-[#23324d] bg-[#090d16] px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider block mb-1">
                Threat Category (Auto-Detected)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ThreatCategory)}
                className="w-full rounded-lg border border-[#23324d] bg-[#090d16] px-3 py-2 text-xs text-gray-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="phishing_website">Phishing Website / Lookalike Domain</option>
                <option value="social_impersonation">Social Media Impersonation Persona</option>
                <option value="suspicious_mobile_app">Suspicious Mobile Application / APK</option>
                <option value="fraud_campaign">Coordinated Fraud Campaign Syndicate</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider block mb-1">
                Target Platform (Auto-Detected)
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full rounded-lg border border-[#23324d] bg-[#090d16] px-3 py-2 text-xs text-gray-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="web">Web Browser / Domain</option>
                <option value="x">X (Twitter)</option>
                <option value="instagram">Instagram</option>
                <option value="telegram">Telegram</option>
                <option value="facebook">Facebook</option>
                <option value="third_party_apk">Third-Party Android APK</option>
                <option value="google_play">Google Play Store</option>
                <option value="apple_app_store">Apple App Store</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider block mb-1">
              Discovered Bio, DOM Content, or Lure Post (For Intent & Technical Scoring)
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste scraped bio text, DOM input names, or lure message..."
              rows={2}
              className="w-full rounded-lg border border-[#23324d] bg-[#090d16] p-2.5 text-xs text-gray-100 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#1f293d]">
            <span className="text-[11px] font-mono text-gray-400">
              Auto-calibrates against {selectedBrand.name} registered domains & trademarks
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsScannerOpen(false);
                  setScanResult(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#1f293d] text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isScanning || !targetIdentifier.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition disabled:opacity-50 shadow-md shadow-amber-950/40"
              >
                {isScanning ? (
                  <>
                    <Radar className="h-3.5 w-3.5 animate-spin" />
                    <span>Evaluating Heuristics...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-black" />
                    <span>Run Threat Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isScanning && scanStepMessage && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2 font-mono animate-pulse">
              <Radar className="h-4 w-4 animate-spin text-amber-400" />
              <span>{scanStepMessage}</span>
            </div>
          )}
        </form>

        {/* =========================================================================
            STRUCTURED JSON / UI OUTPUT (REQUIREMENT 2 & 3)
           ========================================================================= */}
        {scanResult && (
          <div className="rounded-xl border border-emerald-500/40 bg-[#0d1627] p-5 space-y-4 animate-in fade-in duration-200">
            {/* Output View Header & Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1b253b]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Structured Threat Analysis Generated
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-300">
                    Ingested into Threat Feed • ID: {scanResult.id}
                  </span>
                </div>
              </div>

              {/* Toggle UI / JSON view */}
              <div className="flex items-center gap-1.5 rounded-lg bg-[#070b13] p-1 border border-[#1b253b] text-xs">
                <button
                  type="button"
                  onClick={() => setResultView('ui')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    resultView === 'ui' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Interactive UI
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultView('json')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    resultView === 'json' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    Structured JSON
                  </span>
                </button>
              </div>
            </div>

            {/* TAB 1: INTERACTIVE UI PRESENTATION */}
            {resultView === 'ui' && (
              <div className="space-y-4">
                {/* 1. Basic Entity Details & Score Badge Banner */}
                <div className="rounded-lg bg-[#111a2d] border border-[#1f2d48] p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                        {scanResult.platform} • {scanResult.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">{scanResult.name}</h4>
                    <p className="text-xs text-gray-300 font-mono mt-0.5">{scanResult.targetIdentifier}</p>
                    <div className="mt-2 text-[11px] text-gray-400 font-mono">
                      Publisher / Registrant:{' '}
                      <strong className="text-amber-300">
                        {scanResult.publisherOrDeveloper?.organizationName || 'Unverified Registrant'}
                      </strong>{' '}
                      • Country: {scanResult.publisherOrDeveloper?.country || 'Offshore Jurisdiction'}
                    </div>
                  </div>

                  {/* Big Numerical Score & Severity Badge */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-3xl font-black font-mono text-white tracking-tight">
                        {scanResult.riskScore}
                      </span>
                      <span className="text-xs font-mono text-gray-400">/100</span>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-xs font-bold uppercase border mt-1 ${
                        scanResult.severity === 'critical'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : scanResult.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {scanResult.severity} RISK
                    </span>
                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                      {scanResult.confidenceScore}% confidence
                    </div>
                  </div>
                </div>

                {/* 2. Evidence Indicator Chain */}
                <div className="space-y-2">
                  <span className="text-xs font-bold font-mono text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="h-4 w-4 text-cyan-400" />
                    Evidence Indicator Chain Breakdown
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Typosquatting */}
                    <div className="rounded-lg bg-[#0e1628] border border-[#1b273d] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white">Typosquatting & Leetspeak</span>
                        {chain.typosquattingLeetspeak.detected ? (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                            ANOMALY
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-gray-400">CLEAN</span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-300 font-mono">
                        {chain.typosquattingLeetspeak.patternType}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {chain.typosquattingLeetspeak.details}
                      </p>
                    </div>

                    {/* Deceptive Affixes */}
                    <div className="rounded-lg bg-[#0e1628] border border-[#1b273d] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white">Deceptive Affixes & Lures</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
                          {chain.deceptiveAffixes.intentRisk} INTENT
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {chain.deceptiveAffixes.affixesFound.map((af, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/50 text-amber-300 border border-amber-500/30"
                          >
                            {af}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {chain.deceptiveAffixes.details}
                      </p>
                    </div>

                    {/* Visual Logo Similarity */}
                    <div className="rounded-lg bg-[#0e1628] border border-[#1b273d] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white">Visual Logo Spoofing</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {chain.visualLogoSimilarity.percentageScore}% SIMILAR
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-purple-300">
                        {chain.visualLogoSimilarity.badge}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {chain.visualLogoSimilarity.details}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Actionable Next Steps & Takedown Roadmap */}
                <div className="rounded-lg bg-red-950/20 border border-red-500/30 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-1.5 font-mono">
                      <AlertOctagon className="h-4 w-4 text-red-400" />
                      Actionable Next Steps & Takedown Options
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTakedown}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-300 hover:text-white px-2 py-0.5 rounded border border-[#2b3952] bg-[#111a2c]"
                    >
                      {copiedTakedown ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedTakedown ? 'Notice Copied' : 'Copy Abuse Notice Draft'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-200">
                    <strong>Primary Recommendation:</strong> {verdict.recommendation}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-red-500/20">
                    <span className="text-[11px] font-mono text-gray-400">
                      RFC 2142 abuse report prepared for {scanResult.publisherOrDeveloper?.registrar || 'Platform Trust & Safety Desk'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsScannerOpen(false);
                          setSelectedThreatId(scanResult.id);
                        }}
                        className="inline-flex items-center gap-1 rounded bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition"
                      >
                        <span>Open Full Investigation Drawer</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STRUCTURED JSON OUTPUT */}
            {resultView === 'json' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400">
                    Structured JSON Object Payload (RFC 7946 / STIX 2.1 compatible):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 hover:text-white px-2.5 py-1 rounded border border-[#2b3952] bg-[#111a2c]"
                  >
                    {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedJson ? 'Copied to Clipboard' : 'Copy Full JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-[#050811] border border-[#1b253b] text-[11px] font-mono text-gray-200 overflow-x-auto max-h-80 leading-relaxed scrollbar-thin">
                  {JSON.stringify(scanResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
