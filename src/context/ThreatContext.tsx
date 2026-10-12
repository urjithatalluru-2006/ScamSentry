'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BrandAsset,
  ThreatEntity,
  Campaign,
  MonitoringConnector,
  AuditLogEntry,
  LifecycleStatus,
  UserRole,
  ThreatCategory,
  Platform,
  Severity,
} from '@/types/threat';
import {
  INITIAL_BRANDS,
  INITIAL_CAMPAIGNS,
  INITIAL_THREATS,
  INITIAL_CONNECTORS,
  INITIAL_AUDIT_LOGS,
  SAMPLE_CAMPAIGNS,
  generateSampleThreatsForBrand,
} from '@/lib/mockData';
import { evaluateThreat, ScanInput } from '@/lib/detectionEngine';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: Severity;
  threatId?: string;
  read: boolean;
}

interface ThreatContextType {
  // Brands
  brands: BrandAsset[];
  selectedBrandId: string;
  selectedBrand: BrandAsset;
  setSelectedBrandId: (id: string) => void;
  addBrand: (brand: Omit<BrandAsset, 'id' | 'verified'>) => void;
  updateBrand: (brand: BrandAsset) => void;
  setCustomBrandName: (name: string, domain?: string) => void;
  resetToEmptyState: () => void;
  loadSampleTelemetryForCurrentBrand: () => void;

  // Threats
  threats: ThreatEntity[];
  filteredThreats: ThreatEntity[];
  selectedThreatId: string | null;
  selectedThreat: ThreatEntity | null;
  setSelectedThreatId: (id: string | null) => void;
  updateThreatStatus: (threatId: string, newStatus: LifecycleStatus, reason?: string) => void;
  assignThreat: (threatId: string, assignee: string) => void;
  addThreatNote: (threatId: string, note: string) => void;
  requestTakedown: (threatId: string, provider: string, notes?: string) => void;
  markFalsePositive: (threatId: string, reason: string) => void;
  scanNewTarget: (input: Omit<ScanInput, 'brand'>, groqResult?: any) => ThreatEntity;

  // Campaigns
  campaigns: Campaign[];

  // Connectors & Audit
  connectors: MonitoringConnector[];
  auditLogs: AuditLogEntry[];

  // User & RBAC
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;

