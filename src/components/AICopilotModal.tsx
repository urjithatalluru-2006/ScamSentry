'use client';

import React, { useState } from 'react';
import { useThreat } from '@/context/ThreatContext';
import { generateCopilotAnswer, CopilotResponse } from '@/lib/copilotEngine';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface ChatEntry {
  sender: 'user' | 'assistant';
  text: string;
  structured?: CopilotResponse['structuredFindings'];
  timestamp: string;
}

export default function AICopilotModal() {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    selectedThreat,
    threats,
    campaigns,
    selectedBrand,
  } = useThreat();

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your **ScamSentry Threat Intelligence Copilot**. I analyze observable telemetry, brand assets, and multi-factor heuristics to support your investigation. How can I assist with **${selectedThreat ? selectedThreat.name : selectedBrand.name}**?`,
      timestamp: '10:00 AM',
    },
  ]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isCopilotOpen) return null;

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userEntry: ChatEntry = {
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userEntry]);
    setInputPrompt('');
    setIsLoading(true);

    let groqAnswer: any = null;

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'copilot_chat',
          payload: {
            prompt: promptText,
            currentThreat: selectedThreat || (threats && threats[0]) || null,
            allThreats: threats.map(t => ({
              id: t.id,
              name: t.name,
              category: t.category,
              platform: t.platform,
              riskScore: t.riskScore,
              severity: t.severity,
              targetIdentifier: t.targetIdentifier,
              explainabilitySummary: t.explainabilitySummary,
            })),
            brand: selectedBrand,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          groqAnswer = data.result;
        }
      }
    } catch {
      // Fallback
    }

    if (groqAnswer) {
      const botEntry: ChatEntry = {
        sender: 'assistant',
        text: groqAnswer.answer,
        structured: groqAnswer.structuredFindings,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botEntry]);
    } else {
      const response = generateCopilotAnswer(
        promptText,
        selectedThreat,
        threats,
        campaigns,
        selectedBrand
      );

      const botEntry: ChatEntry = {
        sender: 'assistant',
        text: response.answer,
        structured: response.structuredFindings,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botEntry]);
    }

    setIsLoading(false);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const presetPrompts = [
    'Why was this profile flagged?',
    'What makes this domain suspicious?',
    'Are these accounts part of the same campaign?',
    'Draft a platform-appropriate abuse report',
    'Which threats should our team investigate first?',
    'What additional evidence would strengthen this assessment?',
    'Summarize this incident for CISO',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl h-full bg-[#0b101c] border-l border-[#1f293d] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1f293d] bg-[#090d16] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">AI Threat Copilot</h2>
                <span className="text-[10px] font-mono rounded bg-purple-500/20 px-1.5 py-0.2 text-purple-300 border border-purple-500/30">
                  GROUNDED
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                Context:{' '}
                <strong className="text-amber-400">
                  {selectedThreat ? `${selectedThreat.name} (${selectedThreat.severity.toUpperCase()})` : `All ${selectedBrand.name} Assets`}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCopilotOpen(false)}
            className="p-1.5 rounded-lg border border-[#1f293d] bg-[#111726] text-gray-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-3 border-b border-[#1f293d] bg-[#0d1424] overflow-x-auto flex gap-1.5 scrollbar-none">
          {presetPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(p)}
              className="flex-shrink-0 rounded-full border border-[#1f293d] bg-[#111726] px-2.5 py-1 text-[11px] text-gray-300 hover:border-purple-400 hover:text-purple-300 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Messages Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'assistant' && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-400 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-gray-100'
                  : 'bg-[#121929] border border-[#1f293d] text-gray-200'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.text}
                </div>

                {/* Structured Grounded Findings Cards */}
                {msg.structured && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-[#1b253b] text-[11px]">
                    {/* Observed Evidence */}
                    <div className="p-2 rounded bg-[#090e1a] border border-[#19243a]">
                      <span className="font-mono text-[9px] uppercase font-bold text-cyan-400 block mb-0.5">
                        [OBSERVED TELEMETRY EVIDENCE]
                      </span>
                      <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                        {msg.structured.observedEvidence.map((ev, eIdx) => (
                          <li key={eIdx}>{ev}</li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Interpretation */}
                    <div className="p-2 rounded bg-[#090e1a] border border-[#19243a]">
                      <span className="font-mono text-[9px] uppercase font-bold text-purple-400 block mb-0.5">
                        [AI INTERPRETATION]
                      </span>
                      <p className="text-gray-300">{msg.structured.aiInterpretation}</p>
                    </div>

                    {/* Suggested Action & Human Approval */}
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/25 flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[9px] uppercase font-bold text-amber-400 block mb-0.5">
                          [SUGGESTED ACTION]
                        </span>
                        <p className="text-amber-200">{msg.structured.suggestedAction}</p>
                      </div>
                      {msg.structured.humanApprovalRequired && (
                        <span className="flex-shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          APPROVAL REQUIRED
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      className="text-gray-400 hover:text-white flex items-center gap-1 transition"
                    >
                      {copiedIdx === i ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#1a2337] border border-[#24324f] text-gray-300 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-400 mt-1">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-xl p-3 bg-[#121929] border border-[#1f293d] text-xs text-purple-300 flex items-center gap-2 font-mono">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-purple-400" />
                <span>Synthesizing threat intelligence reasoning...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#1f293d] bg-[#090d16]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputPrompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Copilot to analyze threats, correlate campaigns, or draft takedown abuse notices..."
              className="flex-1 rounded-lg border border-[#1f293d] bg-[#111726] px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim()}
              className="rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-500 transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
