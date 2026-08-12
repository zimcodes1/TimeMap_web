import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TabSwitcher } from "@/components/ui/tabs";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { ClipboardList, Flag, CheckCircle, RefreshCw, Eye, MessageSquare, AlertCircle } from "lucide-react";
import type { ClassRepReport, UnreportedSessionFlag } from "@/types";

interface ReportsViewProps {
  reports: ClassRepReport[];
  flags: UnreportedSessionFlag[];
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onOpenReportDetail: (rep: ClassRepReport) => void;
  onOpenDisputeResponse: (rep: ClassRepReport) => void;
  onAcknowledgeFlagTrigger: (flag: UnreportedSessionFlag) => void;
  onTriggerSweep: () => void;
}

export default function ReportsView({
  reports,
  flags,
  isLoading = false,
  isRefetching = false,
  onRefresh,
  onOpenReportDetail,
  onOpenDisputeResponse,
  onAcknowledgeFlagTrigger,
  onTriggerSweep,
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<"reports" | "flags">("reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [heldFilter, setHeldFilter] = useState("");
  const [ackFilter, setAckFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reasonText && r.reasonText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHeld = !heldFilter || (heldFilter === "held" ? r.held : !r.held);

    return matchesSearch && matchesHeld;
  });

  // Filter flags
  const filteredFlags = flags.filter((f) => {
    const matchesSearch =
      f.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.timetableEntryTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAck = !ackFilter || (ackFilter === "ack" ? f.isAcknowledged : !f.isAcknowledged);

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
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefetching}
              title="Refresh Reports & Flags"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw size={13} className={isRefetching ? "animate-spin text-primary" : ""} />
              <span>{isRefetching ? "Refreshing..." : "Refresh"}</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onTriggerSweep} className="h-8 gap-1.5 text-xs cursor-pointer">
            <RefreshCw size={13} className="mr-1" /> Trigger Flag Sweep
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={[
          { id: "reports", label: "Submitted Reports", icon: ClipboardList, count: reports.length },
          {
            id: "flags",
            label: "Unreported Flags Queue",
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
        searchPlaceholder={activeTab === "reports" ? "Search by course or reporter..." : "Search flags by course..."}
        totalCount={activeTab === "reports" ? reports.length : flags.length}
        filteredCount={activeTab === "reports" ? filteredReports.length : filteredFlags.length}
        filters={
          activeTab === "reports"
            ? [
                {
                  id: "held",
                  label: "Hold Status",
                  value: heldFilter,
                  onChange: setHeldFilter,
                  options: [
                    { label: "Held", value: "held" },
                    { label: "Not Held", value: "not_held" },
                  ],
                },
              ]
            : [
                {
                  id: "ack",
                  label: "Acknowledgment",
                  value: ackFilter,
                  onChange: setAckFilter,
                  options: [
                    { label: "Unresolved", value: "unack" },
                    { label: "Acknowledged", value: "ack" },
                  ],
                },
              ]
        }
        onResetFilters={() => {
          setSearchQuery("");
          setHeldFilter("");
          setAckFilter("");
        }}
      />

      {/* Tables Content */}
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
      ) : activeTab === "reports" ? (
        filteredReports.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <AlertCircle size={36} className="mx-auto text-text-muted opacity-40" />
            <Text variant="h6" weight="bold" className="text-center">
              No Submitted Class Rep Reports Found
            </Text>
            <Text variant="body-sm" color="muted" className="text-center">
              {searchQuery || heldFilter
                ? "No student class rep reports match your active search or filter criteria."
                : "No class rep session hold reports submitted yet."}
            </Text>
          </Card>
        ) : (
          <DataTable
            columns={[
              {
                header: "Course / Reporter",
                accessor: (rep: ClassRepReport) => (
                  <div>
                    <div className="font-bold text-primary">{rep.courseCode}</div>
                    <div className="text-xs text-text-muted">{rep.reporterName}</div>
                  </div>
                ),
              },
              {
                header: "Lecture Hold Status",
                accessor: (rep: ClassRepReport) => (
                  <Badge variant={rep.held ? "success" : "danger"}>
                    {rep.held ? "HELD" : "NOT HELD"}
                  </Badge>
                ),
              },
              {
                header: "Rep Reason / Details",
                accessor: (rep: ClassRepReport) => (
                  <span className="text-xs text-text-main font-medium">
                    {rep.reasonText || "Reported on time"}
                  </span>
                ),
              },
              {
                header: "Lecturer Dispute Response",
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
                header: "Actions",
                align: "right",
                accessor: (rep: ClassRepReport) => (
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenReportDetail(rep)}
                      title="View report thread details"
                      className="h-8 px-2 text-xs cursor-pointer"
                    >
                      <Eye size={14} className="mr-1" /> View Thread
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDisputeResponse(rep)}
                      title="Submit lecturer dispute response"
                      className="h-8 px-2 text-xs cursor-pointer"
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
        )
      ) : filteredFlags.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <Flag size={36} className="mx-auto text-text-muted opacity-40" />
          <Text variant="h6" weight="bold" className="text-center">
            No Unreported Session Flags
          </Text>
          <Text variant="body-sm" color="muted" className="text-center">
            {searchQuery || ackFilter
              ? "No session flags match your active search or filter criteria."
              : "Great job! All expired sessions have been reported or resolved."}
          </Text>
        </Card>
      ) : (
        <DataTable
          columns={[
            {
              header: "Course / Timetable Entry",
              accessor: (flag: UnreportedSessionFlag) => (
                <div>
                  <div className="font-bold text-red-600">{flag.courseCode}</div>
                  <div className="text-xs text-text-main font-medium">{flag.timetableEntryTitle}</div>
                </div>
              ),
            },
            {
              header: "Session Date",
              accessor: (flag: UnreportedSessionFlag) => (
                <span className="text-xs font-bold text-text-main">{flag.sessionDate}</span>
              ),
            },
            {
              header: "Flagged At",
              accessor: (flag: UnreportedSessionFlag) => (
                <span className="text-xs text-text-muted">
                  {new Date(flag.flaggedAt).toLocaleString()}
                </span>
              ),
            },
            {
              header: "Acknowledgment Status",
              accessor: (flag: UnreportedSessionFlag) => (
                <Badge variant={flag.isAcknowledged ? "success" : "danger"}>
                  {flag.isAcknowledged ? "ACKNOWLEDGED" : "UNRESOLVED"}
                </Badge>
              ),
            },
            {
              header: "Actions",
              align: "right",
              accessor: (flag: UnreportedSessionFlag) =>
                !flag.isAcknowledged ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAcknowledgeFlagTrigger(flag)}
                    title={`Acknowledge flag for ${flag.courseCode}`}
                    className="h-8 px-2.5 text-xs cursor-pointer"
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
