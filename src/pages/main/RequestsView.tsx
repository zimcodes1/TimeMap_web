import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, Clock } from 'lucide-react';
import type { DiscrepancyRequest } from '@/types';

interface RequestsViewProps {
  requests: DiscrepancyRequest[];
  onOpenSubmitDiscrepancy: () => void;
  onOpenDetailSlideOver: (req: DiscrepancyRequest) => void;
}

export default function RequestsView({
  requests,
  onOpenSubmitDiscrepancy,
  onOpenDetailSlideOver,
}: RequestsViewProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const filteredRequests =
    activeTab === 'pending'
      ? requests.filter((r) => r.status === 'pending')
      : requests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Discrepancy Requests & Approvals
          </Text>
          <Text variant="body-sm" color="muted">
            Manage schedule shifts, cancellations, postponements, and cross-level booking approvals.
          </Text>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenSubmitDiscrepancy}>
          <Plus size={16} className="mr-1" /> Submit Discrepancy Request
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'pending'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <Clock size={16} /> Pending Approvals ({requests.filter((r) => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <AlertTriangle size={16} /> All History ({requests.length})
        </button>
      </div>

      {/* Requests Table */}
      <Card className="p-4 overflow-x-auto">
        <Table>
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
              <th className="py-3 px-2">Req ID / Course</th>
              <th className="py-3 px-2">Type</th>
              <th className="py-3 px-2">Requested By</th>
              <th className="py-3 px-2">Proposed Schedule</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-surface-raised transition-colors">
                <td className="py-3 px-2 font-medium">
                  <div className="font-bold text-primary">#{req.id}</div>
                  <div className="text-xs text-text-main">
                    {req.courseCode} - {req.courseTitle}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <Badge variant="default" className="capitalize">
                    {req.requestType.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-xs">
                  <div className="font-semibold text-text-main">{req.requestedBy}</div>
                  <div className="text-text-muted">{req.requestedByRole}</div>
                </td>
                <td className="py-3 px-2 text-xs">
                  <div className="font-medium text-text-main">
                    Venue: {req.proposedVenueName || 'N/A'}
                  </div>
                  <div className="text-text-muted">
                    Time: {req.proposedStartTime || 'N/A'} - {req.proposedEndTime || 'N/A'}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <Badge
                    variant={
                      req.status === 'approved' || req.status === 'applied'
                        ? 'success'
                        : req.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {req.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-right">
                  <Button variant="outline" size="sm" onClick={() => onOpenDetailSlideOver(req)}>
                    Inspect Request
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
