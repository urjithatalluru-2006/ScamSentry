import { ThreatEntity, Campaign, BrandAsset } from '@/types/threat';

export interface CopilotResponse {
  answer: string;
  structuredFindings: {
    observedEvidence: string[];
    aiInterpretation: string;
    suggestedAction: string;
    humanApprovalRequired: boolean;
  };
  suggestedFollowUps: string[];
}

export function generateCopilotAnswer(
  prompt: string,
  currentThreat?: ThreatEntity | null,
  allThreats: ThreatEntity[] = [],
  campaigns: Campaign[] = [],
  currentBrand?: BrandAsset
): CopilotResponse {
  const pLower = prompt.toLowerCase();
  const activeThreat = currentThreat || allThreats[0];

  // Direct threat verdict: "Is this a threat or not?"
  if (pLower.includes('threat or not') || pLower.includes('is this threat') || pLower.includes('is it a threat') || pLower.includes('is this safe') || pLower.includes('is this malicious') || pLower.includes('threat or safe')) {
    if (activeThreat) {
      const isHighRisk = activeThreat.riskScore >= 50;
      return {
        answer: `### Security Verdict on **${activeThreat.name}** (${activeThreat.targetIdentifier})\n\n**VERDICT: ${isHighRisk ? '⚠️ CONFIRMED MALICIOUS THREAT' : '🔍 SUSPICIOUS ENTITY UNDER REVIEW'}**\n\n- **Calculated Risk Score:** **${activeThreat.riskScore}/100** (${activeThreat.severity.toUpperCase()})\n- **Confidence Level:** **${activeThreat.confidenceScore}%**\n- **Target Category:** ${activeThreat.category.replace('_', ' ').toUpperCase()} on platform **${activeThreat.platform.toUpperCase()}**\n\n**Reasoning & Indicators:**\n${activeThreat.explainabilitySummary}\n\n**Observable Telemetry Evidence:**\n${activeThreat.evidence.map(e => `• **${e.title}:** ${e.details}`).join('\n')}\n\n**Action Recommendation:**\n${isHighRisk ? 'Immediate platform takedown and perimeter blocking recommended.' : 'Continue continuous monitoring for DNS or content mutations.'}`,
        structuredFindings: {
          observedEvidence: activeThreat.evidence.map(e => `${e.title}: ${e.details}`),
          aiInterpretation: `Target exhibits ${isHighRisk ? 'high-confidence deceptive markers' : 'anomalous indicators'} targeting ${currentBrand?.name || activeThreat.brandName}.`,
          suggestedAction: isHighRisk ? 'Dispatch automated abuse report to registrar/platform.' : 'Triage with secondary sandbox check.',
          humanApprovalRequired: true,
        },
        suggestedFollowUps: [
          'Draft a platform-appropriate abuse report',
          'Why was this profile flagged?',
          'What additional evidence would strengthen this assessment?'
        ],
      };
    }
  }

  // Scenario 1: "Why was this flagged?" or "Why suspicious?"
  if (pLower.includes('why was this') || pLower.includes('why is this') || pLower.includes('what makes this') || pLower.includes('evidence supports')) {
    if (!currentThreat) {
      return {
        answer: 'Please select a specific threat entity from the threat feed or investigation panel to review its flag justification and evidence breakdown.',
        structuredFindings: {
          observedEvidence: ['No threat entity currently selected in the active investigation context.'],
          aiInterpretation: 'A target entity must be in scope to analyze evidence provenance.',
          suggestedAction: 'Select an alert from the Live Threat Feed or specify an entity ID.',
          humanApprovalRequired: false,
        },
        suggestedFollowUps: ['Which threats should our team investigate first?', 'Show active threat campaigns'],
      };
    }

    const evTitles = currentThreat.evidence.map(e => `• ${e.title}: ${e.details} (${e.source}, confidence: ${e.confidence}%)`);
    const breakdown = currentThreat.scoreBreakdown.map(s => `${s.factor}: ${s.points}/${s.maxPoints} pts`).join(' | ');

    return {
      answer: `**Entity Flagging Justification for [${currentThreat.name}] (${currentThreat.targetIdentifier}):**\n\nThis entity received a Risk Score of **${currentThreat.riskScore}/100 (${currentThreat.severity.toUpperCase()})** with **${currentThreat.confidenceScore}% confidence**. The evaluation reflects:\n\n${breakdown}\n\n**Key Detection Reasons:**\n${currentThreat.explainabilitySummary}\n\n**Observable Telemetry:**\n${evTitles.join('\n')}`,
      structuredFindings: {
        observedEvidence: currentThreat.evidence.map(e => `${e.title}: ${e.details}`),
        aiInterpretation: `Entity presents strong deceptive markers imitating ${currentThreat.brandName}. The similarity combined with deceptive terms indicates intent to conduct credential harvesting or scam diversion.`,
        suggestedAction: currentThreat.riskScore >= 75 
          ? 'Submit formal platform takedown and initiate domain sinkholing workflow.'
          : 'Monitor for domain DNS changes or further social posts; escalate if victim reports emerge.',
        humanApprovalRequired: true,
      },
      suggestedFollowUps: [
        'Draft a platform-appropriate abuse report',
        'What additional evidence would strengthen this assessment?',
        'Are there other threats connected to this entity?'
      ],
    };
  }

  // Scenario 2: "Draft abuse report" or "platform takedown notice"
  if (pLower.includes('draft') || pLower.includes('abuse report') || pLower.includes('takedown')) {
    if (!currentThreat) {
      return {
        answer: 'Please select a threat entity first so I can retrieve its verified brand assets, evidence URLs, and platform guidelines.',
        structuredFindings: {
          observedEvidence: ['No active entity in focus.'],
          aiInterpretation: 'Abuse notices require verified trademark and URL references.',
          suggestedAction: 'Open an investigation finding to draft its specific abuse notice.',
          humanApprovalRequired: false,
        },
        suggestedFollowUps: ['Which threats should our team investigate first?'],
      };
    }

    const brandName = currentBrand?.name || currentThreat.brandName || 'Protected Brand';
    const cleanStem = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'brand';
    const officialUrl = currentBrand?.officialDomains[0] || `https://${cleanStem}.com`;

    let reportTemplate = '';
    if (currentThreat.platform === 'x') {
      reportTemplate = `### FORMAL ABUSE REPORT: X / TWITTER SAFETY OPERATIONS
**Report Type:** Impersonation of Brand & Trademark Violation
**Target Account:** ${currentThreat.targetIdentifier}
**Affected Entity:** ${brandName} (Official Account: ${currentBrand?.officialHandles[0]?.handle || `@${cleanStem}_official`})
**Official Domain:** ${officialUrl}

**Violation Summary:**
The reported account is intentionally impersonating the legitimate financial brand "${brandName}". It utilizes lookalike logos and deceptive nomenclature to mislead users into believing it is official customer care.

**Documented Evidence:**
- Handle / Identifier: ${currentThreat.targetIdentifier}
- Detection Timestamp: ${currentThreat.detectedAt}
- Observable Indicators: ${currentThreat.evidence.map(e => e.title).join('; ')}
- Deceptive Links: Discovered off-platform redirection to unverified endpoints.

**Requested Action:** Immediate account suspension under X Impersonation and Deceptive Identities Policy.`;
    } else if (currentThreat.category === 'phishing_website' || currentThreat.platform === 'web') {
      reportTemplate = `### FORMAL ABUSE NOTIFICATION: REGISTRAR & HOSTING PROVIDER
**To:** Abuse Desk / Designated Security Contact
**Incident Category:** Phishing / Fraudulent Brand Spoofing
**Infringing URL:** ${currentThreat.targetIdentifier}
**Legitimate Brand:** ${brandName} (${officialUrl})

**Technical Analysis & Evidence:**
1. The domain host is serving an unauthorized imitation of ${brandName}'s login & authentication workflows.
2. TLS Certificate details indicate ephemeral provisioning without organizational validation.
3. Telemetry timestamp: ${currentThreat.detectedAt} (UTC).
4. Evidence hashes & indicators: ${currentThreat.evidence.map(e => e.title + ' (' + e.source + ')').join('\n   - ')}

**Legal Notice:**
This domain infringes upon registered trademarks and violates anti-phishing statutes. Please immediately suspend DNS delegation and disable hosting services.`;
    } else if (currentThreat.category === 'suspicious_mobile_app') {
      reportTemplate = `### APP STORE ABUSE REPORT: POLICY VIOLATIONS
**Target Package / App:** ${currentThreat.targetIdentifier}
**Platform:** ${currentThreat.platform}
**Legitimate App:** ${brandName} Official Application

**Infringement Details:**
1. Unauthorized brand name, trademark, and asset appropriation.
2. Suspicious static capabilities: ${currentThreat.evidence.map(e => e.details).join('; ')}.
3. Deceptive publisher identity pretending to represent ${brandName}.

**Requested Action:** Immediate removal from distribution channels.`;
    } else {
      reportTemplate = `### ABUSE COMPLAINT: DIGITAL BRAND IMPERSONATION
**Platform:** ${currentThreat.platform}
**Entity ID:** ${currentThreat.targetIdentifier}
**Impersonated Brand:** ${brandName}

The account ${currentThreat.targetIdentifier} is unlawfully using ${brandName} brand assets to mislead users and solicit unauthorized transactions. We demand immediate investigation and termination under your terms of service.`;
    }

    return {
      answer: reportTemplate,
      structuredFindings: {
        observedEvidence: currentThreat.evidence.map(e => `${e.source}: ${e.title}`),
        aiInterpretation: `Formal abuse submission package prepared incorporating trademark references for ${brandName}.`,
        suggestedAction: 'Review the drafted notification, ensure authorization credentials, and approve submission.',
        humanApprovalRequired: true,
      },
      suggestedFollowUps: [
        'Export evidence package as JSON',
        'What is the expected platform resolution SLA?',
        'Show campaign connections'
      ],
    };
  }

  // Scenario 3: "Are these accounts part of the same campaign?" or "Campaign analysis"
  if (pLower.includes('campaign') || pLower.includes('same campaign') || pLower.includes('coordinated') || pLower.includes('connected')) {
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const campaignSummaries = activeCampaigns.map(c => 
      `• **${c.name}** (Severity: ${c.severity.toUpperCase()}, Score: ${c.riskScore}): Encompasses ${c.entitiesCount} linked entities across ${c.sharedIndicators.length} shared indicators (e.g. ${c.sharedIndicators.map(i => `${i.type}: ${i.value}`).join(', ')}). Threat Actor: ${c.threatActorGroup || 'Unassigned Cluster'}.`
    ).join('\n\n');

    return {
      answer: `### Coordinated Campaign & Cluster Intelligence:\n\nOur correlation engine currently tracks **${activeCampaigns.length} active coordinated threat clusters**:\n\n${campaignSummaries}\n\n**Correlation Methodology:**\nEntities are grouped based on shared infrastructure indicators (identical registrant emails, shared hosting ASN/IPs, identical off-platform Telegram channels, or matching cryptocurrency deposit addresses). Superficial similarity alone does not trigger campaign clustering.`,
      structuredFindings: {
        observedEvidence: activeCampaigns.flatMap(c => c.sharedIndicators.map(i => `Shared ${i.type}: ${i.value}`)),
        aiInterpretation: `Evidence strongly indicates coordinated syndication rather than independent threat actors. The cross-platform presence (social handles pointing to centralized phishing domains) suggests systematic infrastructure deployment.`,
        suggestedAction: 'Execute multi-entity coordinated takedown to dismantle root domain and command nodes simultaneously.',
        humanApprovalRequired: true,
      },
      suggestedFollowUps: [
        'Explore Campaign relationship graph',
        'Which threats should our team investigate first?',
        'Draft a platform-appropriate abuse report'
      ],
    };
  }

  // Scenario 4: "Which threats should our team investigate first?" / Priority triage
  if (pLower.includes('first') || pLower.includes('priority') || pLower.includes('investigate first') || pLower.includes('triage')) {
    const sorted = [...allThreats]
      .filter(t => t.status !== 'resolved' && t.status !== 'false_positive')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 4);

    const listStr = sorted.map((t, idx) => 
      `${idx + 1}. **[${t.severity.toUpperCase()}] ${t.name}** (Score: ${t.riskScore}/100) — *${t.platform.toUpperCase()}* | Identifier: \`${t.targetIdentifier}\`\n   - Reason: ${t.scoreBreakdown[0]?.description || t.explainabilitySummary}\n   - Status: \`${t.status}\``
    ).join('\n\n');

    return {
      answer: `### Recommended Triage Priority Queue (Top ${sorted.length} Incidents):\n\nBased on calculated risk score, potential customer blast radius, and verifiable evidence confidence, the following threats require immediate analyst attention:\n\n${listStr}\n\n**Recommendation:** Address the Critical findings immediately to mitigate active credential harvesting before transitioning to Medium or exploratory leads.`,
      structuredFindings: {
        observedEvidence: sorted.map(t => `${t.name}: Risk Score ${t.riskScore}, Status ${t.status}`),
        aiInterpretation: 'Triage prioritization follows normalized multi-factor risk assessment, favoring high-impact credential interception vectors.',
        suggestedAction: `Assign Senior Analyst to Case #${sorted[0]?.id || '1'} and initiate containment.`,
        humanApprovalRequired: true,
      },
      suggestedFollowUps: [
        'Why was the top critical threat flagged?',
        'Draft a platform-appropriate abuse report',
        'Summarize this incident for the security team'
      ],
    };
  }

  // Scenario 5: "What additional evidence would strengthen this assessment?"
  if (pLower.includes('additional evidence') || pLower.includes('strengthen') || pLower.includes('missing')) {
    const missing = currentThreat?.aiAnalysis.missingInformation || [
      'Passive DNS historical resolution history (IP change velocity)',
      'Autonomous System Number (ASN) upstream transit peering telemetry',
      'TLS Certificate transparency SAN list expansion',
      'Confirmed end-user telemetry reports or scam transaction hashes'
    ];

    return {
      answer: `### Evidence Strengthening & Intelligence Gap Analysis:\n\nTo increase confidence from **${currentThreat?.confidenceScore || 85}%** to definitive attribution, the following telemetry feeds should be queried:\n\n${missing.map(m => `• ${m}`).join('\n')}\n\n*Transparency Note: ScamSentry adheres to strict evidentiary standards and marks these signals as unverified until corroborating telemetry is returned by authorized connectors.*`,
      structuredFindings: {
        observedEvidence: currentThreat ? currentThreat.evidence.map(e => e.title) : ['Standard observable records'],
        aiInterpretation: 'Current confidence is high on lexical and infrastructure similarity, but attribution to a specific threat actor requires network pivot analysis.',
        suggestedAction: 'Execute external WHOIS lookup connector and pull passive DNS records.',
        humanApprovalRequired: false,
      },
      suggestedFollowUps: [
        'Why was this profile flagged?',
        'Draft a platform-appropriate abuse report',
        'Show active campaigns'
      ],
    };
  }

  // Scenario 6: "Summarize this incident for the security team / CISO"
  if (pLower.includes('summarize') || pLower.includes('ciso') || pLower.includes('executive') || pLower.includes('incident report')) {
    const threat = currentThreat || allThreats[0];
    const brandName = currentBrand?.name || threat?.brandName || 'Protected Brand';

    return {
      answer: `### EXECUTIVE INCIDENT BRIEFING
**Target Asset:** ${threat?.name} (\`${threat?.targetIdentifier}\`)
**Impersonated Brand:** ${brandName}
**Severity Rating:** ${threat?.severity.toUpperCase()} (Score: ${threat?.riskScore}/100)
**Current Incident Status:** ${threat?.status.toUpperCase()}

**Executive Summary:**
A digital brand impersonation incident was detected targeting ${brandName} customers. The hostile entity leverages confusingly similar trademarks and deceptive keywords designed to mislead end-users during customer care interactions.

**Potential Business Impact:**
${threat?.aiAnalysis.targetAudienceImpact || 'Risk of credential compromise and financial diversion.'}

**Technical Vector:**
${threat?.aiAnalysis.attackMethod || 'Social engineering with off-platform redirection.'}

**Containment Strategy:**
${threat?.aiAnalysis.recommendedAction || 'Escalate to platform registrar and publish advisory notice.'}

*Prepared by ScamSentry AI Intelligence Engine.*`,
      structuredFindings: {
        observedEvidence: threat ? threat.evidence.map(e => e.title) : ['Seeded detection signals'],
        aiInterpretation: `Incident presents reputational and customer trust risk for ${brandName}. Timely containment preserves customer assets.`,
        suggestedAction: 'Approve takedown request and update corporate security response log.',
        humanApprovalRequired: true,
      },
      suggestedFollowUps: [
        'Draft a platform-appropriate abuse report',
        'Which threats should our team investigate first?',
        'Export full evidence ledger'
      ],
    };
  }

  // Default fallback answer
  return {
    answer: `I am your **ScamSentry AI Investigation Copilot**. I have real-time visibility into all **${allThreats.length} detected digital risks**, **${campaigns.length} campaigns**, and registered brand assets for **${currentBrand?.name || 'Protected Brand'}**.\n\nYou can ask me specific questions regarding any threat, ask me to correlate connected entities, or have me draft a platform-ready abuse report. All conclusions are strictly backed by verifiable evidence.`,
    structuredFindings: {
      observedEvidence: [`${allThreats.length} total threat records monitored`, `${campaigns.length} campaign clusters tracked`],
      aiInterpretation: 'Awaiting analyst investigation query.',
      suggestedAction: 'Select an investigation prompt below to proceed.',
      humanApprovalRequired: false,
    },
    suggestedFollowUps: [
      'Which threats should our team investigate first?',
      'Why was this profile flagged?',
      'Are these accounts part of the same campaign?',
      'Draft a platform-appropriate abuse report'
    ],
  };
}
