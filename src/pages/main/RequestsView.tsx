import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TabSwitcher } from "@/components/ui/tabs";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Clock, History, Send, Eye, RotateCcw, RefreshCw, AlertCircle } from "lucide-react";
import type { DiscrepancyRequest } from "@/types";

interface RequestsViewProps {
  requests: DiscrepancyRequest[];
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onOpenSubmitDiscrepancy: () => void;
  onOpenDetailSlideOver: (req: DiscrepancyRequest) => void;
  onWithdrawTrigger: (req: DiscrepancyRequest) => void;
}

export default function RequestsView({
  requests,
  isLoading = false,
  isRefetching = false,
  onRefresh,
  onOpenSubmitDiscrepancy,
  onOpenDetailSlideOver,
  onWithdrawTrigger,
}: RequestsViewProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "my_requests" | "history">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sub-tab filtering
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const myRequests = requests; // All requests visible in user scope
  const historyRequests = requests.filter((r) => r.status !== "pending");

  const getActiveTabDataset = () => {
    if (activeTab === "pending") return pendingRequests;
    if (activeTab === "my_requests") return myRequests;
    return historyRequests;
  };

  const rawDataset = getActiveTabDataset();

  // Toolbar filtering
  const filteredRequests = rawDataset.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !typeFilter || r.requestType === typeFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Text variant="h3" weight="bold" className="text-text-main">
              Discrepancy Requests Queue
            </Text>
          </div>
          <Text variant="body-sm" color="muted">
            Manage booking shifts, postponements, cancellations, and cross-level administrative approvals.
          </Text>
        </div>
        <span className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefetching}
            className="h-8 gap-1.5 text-xs cursor-pointer"
          >
            <RefreshCw size={13} className={isRefetching ? "animate-spin text-primary" : ""} />
            <span>{isRefetching ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenSubmitDiscrepancy} className="cursor-pointer">
            <Plus size={16} className="mr-1" /> Submit Discrepancy Request
          </Button>
        </span>
      </div>

      {/* 3-way Sub-Tabs */}
      <TabSwitcher
        tabs={[
          { id: "pending", label: "Pending Approvals (Routed to Me)", icon: Clock, count: pendingRequests.length },
          { id: "my_requests", label: "All Scope Requests", icon: Send, count: myRequests.length },
          { id: "history", label: "Historical Log", icon: History, count: historyRequests.length },
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
        searchPlaceholder="Search by request ID, course, or requester..."
        totalCount={rawDataset.length}
        filteredCount={filteredRequests.length}
        filters={[
          {
            id: "requestType",
            label: "Request Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: "Shift Venue", value: "shift_venue" },
              { label: "Shift Time", value: "shift_time" },
              { label: "Postpone", value: "postpone" },
              { label: "Cancel", value: "cancel" },
              { label: "Create Booking", value: "create_booking" },
            ],
          },
          ...(activeTab === "history"
            ? [
              {
                id: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                  { label: "Applied", value: "applied" },
                  { label: "Withdrawn", value: "withdrawn" },
                ],
              },
            ]
            : []),
        ]}
        onResetFilters={() => {
          setSearchQuery("");
          setTypeFilter("");
          setStatusFilter("");
        }}
      />

      {/* Requests Content */}
      {isLoading ? (
        <Card className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/6" />
            </div>
          ))}
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <AlertCircle size={36} className="mx-auto text-text-muted opacity-40" />
          <Text variant="h6" weight="bold" className='text-center'>
            No Discrepancy Requests Found
          </Text>
          <Text variant="body-sm" color="muted" className="text-center">
            {searchQuery || typeFilter || statusFilter
              ? "No discrepancy requests match your active search or filter criteria."
              : activeTab === "pending"
                ? "Great job! There are currently no pending discrepancy approval requests in your queue."
                : "No discrepancy requests have been submitted yet."}
          </Text>
          <Button variant="primary" size="sm" onClick={onOpenSubmitDiscrepancy} className="mt-2 cursor-pointer">
            <Plus size={14} className="mr-1" /> Submit First Request
          </Button>
        </Card>
      ) : (
        <DataTable
          columns={[
            {
              header: "Req ID / Course",
              accessor: (req: DiscrepancyRequest) => (
                <div>
                  <div className="font-bold text-primary">#{req.id}</div>
                  <div className="text-xs text-text-main font-medium">
                    {req.courseCode} — {req.courseTitle}
                  </div>
                </div>
              ),
            },
            {
              header: "Request Type",
              accessor: (req: DiscrepancyRequest) => (
                <Badge variant="default" className="capitalize text-xs">
                  {req.requestType.replace("_", " ")}
                </Badge>
              ),
            },
            {
              header: "Requested By",
              accessor: (req: DiscrepancyRequest) => (
                <div className="text-xs">
                  <div className="font-bold text-text-main">{req.requestedBy}</div>
                  <div className="text-text-muted">{req.requestedByRole}</div>
                </div>
              ),
            },
            {
              header: "Proposed Schedule",
              accessor: (req: DiscrepancyRequest) => (
                <div className="text-xs">
                  <div className="font-medium text-text-main">
                    Venue: {req.proposedVenueName || "N/A"}
                  </div>
                  <div className="text-text-muted">
                    Time: {req.proposedStartTime || "N/A"} - {req.proposedEndTime || "N/A"}
                  </div>
                </div>
              ),
            },
            {
              header: "Status",
              accessor: (req: DiscrepancyRequest) => (
                <Badge
                  variant={
                    req.status === "approved" || req.status === "applied"
                      ? "success"
                      : req.status === "rejected"
                        ? "danger"
                        : req.status === "withdrawn"
                          ? "outline"
                          : "warning"
                  }
                >
                  {req.status.toUpperCase()}
                </Badge>
              ),
            },
            {
              header: "Actions",
              align: "right",
              accessor: (req: DiscrepancyRequest) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenDetailSlideOver(req)}
                    title={`Inspect discrepancy details for #${req.id}`}
                    className="h-8 px-2.5 text-xs cursor-pointer"
                  >
                    <Eye size={14} className="mr-1" /> Inspect
                  </Button>
                  {req.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onWithdrawTrigger(req)}
                      title={`Withdraw discrepancy request #${req.id}`}
                      className="h-8 px-2 text-xs text-danger border-danger-surface hover:bg-danger-surface cursor-pointer"
                    >
                      <RotateCcw size={12} className="mr-1" /> Withdraw
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredRequests}
          keyExtractor={(r) => r.id}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
