import { useState } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { DataTable } from '@/components/ui/data-table';
import { Shield, FileText } from 'lucide-react';
import type { AuditLogEntry } from '@/types';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
  onOpenSnapshotDiff: (entry: AuditLogEntry) => void;
}

export default function AuditLogsView({
  logs,
  onOpenSnapshotDiff,
}: EstimatesProps & AuditLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.actorIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.targetModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.targetId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = !actionFilter || l.action === actionFilter;
    const matchesModel = !modelFilter || l.targetModel === modelFilter;

    return matchesSearch && matchesAction && matchesModel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Text variant="h3" weight="bold" className="text-text-main">
          System Audit Trail Logs
        </Text>
        <Text variant="body-sm" color="muted">
          Immutable audit record of all model mutations, booking creations, and discrepancy approvals.
        </Text>
      </div>

      {/* Search & Filter Panel */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search actor ID, model, or target ID..."
        totalCount={logs.length}
        filteredCount={filteredLogs.length}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        filters={[
          {
            id: 'action',
            label: 'Action Type',
            value: actionFilter,
            onChange: setActionFilter,
            options: [
              { label: 'Create', value: 'create' },
              { label: 'Update', value: 'update' },
              { label: 'Delete', value: 'delete' },
              { label: 'Approve', value: 'approve' },
              { label: 'Reject', value: 'reject' },
            ],
          },
          {
            id: 'targetModel',
            label: 'Target Model',
            value: modelFilter,
            onChange: setModelFilter,
            options: [
              { label: 'Venue', value: 'Venue' },
              { label: 'Course', value: 'Course' },
              { label: 'TimetableEntry', value: 'TimetableEntry' },
              { label: 'DiscrepancyRequest', value: 'DiscrepancyRequest' },
              { label: 'School', value: 'School' },
            ],
          },
        ]}
        onResetFilters={() => {
          setSearchQuery('');
          setActionFilter('');
          setModelFilter('');
          setStartDate('');
          setEndDate('');
        }}
      />

      {/* Audit Logs DataTable */}
      <DataTable
        columns={[
          {
            header: 'Log ID',
            accessor: (l: AuditLogEntry) => <span className="font-bold text-primary">#{l.id}</span>,
          },
          {
            header: 'Actor Identifier',
            accessor: (l: AuditLogEntry) => (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
                <Shield size={14} className="text-primary" /> {l.actorIdentifier}
              </div>
            ),
          },
          {
            header: 'Action',
            accessor: (l: AuditLogEntry) => (
              <Badge
                variant={
                  l.action === 'create'
                    ? 'success'
                    : l.action === 'approve'
                      ? 'default'
                      : l.action === 'reject' || l.action === 'delete'
                        ? 'danger'
                        : 'warning'
                }
              >
                {l.action.toUpperCase()}
              </Badge>
            ),
          },
          {
            header: 'Target Model / ID',
            accessor: (l: AuditLogEntry) => (
              <span className="text-xs font-medium">
                {l.targetModel} <span className="text-text-muted">(ID: {l.targetId})</span>
              </span>
            ),
          },
          {
            header: 'Timestamp',
            accessor: (l: AuditLogEntry) => (
              <span className="text-xs text-text-muted">
                {new Date(l.timestamp).toLocaleString()}
              </span>
            ),
          },
          {
            header: 'Snapshots',
            align: 'right',
            accessor: (l: AuditLogEntry) => (
              <Button variant="outline" size="sm" onClick={() => onOpenSnapshotDiff(l)} className="h-8 px-2 text-xs">
                <FileText size={14} className="mr-1" /> View Diff
              </Button>
            ),
          },
        ]}
        data={filteredLogs}
        keyExtractor={(l) => l.id}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
// Helper type definition check
type EstimatesProps = Record<string, unknown>;
