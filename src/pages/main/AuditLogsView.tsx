import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { Shield, FileText, RefreshCw, History } from "lucide-react";
import type { AuditLogEntry } from "@/types";

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onOpenSnapshotDiff: (entry: AuditLogEntry) => void;
}

export default function AuditLogsView({
  logs,
  isLoading = false,
  isRefetching = false,
  onRefresh,
  onOpenSnapshotDiff,
}: AuditLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Text variant="h3" weight="bold" className="text-text-main">
              System Audit Trail Logs
            </Text>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefetching}
                title="Refresh Audit Logs"
                className="h-8 w-8 p-0 rounded-full cursor-pointer text-text-muted hover:text-primary"
              >
                <RefreshCw size={15} className={isRefetching ? "animate-spin text-primary" : ""} />
              </Button>
            )}
          </div>
          <Text variant="body-sm" color="muted">
            Immutable audit record of all model mutations, booking creations, and discrepancy approvals.
          </Text>
        </div>
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
            id: "action",
            label: "Action Type",
            value: actionFilter,
            onChange: setActionFilter,
            options: [
              { label: "Create", value: "create" },
              { label: "Update", value: "update" },
              { label: "Delete", value: "delete" },
              { label: "Approve", value: "approve" },
              { label: "Reject", value: "reject" },
            ],
          },
          {
            id: "targetModel",
            label: "Target Model",
            value: modelFilter,
            onChange: setModelFilter,
            options: [
              { label: "Venue", value: "Venue" },
              { label: "Course", value: "Course" },
              { label: "TimetableEntry", value: "TimetableEntry" },
              { label: "DiscrepancyRequest", value: "DiscrepancyRequest" },
              { label: "School", value: "School" },
            ],
          },
        ]}
        onResetFilters={() => {
          setSearchQuery("");
          setActionFilter("");
          setModelFilter("");
          setStartDate("");
          setEndDate("");
        }}
      />

      {/* Audit Logs Content */}
      {isLoading ? (
        <Card className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
            </div>
          ))}
        </Card>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <History size={36} className="mx-auto text-text-muted opacity-40" />
          <Text variant="h6" weight="bold" className="text-center">
            No Audit Logs Found
          </Text>
          <Text variant="body-sm" color="muted" className="text-center">
            {searchQuery || actionFilter || modelFilter
              ? "No system audit log entries match your active filters."
              : "No system audit logs recorded yet."}
          </Text>
        </Card>
      ) : (
        <DataTable
          columns={[
            {
              header: "Log ID",
              accessor: (l: AuditLogEntry) => <span className="font-bold text-primary">#{l.id}</span>,
            },
            {
              header: "Actor Identifier",
              accessor: (l: AuditLogEntry) => (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
                  <Shield size={14} className="text-primary" /> {l.actorIdentifier}
                </div>
              ),
            },
            {
              header: "Action",
              accessor: (l: AuditLogEntry) => (
                <Badge
                  variant={
                    l.action === "create"
                      ? "success"
                      : l.action === "approve"
                        ? "default"
                        : l.action === "reject" || l.action === "delete"
                          ? "danger"
                          : "warning"
                  }
                >
                  {l.action.toUpperCase()}
                </Badge>
              ),
            },
            {
              header: "Target Model / ID",
              accessor: (l: AuditLogEntry) => (
                <span className="text-xs font-medium">
                  {l.targetModel} <span className="text-text-muted">(ID: {l.targetId})</span>
                </span>
              ),
            },
            {
              header: "Timestamp",
              accessor: (l: AuditLogEntry) => (
                <span className="text-xs text-text-muted">
                  {new Date(l.timestamp).toLocaleString()}
                </span>
              ),
            },
            {
              header: "Snapshots",
              align: "right",
              accessor: (l: AuditLogEntry) => (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenSnapshotDiff(l)}
                  title={`View JSON snapshot diff for audit log #${l.id}`}
                  className="h-8 px-2 text-xs cursor-pointer"
                >
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
      )}
    </div>
  );
}
