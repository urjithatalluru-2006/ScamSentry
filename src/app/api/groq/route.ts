import { NextRequest, NextResponse } from 'next/server';

const CANDIDATE_MODELS = [
  process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

// Clean deduplicated list
const MODELS_TO_TRY = Array.from(new Set(CANDIDATE_MODELS.filter(Boolean)));

function parseJsonContent(content: string) {
  let cleaned = content.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  return JSON.parse(cleaned);
}

async function callGroqWithFallback(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  temperature = 0.15
) {
  let lastError = 'No models available';

  for (const model of MODELS_TO_TRY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ScamSentry-DRP/1.0',
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
          temperature,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = parseJsonContent(content);
          return { success: true, model, parsed };
        }
      } else {
        const errText = await response.text();
        console.warn(`Groq model ${model} failed (${response.status}):`, errText);
        lastError = `Groq ${response.status}: ${errText}`;
        // If it's a 404 (model not found), try the next candidate model
        if (response.status === 404 || errText.includes('model_not_found')) {
          continue;
        }
      }
    } catch (err: any) {
      console.warn(`Groq request error with model ${model}:`, err?.message);
      lastError = err?.message || 'Network error';
    }
  }

  return { success: false, error: lastError };
}

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const isConfigured = Boolean(apiKey && apiKey.trim().length > 10 && !apiKey.includes('your_groq_api_key'));

  return NextResponse.json({
    status: 'ok',
    isConfigured,
    model,
    provider: 'Groq Cloud',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'evaluate_target';
    const payload = body.payload || body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey.trim().length === 0 || apiKey.includes('your_groq_api_key')) {
      return NextResponse.json({
        success: false,
        fallbackRequired: true,
        message: 'Groq API key not configured in environment variables. Falling back to local heuristic detection engine.',
      });
    }

    if (action === 'evaluate_target') {
      const { targetIdentifier, category, platform, displayName, rawText, brand } = payload;

      const systemPrompt = `You are the lead Threat Intelligence Engine for ScamSentry DRP (Digital Risk Protection Platform).
Your job is to analyze suspected digital threats (phishing domains, social impersonation handles, malicious mobile APKs) targeting a protected brand and return an exact structured JSON assessment.

Protected Brand Profile:
- Brand Name: "${brand?.name || 'Protected Enterprise'}"
- Official Domains: ${JSON.stringify(brand?.officialDomains || [])}
- Official Social Handles: ${JSON.stringify(brand?.officialHandles || [])}
- Industry: "${brand?.industry || 'General Digital'}"

Analyze the target input with rigorous cybersecurity scrutiny:
1. Typosquatting/Homoglyphs/Leetspeak: Inspect character substitutions (e.g. 0 for o, vv for w, deceptive hyphenation, lookalike TLDs).
2. Deceptive Affixes: Identify urgent scam lures (e.g. -verify, -support, claims, auth, bonus, refund, official).
3. Visual & Logo Spoofing likelihood (0-100% score).
4. Phishing DOM / Mobile Permissions audit.
5. Overall Numerical Risk Score (0-100) and Severity ('critical', 'high', 'medium', or 'low').
6. Detailed explainability, attack method, and actionable next steps/takedown advice.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "riskScore": number (0-100),
  "confidenceScore": number (0-100),
  "severity": "critical" | "high" | "medium" | "low",
  "scoreBreakdown": [
    { "factor": "Brand & Executive Similarity", "points": number, "maxPoints": 25, "description": string, "category": "similarity" },
    { "factor": "Deceptive Social Engineering Patterns", "points": number, "maxPoints": 25, "description": string, "category": "deceptive_intent" },
    { "factor": "Observable Technical Indicators", "points": number, "maxPoints": 20, "description": string, "category": "technical" },
    { "factor": "Target Audience Blast Radius", "points": number, "maxPoints": 15, "description": string, "category": "impact" },
    { "factor": "Evidence Provenance Confidence", "points": number, "maxPoints": 15, "description": string, "category": "confidence" }
  ],
  "explainabilitySummary": string,
  "attackMethod": string,
  "targetAudienceImpact": string,
  "recommendedAction": string,
  "typosquatting": {
    "detected": boolean,
    "patternType": string,
    "substitutions": [ { "original": string, "substituted": string } ],
    "details": string
  },
  "deceptiveAffixes": {
    "detected": boolean,
    "affixesFound": string[],
    "intentRisk": "critical" | "high" | "medium" | "low",
    "details": string
  },
  "visualLogoSimilarity": {
    "percentageScore": number,
    "matchMethod": string,
    "badge": "Exact Vector Clone" | "High Replica" | "Altered Wordmark" | "Color Swatch Match",
    "details": string
  },
  "phishingOrPermissionsAudit": {
    "isPhishingForm": boolean,
    "harvestedFields": string[],
    "maliciousPermissions": string[],
    "riskSummary": string,
    "details": string
  },
  "publisherOrDeveloper": {
    "organizationName": string,
    "registrar": string,
    "developerAccount": string,
    "hostingAsn": string,
    "country": string
  },
  "safetyVerdict": {
    "level": "critical" | "high" | "medium" | "low",
    "title": string,
    "recommendation": string,
    "actionSummary": string
  },
  "actionableNextSteps": string[],
  "takedownNoticeDraft": string
}`;

      const userPrompt = `Target To Evaluate:
- Target Identifier: "${targetIdentifier}"
- Display Name: "${displayName || targetIdentifier}"
- Threat Category: "${category}"
- Target Platform: "${platform}"
- Discovered Content/Bio/DOM: "${rawText || 'None provided'}"`;

      const groqResult = await callGroqWithFallback(apiKey, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], 0.15);

      if (!groqResult.success) {
        return NextResponse.json({
          success: false,
          fallbackRequired: true,
          error: groqResult.error,
        });
      }

      return NextResponse.json({
        success: true,
        aiPowered: true,
        model: groqResult.model,
        result: groqResult.parsed,
      });
    }

    if (action === 'copilot_chat') {
      const { prompt, currentThreat, allThreats, brand } = payload;

      const systemPrompt = `You are the ScamSentry Threat Intelligence AI Copilot for Digital Risk Protection.
Provide authoritative, actionable cybersecurity guidance directly addressing the analyst query.
If asked "is this threat or not" or whether a target is malicious, give a clear, unambiguous verdict (e.g. "**VERDICT: CONFIRMED THREAT (CRITICAL)**") followed by bullet-pointed evidence, technical risk assessment, and recommended takedown/containment steps.

Respond strictly in valid JSON format:
{
  "answer": string (markdown supported with clear headings, bold text, and direct answer),
  "structuredFindings": {
    "observedEvidence": string[],
    "aiInterpretation": string,
    "suggestedAction": string,
    "humanApprovalRequired": boolean
  },
  "suggestedFollowUps": string[]
}`;

      const userPrompt = `Analyst Query: "${prompt}"
Active Target Threat: ${JSON.stringify(currentThreat || (allThreats && allThreats[0]) || 'No single threat selected')}
All Monitored Telemetry: ${JSON.stringify(allThreats || [])}
Protected Brand: ${JSON.stringify(brand || null)}`;

      const groqResult = await callGroqWithFallback(apiKey, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], 0.2);

      if (!groqResult.success) {
        return NextResponse.json({
          success: false,
          fallbackRequired: true,
          error: groqResult.error,
        });
      }

      return NextResponse.json({
        success: true,
        aiPowered: true,
        model: groqResult.model,
        result: groqResult.parsed,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Groq Route Handler Exception:', err);
    return NextResponse.json({
      success: false,
      fallbackRequired: true,
      error: err?.message || 'Internal server error',
    });
  }
}
