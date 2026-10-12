'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import { BrandAsset, Platform } from '@/types/threat';
import {
  Building2,
  CheckCircle2,
  Plus,
  Globe,
  Users,
  Smartphone,
  ShieldAlert,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function BrandAssetManager() {
  const { selectedBrand, updateBrand, addBrand, currentUserRole } = useThreat();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<BrandAsset>(selectedBrand);

  // New Brand form state
  const [newBrandName, setNewBrandName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [newIndustry, setNewIndustry] = useState('FinTech');

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrand(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddNewBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    addBrand({
      name: newBrandName.trim(),
      officialDomains: [newDomain.trim() || `${newBrandName.toLowerCase().replace(/\s+/g, '')}.com`],
      aliases: newAlias.trim() ? [newAlias.trim()] : [newBrandName.trim()],
      officialHandles: [{ platform: 'x', handle: `@${newHandle.trim() || newBrandName.toLowerCase()}` }],
      executives: [{ name: 'Executive Officer', title: 'Managing Director' }],
      officialAppIds: [`com.${newBrandName.toLowerCase().replace(/\s+/g, '')}.app`],
      industry: newIndustry,
      monitoringSensitivity: 'high',
    });

    setIsAddingNew(false);
    setNewBrandName('');
    setNewDomain('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Monitored Brand & Reference Asset Registry
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure verified trademarks, executive identities, official domains, and detection sensitivity thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUserRole === 'admin' && (
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register New Brand</span>
            </button>
          )}
        </div>
      </div>

      {/* NEW BRAND REGISTRATION WIZARD */}
      {isAddingNew && (
        <div className="rounded-xl border border-amber-500/40 bg-[#0d1424] p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b253b]">
            <h3 className="text-xs font-bold text-amber-300 uppercase font-mono">
              Brand Onboarding Setup Wizard
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Step 1 of 1</span>
          </div>

          <form onSubmit={handleAddNewBrand} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  COMPANY / BRAND NAME *
                </label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Acme Payments Corp"
                  className="w-full rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  OFFICIAL PRIMARY DOMAIN *
                </label>
                <input
                  type="text"
                  required
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. acmepay.com"
                  className="w-full rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  BRAND ALIAS / PRODUCT
                </label>
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="e.g. Acme Pay, AcmeWallet"
                  className="w-full rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  OFFICIAL SOCIAL HANDLE
                </label>
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  placeholder="e.g. acme_official"
                  className="w-full rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  INDUSTRY VERTICAL
                </label>
                <select
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="w-full rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="FinTech & Payments">FinTech & Payments</option>
                  <option value="Retail Banking">Retail Banking</option>
                  <option value="Crypto & Web3">Crypto & Web3</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="SaaS & Cloud">SaaS & Cloud</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#1b253b]">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg border border-[#1f293d] text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-xs font-bold text-black hover:bg-amber-400"
              >
                Register & Initialize Monitoring
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ACTIVE BRAND DETAILS CARD */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-5 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-white text-base">
              {selectedBrand.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{selectedBrand.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  VERIFIED TRADEMARKS
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Industry: <strong className="text-gray-300">{selectedBrand.industry}</strong> • Sensitivity:{' '}
                <strong className="text-amber-400 uppercase">{selectedBrand.monitoringSensitivity}</strong>
              </p>
            </div>
          </div>

          <div>
            {savedSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 mr-2">
                <Check className="h-4 w-4" /> Assets Updated!
              </span>
            )}
          </div>
        </div>

        {/* Brand Asset Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Domains */}
          <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>Official Registered Domains</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-gray-300">
              {selectedBrand.officialDomains.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded bg-[#111726] border border-[#182338]">
                  <span>{d}</span>
                  <span className="text-[9px] text-emerald-400">Primary</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Profiles */}
          <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span>Official Social Handles</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-gray-300">
              {selectedBrand.officialHandles.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded bg-[#111726] border border-[#182338]">
                  <span>{h.handle}</span>
                  <span className="text-[9px] text-gray-400 uppercase">{h.platform}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Apps & Executives */}
          <div className="rounded-lg bg-[#0d1424] border border-[#1b253b] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Smartphone className="h-3.5 w-3.5 text-orange-400" />
              <span>Official Mobile Bundles & Executives</span>
            </div>
            <div className="space-y-1 text-[11px] text-gray-300">
              {selectedBrand.officialAppIds.map((a, i) => (
                <div key={i} className="p-1.5 rounded bg-[#111726] border border-[#182338] font-mono text-[10px] truncate">
                  Package: {a}
                </div>
              ))}
              {selectedBrand.executives.map((ex, i) => (
                <div key={i} className="p-1.5 rounded bg-[#111726] border border-[#182338] flex items-center justify-between">
                  <span>{ex.name}</span>
                  <span className="text-[9px] text-gray-400 font-mono">{ex.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monitoring Sensitivity Configuration */}
        <div className="rounded-lg bg-[#090d16] border border-[#1b253b] p-3.5 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Detection Engine Thresholds</h4>
            <p className="text-[11px] text-gray-400">
              Maximum sensitivity triggers instant alerts on 1-character typosquatting and unverified social mentions.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['standard', 'high', 'maximum'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateBrand({ ...selectedBrand, monitoringSensitivity: level })}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-semibold transition ${
                  selectedBrand.monitoringSensitivity === level
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-[#111726] border border-[#1f293d] text-gray-400 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
