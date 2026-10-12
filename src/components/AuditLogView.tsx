'use client';

import React from 'react';
import { useThreat } from '@/context/ThreatContext';
import {
  FileClock,
  ShieldCheck,
  UserCheck,
  Lock,
  Download,
  Search,
} from 'lucide-react';

export default function AuditLogView() {
  const { auditLogs } = useThreat();

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `DRPP-Security-Audit-Trail-${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileClock className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Security Compliance & Audit Trail Ledger
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable audit logging tracking analyst decisions, lifecycle changes, takedown submissions, and RBAC actions.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f293d] bg-[#0d1424] px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1f293d] bg-[#090d16] text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">User & Security Role</th>
                <th className="py-2.5 px-3">Action Recorded</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Action Details & Rationale</th>
                <th className="py-2.5 px-3">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b253b] text-xs">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-mono">
                    No security audit events recorded. Real-time analyst and scanner actions will appear here.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#141c2e] transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{log.user}</div>
                      <div className="text-[10px] font-mono text-amber-400 uppercase">
                        {log.userRole.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#18233a] text-cyan-300 border border-[#23314f]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-300">
                      {log.targetEntityName}
                    </td>
                    <td className="py-3 px-3 text-gray-300 max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
