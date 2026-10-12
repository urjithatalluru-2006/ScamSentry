'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import { parseTargetInput } from '@/lib/targetParser';
import {
  Radar,
  Play,
  Globe,
  Users,
  Smartphone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

export default function QuickTargetInputBar() {
  const { selectedBrand, scanNewTarget, setSelectedThreatId, setIsScannerOpen } = useThreat();
  const [inputVal, setInputVal] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const brandStem = selectedBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'brand';
  const parsed = inputVal.trim() ? parseTargetInput(inputVal.trim(), selectedBrand.name) : null;

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setIsScanning(true);
    setStatusMessage('Evaluating target against threat signatures...');

    const parsedInfo = parseTargetInput(inputVal.trim(), selectedBrand.name);
    let groqData: any = null;

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate_target',
          payload: {
            targetIdentifier: parsedInfo.targetIdentifier,
            displayName: parsedInfo.displayName,
            category: parsedInfo.category,
            platform: parsedInfo.platform,
            rawText: parsedInfo.suggestedContextText,
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
      // Graceful fallback to heuristic evaluation
    }

    setTimeout(() => {
      const createdThreat = scanNewTarget(
        {
          targetIdentifier: parsedInfo.targetIdentifier,
          displayName: parsedInfo.displayName,
          category: parsedInfo.category,
          platform: parsedInfo.platform,
          rawText: parsedInfo.suggestedContextText,
          publisherDetails: parsedInfo.publisher,
        },
        groqData
      );

      setSelectedThreatId(createdThreat.id);
      setIsScanning(false);
      setStatusMessage('');
      setInputVal('');
    }, 600);
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-[#0d1424] via-[#111827] to-[#0c1220] p-4 shadow-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Radar className="h-4 w-4 animate-spin" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <span>On-Demand Target Threat Scanner Bar</span>
              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Live Heuristics + Groq LLaMA
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Input any custom domain URL, social media handle, or Android package to immediately parse, score, and generate structured evidence.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
        >
          <span>Advanced Simulator Options</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Enter custom target: e.g. https://${brandStem}-claims.cc, @${brandStem}_verify, or com.${brandStem}.app`}
            className="w-full rounded-lg border border-[#23324f] bg-[#070b14] px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition font-mono"
          />

          {parsed && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#18233a] text-cyan-300 border border-[#23324f] flex items-center gap-1">
                {parsed.detectedType === 'domain' && <Globe className="h-3 w-3 text-cyan-400" />}
                {parsed.detectedType === 'social_handle' && <Users className="h-3 w-3 text-purple-400" />}
                {parsed.detectedType === 'mobile_package' && <Smartphone className="h-3 w-3 text-orange-400" />}
                <span>{parsed.platform.toUpperCase()}</span>
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isScanning || !inputVal.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 transition disabled:opacity-50 shadow-md shadow-amber-950/40 flex-shrink-0"
        >
          {isScanning ? (
            <>
              <Radar className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-black" />
              <span>Scan & Score Target</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Test Target Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-400">
        <span className="font-mono text-[10px] uppercase text-gray-500">Quick Test Targets:</span>
        <button
          type="button"
          onClick={() => setInputVal(`https://${brandStem}-auth-login.cc`)}
          className="px-2 py-0.5 rounded bg-[#101726] border border-[#1e2a40] text-gray-300 hover:text-amber-300 hover:border-amber-400 font-mono transition"
        >
          https://{brandStem}-auth-login.cc
        </button>
        <button
          type="button"
          onClick={() => setInputVal(`@${brandStem}_urgent_support`)}
          className="px-2 py-0.5 rounded bg-[#101726] border border-[#1e2a40] text-gray-300 hover:text-amber-300 hover:border-amber-400 font-mono transition"
        >
          @{brandStem}_urgent_support
        </button>
        <button
          type="button"
          onClick={() => setInputVal(`com.${brandStem}.claimrewards.app`)}
          className="px-2 py-0.5 rounded bg-[#101726] border border-[#1e2a40] text-gray-300 hover:text-amber-300 hover:border-amber-400 font-mono transition"
        >
          com.{brandStem}.claimrewards.app
        </button>
      </div>

      {statusMessage && (
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2 font-mono animate-pulse">
          <Radar className="h-3.5 w-3.5 animate-spin text-amber-400" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
