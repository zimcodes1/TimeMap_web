import { useState } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabSwitcher } from '@/components/ui/tabs';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { DataTable } from '@/components/ui/data-table';
import { ClipboardList, Flag, CheckCircle, RefreshCw, Eye, MessageSquare } from 'lucide-react';
import type { ClassRepReport, UnreportedSessionFlag } from '@/types';

interface ReportsViewProps {
  reports: ClassRepReport[];
  flags: UnreportedSessionFlag[];
  onOpenReportDetail: (rep: ClassRepReport) => void;
  onOpenDisputeResponse: (rep: ClassRepReport) => void;
  onAcknowledgeFlagTrigger: (flag: UnreportedSessionFlag) => void;
  onTriggerSweep: () => void;
}

export default function ReportsView({
  reports,
  flags,
  onOpenReportDetail,
  onOpenDisputeResponse,
  onAcknowledgeFlagTrigger,
  onTriggerSweep,
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'flags'>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [heldFilter, setHeldFilter] = useState('');
  const [ackFilter, setAckFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reasonText && r.reasonText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHeld = !heldFilter || (heldFilter === 'held' ? r.held : !r.held);

    return matchesSearch && matchesHeld;
  });

  // Filter flags
  const filteredFlags = flags.filter((f) => {
    const matchesSearch =
      f.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.timetableEntryTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAck = !ackFilter || (ackFilter === 'ack' ? f.isAcknowledged : !f.isAcknowledged);

    return matchesSearch && matchesAck;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Class Rep Reports & Session Flags
          </Text>
          <Text variant="body-sm" color="muted">
            Administrative oversight of student lecture-hold submissions and automated unreported session flags.
          </Text>
        </div>
        <Button variant="outline" size="sm" onClick={onTriggerSweep}>
          <RefreshCw size={16} className="mr-1" /> Trigger Flag Sweep
        </Button>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={[
          { id: 'reports', label: 'Submitted Reports', icon: ClipboardList, count: reports.length },
          {
            id: 'flags',
            label: 'Unreported Flags Queue',
            icon: Flag,
            count: flags.filter((f) => !f.isAcknowledged).length,
          },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as typeof activeTab);
          setCurrentPage(1);
        }}
      />

      {/* Table Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={activeTab === 'reports' ? 'Search by course or reporter...' : 'Search flags by course...'}
        totalCount={activeTab === 'reports' ? reports.length : flags.length}
        filteredCount={activeTab === 'reports' ? filteredReports.length : filteredFlags.length}
        filters={
          activeTab === 'reports'
            ? [
                {
                  id: 'held',
                  label: 'Hold Status',
                  value: heldFilter,
                  onChange: setHeldFilter,
                  options: [
                    { label: 'Held', value: 'held' },
                    { label: 'Not Held', value: 'not_held' },
                  ],
                },
              ]
            : [
                {
                  id: 'ack',
                  label: 'Acknowledgment',
                  value: ackFilter,
                  onChange: setAckFilter,
                  options: [
                    { label: 'Unresolved', value: 'unack' },
                    { label: 'Acknowledged', value: 'ack' },
                  ],
                },
              ]
        }
        onResetFilters={() => {
          setSearchQuery('');
          setHeldFilter('');
          setAckFilter('');
        }}
      />

      {/* Tables */}
      {activeTab === 'reports' ? (
        <DataTable
          columns={[
            {
              header: 'Course / Reporter',
              accessor: (rep: ClassRepReport) => (
                <div>
                  <div className="font-bold text-primary">{rep.courseCode}</div>
                  <div className="text-xs text-text-muted">{rep.reporterName}</div>
                </div>
              ),
            },
            {
              header: 'Lecture Hold Status',
              accessor: (rep: ClassRepReport) => (
                <Badge variant={rep.held ? 'success' : 'danger'}>
                  {rep.held ? 'HELD' : 'NOT HELD'}
                </Badge>
              ),
            },
            {
              header: 'Rep Reason / Details',
              accessor: (rep: ClassRepReport) => (
                <span className="text-xs text-text-main font-medium">
                  {rep.reasonText || 'Reported on time'}
                </span>
              ),
            },
            {
              header: 'Lecturer Dispute Response',
              accessor: (rep: ClassRepReport) =>
                rep.lecturerResponse ? (
                  <span className="text-xs font-semibold text-emerald-600">
                    {rep.lecturerResponse}
                  </span>
                ) : (
                  <span className="text-xs text-text-muted italic">No dispute filed</span>
                ),
            },
            {
              header: 'Actions',
              align: 'right',
              accessor: (rep: ClassRepReport) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenReportDetail(rep)}
                    className="h-8 px-2 text-xs"
                  >
                    <Eye size={14} className="mr-1" /> View Thread
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenDisputeResponse(rep)}
                    className="h-8 px-2 text-xs"
                  >
                    <MessageSquare size={14} className="mr-1" /> Respond
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredReports}
          keyExtractor={(r) => r.id}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      ) : (
        <DataTable
          columns={[
            {
              header: 'Course / Timetable Entry',
              accessor: (flag: UnreportedSessionFlag) => (
                <div>
                  <div className="font-bold text-red-600">{flag.courseCode}</div>
                  <div className="text-xs text-text-main font-medium">{flag.timetableEntryTitle}</div>
                </div>
              ),
            },
            {
              header: 'Session Date',
              accessor: (flag: UnreportedSessionFlag) => (
                <span className="text-xs font-bold text-text-main">{flag.sessionDate}</span>
              ),
            },
            {
              header: 'Flagged At',
              accessor: (flag: UnreportedSessionFlag) => (
                <span className="text-xs text-text-muted">
                  {new Date(flag.flaggedAt).toLocaleString()}
                </span>
              ),
            },
            {
              header: 'Acknowledgment Status',
              accessor: (flag: UnreportedSessionFlag) => (
                <Badge variant={flag.isAcknowledged ? 'success' : 'danger'}>
                  {flag.isAcknowledged ? 'ACKNOWLEDGED' : 'UNRESOLVED'}
                </Badge>
              ),
            },
            {
              header: 'Actions',
              align: 'right',
              accessor: (flag: UnreportedSessionFlag) =>
                !flag.isAcknowledged ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAcknowledgeFlagTrigger(flag)}
                    className="h-8 px-2.5 text-xs"
                  >
                    Acknowledge Flag
                  </Button>
                ) : (
                  <span className="text-xs text-text-muted flex items-center justify-end gap-1">
                    <CheckCircle size={14} className="text-emerald-500" /> By {flag.acknowledgedByName}
                  </span>
                ),
            },
          ]}
          data={filteredFlags}
          keyExtractor={(f) => f.id}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
