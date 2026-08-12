import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AuditLogsView from "@/pages/main/AuditLogsView";
import AuditSnapshotDiffModal from "@/components/modals/AuditSnapshotDiffModal";
import { getAuditLogsList } from "@/api/main/discrepanciesAPI";
import type { AuditLogEntry } from "@/types";

export default function AuditLogsContainer() {
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const {
    data: logs = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["discrepancies", "audit-logs"],
    queryFn: getAuditLogsList,
  });

  return (
    <>
      <AuditLogsView
        logs={logs}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onRefresh={refetch}
        onOpenSnapshotDiff={(entry) => setSelectedLog(entry)}
      />

      <AuditSnapshotDiffModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        entry={selectedLog}
      />
    </>
  );
}
