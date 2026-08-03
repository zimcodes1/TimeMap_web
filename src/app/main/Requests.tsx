import { useState } from 'react';
import RequestsView from '@/pages/main/RequestsView';
import SubmitDiscrepancyModal from '@/components/modals/SubmitDiscrepancyModal';
import DiscrepancyDetailSlideOver from '@/components/modals/DiscrepancyDetailSlideOver';
import RejectDiscrepancyModal from '@/components/modals/RejectDiscrepancyModal';
import {
  mockDiscrepancies,
  mockVenues,
  mockTimetableEntries,
  mockLectureSessions,
} from '@/constants/mockData';
import type { DiscrepancyRequest } from '@/types';

export default function RequestsContainer() {
  const [requests, setRequests] = useState<DiscrepancyRequest[]>(mockDiscrepancies);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<DiscrepancyRequest | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);

  const handleSubmitDiscrepancy = (data: Record<string, unknown>) => {
    const venue = mockVenues.find((v) => v.id === data.proposed_venue);
    const newRequest: DiscrepancyRequest = {
      id: `disc_${Date.now()}`,
      courseCode: 'CSC301',
      courseTitle: 'Data Structures & Algorithms',
      requestedBy: 'Dr. Sarah Jenkins',
      requestedByRole: 'HOD Computer Science',
      reason: (data.reason as string) || 'Schedule shift requested',
      requestType: (data.request_type as DiscrepancyRequest['requestType']) || 'shift_venue',
      proposedVenueId: data.proposed_venue as string,
      proposedVenueName: venue?.name,
      proposedStartTime: data.proposed_start_time as string,
      proposedEndTime: data.proposed_end_time as string,
      status: 'pending',
      createdAt: new Date().toISOString(),
      targetLevel: 'department',
    };
    setRequests((prev) => [newRequest, ...prev]);
  };

  const handleApproveRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectingRequestId) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === rejectingRequestId ? { ...r, status: 'rejected', reason: `${r.reason} (Rejection note: ${reason})` } : r
      )
    );
    setRejectingRequestId(null);
  };

  const handleWithdrawRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'withdrawn' } : r))
    );
  };

  return (
    <>
      <RequestsView
        requests={requests}
        onOpenSubmitDiscrepancy={() => setIsSubmitModalOpen(true)}
        onOpenDetailSlideOver={(req) => setSelectedRequestForDetail(req)}
      />

      <SubmitDiscrepancyModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitDiscrepancy}
        venues={mockVenues}
        entries={mockTimetableEntries}
        sessions={mockLectureSessions}
      />

      <DiscrepancyDetailSlideOver
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        onApprove={handleApproveRequest}
        onRejectTrigger={(id) => setRejectingRequestId(id)}
        onWithdraw={handleWithdrawRequest}
        request={selectedRequestForDetail}
      />

      <RejectDiscrepancyModal
        isOpen={!!rejectingRequestId}
        onClose={() => setRejectingRequestId(null)}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}
