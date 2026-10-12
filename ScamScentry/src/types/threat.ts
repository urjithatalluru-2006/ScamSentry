export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ThreatCategory = 
  | 'social_impersonation'
  | 'phishing_website'
  | 'suspicious_mobile_app'
  | 'fraud_campaign';

export type Platform = 
  | 'x' 
  | 'instagram' 
  | 'facebook' 
  | 'telegram' 
  | 'linkedin' 
  | 'tiktok' 
  | 'web' 
  | 'google_play' 
  | 'apple_app_store' 
  | 'third_party_apk';

export type LifecycleStatus = 
  | 'detected' 
  | 'triaged' 
  | 'investigating' 
  | 'confirmed' 
  | 'action_requested' 
  | 'monitoring' 
  | 'resolved' 
  | 'false_positive';

export type DataSourceType = 'live' | 'imported' | 'synthetic_demo';

export type UserRole = 'admin' | 'soc_analyst' | 'investigator' | 'executive';

export interface BrandAsset {
  id: string;
  name: string;
  officialDomains: string[];
  aliases: string[];
  officialHandles: { platform: Platform; handle: string }[];
  executives: { name: string; title: string }[];
  officialAppIds: string[];
  logoFingerprintHash?: string;
  industry: string;
  verified: boolean;
  monitoringSensitivity: 'standard' | 'high' | 'maximum';
}

export interface ScoreFactor {
  factor: string;
  points: number;
  maxPoints: number;
  description: string;
  category: 'similarity' | 'deceptive_intent' | 'technical' | 'impact' | 'confidence';
}

export interface ObservableEvidence {
  id: string;
  type: 'url' | 'screenshot' | 'whois' | 'dns' | 'ssl' | 'text_match' | 'permission' | 'wallet_address';
  title: string;
  details: string;
  timestamp: string;
  source: string;
  confidence: number; // 0 - 100
  rawPayload?: Record<string, any>;
}

export interface RelatedEntity {
  id: string;
  name: string;
  type: 'account' | 'domain' | 'app' | 'ioc' | 'campaign' | 'brand';
  relationship: string;
  riskScore: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  action: string;
  details: string;
  type: 'detection' | 'triage' | 'escalation' | 'takedown' | 'resolution' | 'comment';
}

export interface PublisherOrDeveloper {
  organizationName?: string;
  developerAccount?: string;
  developerEmail?: string;
  registrar?: string;
  hostingAsn?: string;
  country?: string;
  registrationDate?: string;
}

export interface EvidenceChain {
  typosquattingLeetspeak: {
    detected: boolean;
    originalBrand: string;
    targetString: string;
    substitutions: { original: string; substituted: string; index?: number }[];
    patternType: string;
    details: string;
  };
  deceptiveAffixes: {
    detected: boolean;
    affixesFound: string[];
    intentRisk: 'low' | 'medium' | 'high' | 'critical';
    details: string;
  };
  visualLogoSimilarity: {
    percentageScore: number;
    matchMethod: string;
    referenceAsset: string;
    badge: 'Exact Vector Clone' | 'High Replica' | 'Altered Wordmark' | 'Color Swatch Match' | 'No Logo Detected';
    details: string;
  };
  phishingOrPermissionsAudit: {
    isPhishingForm: boolean;
    harvestedFields: string[];
    maliciousPermissions: string[];
    riskSummary: string;
    details: string;
  };
}

export interface LinkedIOC {
  type: 'ip' | 'telegram' | 'crypto_wallet' | 'c2_domain' | 'email';
  value: string;
  label: string;
  attribution?: string;
}

export interface SafetyVerdict {
  level: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  recommendation: string;
  actionSummary: string;
}

export interface ThreatEntity {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  targetIdentifier: string; // e.g. @brand_support, https://brand-verify.cc, com.brand.app
  category: ThreatCategory;
  platform: Platform;
  status: LifecycleStatus;
  severity: Severity;
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  firstSeen: string;
  lastSeen: string;
  detectedAt: string;
  dataSource: DataSourceType;
  
  // Basic Entity Details
  publisherOrDeveloper?: PublisherOrDeveloper;

  // Scoring details
  scoreBreakdown: ScoreFactor[];
  explainabilitySummary: string;
  
  // Observable Evidence
  evidence: ObservableEvidence[];
  
  // Specific Evidence Chain (Why it's a threat)
  evidenceChain?: EvidenceChain;

  // Campaign & IOC Correlations
  campaignId?: string;
  campaignName?: string;
  relatedEntities: RelatedEntity[];
  linkedIocs?: LinkedIOC[];

  // Actionable Safety Verdict
  safetyVerdict?: SafetyVerdict;

  // AI analysis findings
  aiAnalysis: {
    summary: string;
    attackMethod: string;
    targetAudienceImpact: string;
    recommendedAction: string;
    confidenceLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
    missingInformation?: string[];
  };
  
  // Case management
  assignee?: string;
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  tags: string[];
  notes: string[];
  resolutionNotes?: string;
  falsePositiveReason?: string;
  
  // Timeline & Takedown
  timeline: TimelineEvent[];
  takedownStatus?: {
    platformReported: boolean;
    providerContacted?: string;
    referenceTicket?: string;
    requestedAt?: string;
    estimatedResolutionHours?: number;
    approvedBy?: string;
  };
}

export interface Campaign {
  id: string;
  name: string;
  threatActorGroup?: string;
  description: string;
  targetBrandIds: string[];
  riskScore: number;
  severity: Severity;
  status: 'active' | 'mitigated' | 'monitoring';
  firstSeen: string;
  entitiesCount: number;
  sharedIndicators: {
    type: 'domain' | 'ip' | 'registrar' | 'telegram' | 'crypto_wallet' | 'email';
    value: string;
  }[];
  memberThreatIds: string[];
}

export interface MonitoringConnector {
  id: string;
  name: string;
  category: 'social' | 'domain' | 'mobile' | 'threat_feed' | 'custom_api';
  status: 'active' | 'degraded' | 'syncing' | 'error';
  sourceType: DataSourceType;
  lastSync: string;
  frequencyMinutes: number;
  eventsIngestedLast24h: number;
  apiQuotaUsedPercentage: number;
  latencyMs: number;
  errorDetails?: string;
  configuredBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: UserRole;
  action: string;
  targetEntityId: string;
  targetEntityName: string;
  details: string;
  ipAddress: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  groundedFindings?: {
    observedEvidence: string[];
    aiInterpretation: string;
    suggestedAction: string;
    humanApprovalRequired: boolean;
  };
}
