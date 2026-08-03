import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText } from 'lucide-react';
import type { AuditLogEntry } from '@/types';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
  onOpenSnapshotDiff: (entry: AuditLogEntry) => void;
}

export default function AuditLogsView({
  logs,
  onOpenSnapshotDiff,
}: AuditLogsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Text variant="h3" weight="bold" className="text-text-main">
          Audit Trail Logs
        </Text>
        <Text variant="body-sm" color="muted">
          Immutable audit record of all model mutations, booking creations, and discrepancy approvals.
        </Text>
      </div>

      {/* Audit Table */}
      <Card className="p-4 overflow-x-auto">
        <Table>
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
              <th className="py-3 px-2">Log ID</th>
              <th className="py-3 px-2">Actor Identifier</th>
              <th className="py-3 px-2">Action</th>
              <th className="py-3 px-2">Target Model / ID</th>
              <th className="py-3 px-2">Timestamp</th>
              <th className="py-3 px-2 text-right">Inspect Snapshots</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {logs.map((entry) => (
              <tr key={entry.id} className="hover:bg-surface-raised transition-colors">
                <td className="py-3 px-2 font-bold text-primary">#{entry.id}</td>
                <td className="py-3 px-2 text-xs font-semibold text-text-main">
                  <div className="flex items-center gap-1.5">
                    <Shield size={14} className="text-primary" /> {entry.actorIdentifier}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <Badge
                    variant={
                      entry.action === 'create'
                        ? 'success'
                        : entry.action === 'approve'
                          ? 'default'
                          : entry.action === 'reject' || entry.action === 'delete'
                            ? 'danger'
                            : 'warning'
                    }
                  >
                    {entry.action.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-xs font-medium">
                  {entry.targetModel} <span className="text-text-muted">(ID: {entry.targetId})</span>
                </td>
                <td className="py-3 px-2 text-xs text-text-muted">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-2 text-right">
                  <Button variant="outline" size="sm" onClick={() => onOpenSnapshotDiff(entry)}>
                    <FileText size={14} className="mr-1" /> View JSON Diff
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
