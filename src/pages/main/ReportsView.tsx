import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Flag, CheckCircle, RefreshCw } from 'lucide-react';
import type { ClassRepReport, UnreportedSessionFlag } from '@/types';

interface ReportsViewProps {
  reports: ClassRepReport[];
  flags: UnreportedSessionFlag[];
  onOpenDisputeResponse: (rep: ClassRepReport) => void;
  onAcknowledgeFlagTrigger: (flag: UnreportedSessionFlag) => void;
  onTriggerSweep: () => void;
}

export default function ReportsView({
  reports,
  flags,
  onOpenDisputeResponse,
  onAcknowledgeFlagTrigger,
  onTriggerSweep,
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'flags'>('reports');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Class Rep Reports & Unreported Flags
          </Text>
          <Text variant="body-sm" color="muted">
            Monitor class rep lecture-hold submissions and automated unreported session expiration flags.
          </Text>
        </div>
        <Button variant="outline" size="sm" onClick={onTriggerSweep}>
          <RefreshCw size={16} className="mr-1" /> Trigger Flag Sweep
        </Button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'reports'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <ClipboardList size={16} /> Submitted Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'flags'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <Flag size={16} /> Unreported Flags ({flags.filter((f) => !f.isAcknowledged).length} Unresolved)
        </button>
      </div>

      {/* Content Tables */}
      <Card className="p-4 overflow-x-auto">
        {activeTab === 'reports' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Course / Reporter</th>
                <th className="py-3 px-2">Lecture Hold Status</th>
                <th className="py-3 px-2">Rep Reason / Details</th>
                <th className="py-3 px-2">Lecturer Dispute Response</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-primary">{rep.courseCode}</div>
                    <div className="text-xs text-text-muted">{rep.reporterName}</div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={rep.held ? 'success' : 'danger'}>
                      {rep.held ? 'HELD' : 'NOT HELD'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-xs text-text-main">
                    {rep.reasonText || 'Reported on time'}
                  </td>
                  <td className="py-3 px-2 text-xs">
                    {rep.lecturerResponse ? (
                      <span className="font-semibold text-emerald-600">{rep.lecturerResponse}</span>
                    ) : (
                      <span className="text-text-muted italic">No dispute filed</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDisputeResponse(rep)}
                    >
                      Respond to Report
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {activeTab === 'flags' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Course / Timetable Entry</th>
                <th className="py-3 px-2">Session Date</th>
                <th className="py-3 px-2">Flagged At</th>
                <th className="py-3 px-2">Acknowledgment Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {flags.map((flag) => (
                <tr key={flag.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-red-600">{flag.courseCode}</div>
                    <div className="text-xs text-text-main">{flag.timetableEntryTitle}</div>
                  </td>
                  <td className="py-3 px-2 text-xs font-semibold">{flag.sessionDate}</td>
                  <td className="py-3 px-2 text-xs text-text-muted">
                    {new Date(flag.flaggedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={flag.isAcknowledged ? 'success' : 'danger'}>
                      {flag.isAcknowledged ? 'ACKNOWLEDGED' : 'UNRESOLVED'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {!flag.isAcknowledged ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAcknowledgeFlagTrigger(flag)}
                      >
                        Acknowledge Flag
                      </Button>
                    ) : (
                      <span className="text-xs text-text-muted flex items-center justify-end gap-1">
                        <CheckCircle size={14} className="text-emerald-500" /> By {flag.acknowledgedByName}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
