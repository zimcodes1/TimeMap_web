import { useState } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabSwitcher } from '@/components/ui/tabs';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Clock, History, Send, Eye, RotateCcw } from 'lucide-react';
import type { DiscrepancyRequest } from '@/types';

interface RequestsViewProps {
  requests: DiscrepancyRequest[];
  onOpenSubmitDiscrepancy: () => void;
  onOpenDetailSlideOver: (req: DiscrepancyRequest) => void;
  onWithdrawTrigger: (req: DiscrepancyRequest) => void;
}

export default function RequestsView({
  requests,
  onOpenSubmitDiscrepancy,
  onOpenDetailSlideOver,
  onWithdrawTrigger,
}: RequestsViewProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'my_requests' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Sub-tab filtering
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const myRequests = requests.filter((r) => r.requestedBy === 'Dr. Sarah Jenkins' || r.requestedByRole === 'Admin');
  const historyRequests = requests.filter((r) => r.status !== 'pending');

  const getActiveTabDataset = () => {
    if (activeTab === 'pending') return pendingRequests;
    if (activeTab === 'my_requests') return myRequests;
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
          <Text variant="h3" weight="bold" className="text-text-main">
            Discrepancy Requests Queue
          </Text>
          <Text variant="body-sm" color="muted">
            Manage booking shifts, postponements, cancellations, and cross-level administrative approvals.
          </Text>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenSubmitDiscrepancy}>
          <Plus size={16} className="mr-1" /> Submit Discrepancy Request
        </Button>
      </div>

      {/* 3-way Sub-Tabs */}
      <TabSwitcher
        tabs={[
          { id: 'pending', label: 'Pending Approvals (Routed to Me)', icon: Clock, count: pendingRequests.length },
          { id: 'my_requests', label: 'My Requests (Submitted by Me)', icon: Send, count: myRequests.length },
          { id: 'history', label: 'Historical Log', icon: History, count: historyRequests.length },
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
            id: 'requestType',
            label: 'Request Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'Shift Venue', value: 'shift_venue' },
              { label: 'Shift Time', value: 'shift_time' },
              { label: 'Postpone', value: 'postpone' },
              { label: 'Cancel', value: 'cancel' },
              { label: 'Create Booking', value: 'create_booking' },
            ],
          },
          ...(activeTab === 'history'
            ? [
                {
                  id: 'status',
                  label: 'Status',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                    { label: 'Applied', value: 'applied' },
                    { label: 'Withdrawn', value: 'withdrawn' },
                  ],
                },
              ]
            : []),
        ]}
        onResetFilters={() => {
          setSearchQuery('');
          setTypeFilter('');
          setStatusFilter('');
        }}
      />

      {/* Requests DataTable */}
      <DataTable
        columns={[
          {
            header: 'Req ID / Course',
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
            header: 'Request Type',
            accessor: (req: DiscrepancyRequest) => (
              <Badge variant="default" className="capitalize text-xs">
                {req.requestType.replace('_', ' ')}
              </Badge>
            ),
          },
          {
            header: 'Requested By',
            accessor: (req: DiscrepancyRequest) => (
              <div className="text-xs">
                <div className="font-bold text-text-main">{req.requestedBy}</div>
                <div className="text-text-muted">{req.requestedByRole}</div>
              </div>
            ),
          },
          {
            header: 'Proposed Schedule',
            accessor: (req: DiscrepancyRequest) => (
              <div className="text-xs">
                <div className="font-medium text-text-main">
                  Venue: {req.proposedVenueName || 'N/A'}
                </div>
                <div className="text-text-muted">
                  Time: {req.proposedStartTime || 'N/A'} - {req.proposedEndTime || 'N/A'}
                </div>
              </div>
            ),
          },
          {
            header: 'Status',
            accessor: (req: DiscrepancyRequest) => (
              <Badge
                variant={
                  req.status === 'approved' || req.status === 'applied'
                    ? 'success'
                    : req.status === 'rejected'
                      ? 'danger'
                      : req.status === 'withdrawn'
                        ? 'outline'
                        : 'warning'
                }
              >
                {req.status.toUpperCase()}
              </Badge>
            ),
          },
          {
            header: 'Actions',
            align: 'right',
            accessor: (req: DiscrepancyRequest) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenDetailSlideOver(req)}
                  className="h-8 px-2.5 text-xs"
                >
                  <Eye size={14} className="mr-1" /> Inspect
                </Button>
                {req.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onWithdrawTrigger(req)}
                    className="h-8 px-2 text-xs text-danger border-danger-surface hover:bg-danger-surface"
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
    </div>
  );
}
