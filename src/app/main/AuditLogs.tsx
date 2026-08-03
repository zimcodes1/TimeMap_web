import { useState } from 'react';
import AuditLogsView from '@/pages/main/AuditLogsView';
import AuditSnapshotDiffModal from '@/components/modals/AuditSnapshotDiffModal';
import { mockAuditLogs } from '@/constants/mockData';
import type { AuditLogEntry } from '@/types';

export default function AuditLogsContainer() {
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  return (
    <>
      <AuditLogsView
        logs={mockAuditLogs}
        onOpenSnapshotDiff={(entry) => setSelectedLog(entry)}
      />

      <AuditSnapshotDiffModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        entry={selectedLog}
      />
    </>
  );
}