  // Navigation & Modals
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  severityFilter: string;
  setSeverityFilter: (s: string) => void;
  platformFilter: string;
  setPlatformFilter: (p: string) => void;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const ThreatContext = createContext<ThreatContextType | undefined>(undefined);

export function ThreatProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<BrandAsset[]>(INITIAL_BRANDS);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(INITIAL_BRANDS[0]?.id || 'brand-primary');
  const [threats, setThreats] = useState<ThreatEntity[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [connectors, setConnectors] = useState<MonitoringConnector[]>(INITIAL_CONNECTORS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('soc_analyst');

  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Notifications - initialized clean and empty
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setAuditLogs([
      {
        id: 'audit-init',
        timestamp: new Date().toISOString(),
        user: 'Security Operations',
        userRole: 'soc_analyst',
        action: 'DRP Console Initialized',
        targetEntityId: INITIAL_BRANDS[0]?.id || 'brand-primary',
        targetEntityName: INITIAL_BRANDS[0]?.name || 'Protected Brand',
        details: 'Clean Digital Risk Protection session established. Awaiting target ingestion.',
        ipAddress: '127.0.0.1',
      },
    ]);
  }, []);

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0];
  const selectedThreat = threats.find(t => t.id === selectedThreatId) || null;

  // Filtered threats based on selected brand, category, search, and filters
  const filteredThreats = threats.filter(t => {
    // Brand filter
    if (t.brandId !== selectedBrandId && selectedBrandId !== 'all') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchId = t.targetIdentifier.toLowerCase().includes(q);
      const matchSummary = t.explainabilitySummary.toLowerCase().includes(q);
      const matchTags = t.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchName && !matchId && !matchSummary && !matchTags) return false;
    }

    // Severity filter
    if (severityFilter !== 'all' && t.severity !== severityFilter) return false;

    // Platform filter
    if (platformFilter !== 'all' && t.platform !== platformFilter) return false;

    // Status filter
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    return true;
  });

  const addBrand = (newBrandData: Omit<BrandAsset, 'id' | 'verified'>) => {
    const brand: BrandAsset = {
      ...newBrandData,
      id: `brand-${Date.now()}`,
      verified: true,
    };
    setBrands(prev => [...prev, brand]);
    setSelectedBrandId(brand.id);
    logAudit('Brand Asset Registered', brand.id, brand.name, `Brand ${brand.name} added to enterprise monitoring.`);
  };

  const updateBrand = (updatedBrand: BrandAsset) => {
    setBrands(prev => prev.map(b => b.id === updatedBrand.id ? updatedBrand : b));
    logAudit('Brand Asset Updated', updatedBrand.id, updatedBrand.name, `Updated assets and monitoring sensitivity.`);
  };

  const setCustomBrandName = (name: string, domain?: string) => {
    const cleanDomain = domain || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const updated: BrandAsset = {
      ...selectedBrand,
      name,
      officialDomains: [cleanDomain, ...(selectedBrand.officialDomains.slice(1))],
      aliases: [name, `${name} Global`, `${name} App`],
      officialHandles: [{ platform: 'x', handle: `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_official` }],
    };

    setBrands(prev => prev.map(b => b.id === selectedBrand.id ? updated : b));
    
    // Update active threats' brandName
    setThreats(prev => prev.map(t => {
      if (t.brandId === selectedBrand.id) {
        return {
          ...t,
          brandName: name,
        };
      }
      return t;
    }));

    logAudit('Brand Customized', selectedBrand.id, name, `Renamed protected brand to ${name} (${cleanDomain}).`);
  };

  const resetToEmptyState = () => {
    setThreats([]);
    setSelectedThreatId(null);
    setCampaigns([]);
    setNotifications([]);
    logAudit('Clean State Initialized', selectedBrand.id, selectedBrand.name, 'Threat feed reset to empty clean state for manual scanning.');
  };

  const loadSampleTelemetryForCurrentBrand = () => {
    const generated = generateSampleThreatsForBrand(selectedBrand);
    setThreats(generated);
    setCampaigns(SAMPLE_CAMPAIGNS);
    setSelectedThreatId(generated[0]?.id || null);
    logAudit('Sample Telemetry Seeded', selectedBrand.id, selectedBrand.name, `Generated ${generated.length} realistic telemetry findings for ${selectedBrand.name}.`);
  };

  const logAudit = (action: string, entityId: string, entityName: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      user: currentUserRole === 'admin' ? 'Security Admin' : currentUserRole === 'executive' ? 'Executive Director' : 'Senior SOC Analyst',
      userRole: currentUserRole,
      action,
      targetEntityId: entityId,
      targetEntityName: entityName,
      details,
      ipAddress: '192.168.1.104',
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  const updateThreatStatus = (threatId: string, newStatus: LifecycleStatus, reason?: string) => {
    setThreats(prev => prev.map(t => {
      if (t.id !== threatId) return t;

      const timelineItem = {
        id: `tl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: currentUserRole.toUpperCase(),
        role: currentUserRole,
        action: `Status Changed to ${newStatus.toUpperCase()}`,
        details: reason || `Updated by analyst via Threat Operations Console.`,
        type: newStatus === 'resolved' ? ('resolution' as const) : ('triage' as const),
      };

      return {
        ...t,
        status: newStatus,
        timeline: [timelineItem, ...t.timeline],
        resolutionNotes: newStatus === 'resolved' ? reason || t.resolutionNotes : t.resolutionNotes,
      };
    }));

    const threat = threats.find(t => t.id === threatId);
    if (threat) {
      logAudit(
        `Lifecycle Status Updated: ${newStatus}`,
        threat.id,
        threat.name,
        reason ? `Reason: ${reason}` : `Status transition to ${newStatus}`
      );
    }
  };

  const assignThreat = (threatId: string, assignee: string) => {
    setThreats(prev => prev.map(t => {
      if (t.id !== threatId) return t;
      return {
        ...t,
        assignee,
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: currentUserRole.toUpperCase(),
            role: currentUserRole,
            action: 'Case Reassigned',
            details: `Assigned to ${assignee}`,
            type: 'triage',
          },
          ...t.timeline,
        ],
      };
    }));
    logAudit('Case Reassigned', threatId, assignee, `Assigned to ${assignee}`);
  };

  const addThreatNote = (threatId: string, note: string) => {
    setThreats(prev => prev.map(t => {
      if (t.id !== threatId) return t;
      return {
        ...t,
        notes: [note, ...t.notes],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: currentUserRole.toUpperCase(),
            role: currentUserRole,
            action: 'Analyst Note Appended',
            details: note,
            type: 'comment',
          },
          ...t.timeline,
        ],
      };
    }));
    logAudit('Note Added', threatId, 'Internal Note', note);
  };

  const requestTakedown = (threatId: string, provider: string, notes?: string) => {
    const ticketRef = `ABUSE-TKD-${Math.floor(100000 + Math.random() * 900000)}`;
    setThreats(prev => prev.map(t => {
      if (t.id !== threatId) return t;
      return {
        ...t,
        status: 'action_requested',
        takedownStatus: {
          platformReported: true,
          providerContacted: provider,
          referenceTicket: ticketRef,
          requestedAt: new Date().toISOString(),
          estimatedResolutionHours: 24,
          approvedBy: currentUserRole.toUpperCase(),
        },
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: currentUserRole.toUpperCase(),
            role: currentUserRole,
            action: 'Takedown Submitted',
            details: `Dispatched abuse report to ${provider}. Reference: ${ticketRef}. ${notes || ''}`,
            type: 'takedown',
          },
          ...t.timeline,
        ],
      };
    }));

    logAudit('Takedown Dispatched', threatId, provider, `Dispatched official abuse notice. Ticket #${ticketRef}`);
  };

  const markFalsePositive = (threatId: string, reason: string) => {
    setThreats(prev => prev.map(t => {
      if (t.id !== threatId) return t;
      return {
        ...t,
        status: 'false_positive',
        falsePositiveReason: reason,
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: currentUserRole.toUpperCase(),
            role: currentUserRole,
            action: 'Dismissed as False Positive',
            details: `Mandatory Reason: ${reason}`,
            type: 'resolution',
          },
          ...t.timeline,
        ],
      };
    }));

    logAudit('Marked False Positive', threatId, 'Dismissed Finding', `Reason: ${reason}`);
  };

  const scanNewTarget = (input: Omit<ScanInput, 'brand'>, groqResult?: any): ThreatEntity => {
    const evaluation = evaluateThreat({
      ...input,
      brand: selectedBrand,
    });

    const riskScore = typeof groqResult?.riskScore === 'number' ? groqResult.riskScore : evaluation.riskScore;
    const severity = (groqResult?.severity as Severity) || evaluation.severity;
    const confidenceScore = typeof groqResult?.confidenceScore === 'number' ? groqResult.confidenceScore : evaluation.confidenceScore;
    const explainabilitySummary = groqResult?.explainabilitySummary || evaluation.explainabilitySummary;
    const publisherOrDeveloper = groqResult?.publisherOrDeveloper || evaluation.publisherOrDeveloper;
    const scoreBreakdown = groqResult?.scoreBreakdown || evaluation.scoreBreakdown;
    const safetyVerdict = groqResult?.safetyVerdict || evaluation.safetyVerdict;

    const evidenceChain = {
      typosquattingLeetspeak: groqResult?.typosquatting || evaluation.evidenceChain.typosquattingLeetspeak,
      deceptiveAffixes: groqResult?.deceptiveAffixes || evaluation.evidenceChain.deceptiveAffixes,
      visualLogoSimilarity: groqResult?.visualLogoSimilarity || evaluation.evidenceChain.visualLogoSimilarity,
      phishingOrPermissionsAudit: groqResult?.phishingOrPermissionsAudit || evaluation.evidenceChain.phishingOrPermissionsAudit,
    };

    const aiAnalysis = groqResult
      ? {
          summary: groqResult.explainabilitySummary || evaluation.aiAnalysis.summary,
          attackMethod: groqResult.attackMethod || evaluation.aiAnalysis.attackMethod,
          targetAudienceImpact: groqResult.targetAudienceImpact || evaluation.aiAnalysis.targetAudienceImpact,
          recommendedAction: groqResult.recommendedAction || evaluation.aiAnalysis.recommendedAction,
          confidenceLevel: 'Very High' as const,
          missingInformation: undefined,
        }
      : evaluation.aiAnalysis;

    const newThreat: ThreatEntity = {
      id: `threat-live-${Date.now()}`,
      brandId: selectedBrand.id,
      brandName: selectedBrand.name,
      name: input.displayName || input.targetIdentifier,
      targetIdentifier: input.targetIdentifier,
      category: input.category,
      platform: input.platform,
      status: 'detected',
      severity,
      riskScore,
      confidenceScore,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      detectedAt: new Date().toISOString(),
      dataSource: 'live',
      publisherOrDeveloper,
      scoreBreakdown,
      explainabilitySummary,
      evidenceChain,
      evidence: evaluation.evidence,
      linkedIocs: evaluation.linkedIocs,
      safetyVerdict,
      aiAnalysis,
      relatedEntities: [],
      assignee: 'Unassigned',
      priority: severity === 'critical' ? 'p1' : severity === 'high' ? 'p2' : 'p3',
      tags: ['live-scanned', input.category, input.platform, groqResult ? 'groq-ai' : 'heuristics'],
      notes: [`Ingested through ScamSentry On-Demand Scanner at ${new Date().toLocaleTimeString()}.`],
      timeline: [
        {
          id: `tl-live-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: groqResult ? 'Groq LLaMA 3.3 Engine' : 'ScamSentry Live Scanner',
          role: 'system',
          action: 'Scan Completed',
          details: `Processed via ${groqResult ? 'Groq AI Cloud' : 'hybrid detection engine'} with Risk Score ${riskScore}/100.`,
          type: 'detection',
        },
      ],
    };

    setThreats(prev => [newThreat, ...prev]);
    setSelectedThreatId(newThreat.id);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New ${severity.toUpperCase()} Risk Discovered`,
      description: `Target "${newThreat.name}" scored ${riskScore}/100 risk.`,
      timestamp: 'Just now',
      severity,
      threatId: newThreat.id,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    logAudit('Live Scan Performed', newThreat.id, newThreat.name, `Evaluated with score ${riskScore}/100`);

    return newThreat;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <ThreatContext.Provider
      value={{
        brands,
        selectedBrandId,
        selectedBrand,
        setSelectedBrandId,
        addBrand,
        updateBrand,
        setCustomBrandName,
        resetToEmptyState,
        loadSampleTelemetryForCurrentBrand,

        threats,
        filteredThreats,
        selectedThreatId,
        selectedThreat,
        setSelectedThreatId,
        updateThreatStatus,
        assignThreat,
        addThreatNote,
        requestTakedown,
        markFalsePositive,
        scanNewTarget,

        campaigns,
        connectors,
        auditLogs,

        currentUserRole,
        setCurrentUserRole,

        activeTab,
        setActiveTab,
        isScannerOpen,
        setIsScannerOpen,
        isCopilotOpen,
        setIsCopilotOpen,

        searchQuery,
        setSearchQuery,
        severityFilter,
        setSeverityFilter,
        platformFilter,
        setPlatformFilter,
        statusFilter,
        setStatusFilter,
        categoryFilter,
        setCategoryFilter,

        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </ThreatContext.Provider>
  );
}

export function useThreat() {
  const context = useContext(ThreatContext);
  if (!context) {
    throw new Error('useThreat must be used within a ThreatProvider');
  }
  return context;
}
