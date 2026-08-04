import { useState } from 'react';
import RequestsView from '@/pages/main/RequestsView';
import SubmitDiscrepancyModal from '@/components/modals/SubmitDiscrepancyModal';
import DiscrepancyDetailSlideOver from '@/components/modals/DiscrepancyDetailSlideOver';
import RejectDiscrepancyModal from '@/components/modals/RejectDiscrepancyModal';
import WithdrawRequestModal from '@/components/modals/WithdrawRequestModal';
import { mockDiscrepancies, mockTimetableEntries, mockLectureSessions, mockVenues } from '@/constants/mockData';
import type { DiscrepancyRequest } from '@/types';
import { toast } from 'sonner';

export default function RequestsContainer() {
  const [requests, setRequests] = useState<DiscrepancyRequest[]>(mockDiscrepancies);

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<DiscrepancyRequest | null>(null);
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<DiscrepancyRequest | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<DiscrepancyRequest | null>(null);

  const handleSubmitDiscrepancy = (data: Partial<DiscrepancyRequest>) => {
    const targetEntry = mockTimetableEntries.find((e) => e.id === data.timetableEntryId);
    const targetSession = mockLectureSessions.find((s) => s.id === data.lectureSessionId);
    const proposedVenue = mockVenues.find((v) => v.id === data.proposedVenueId);

    const newReq: DiscrepancyRequest = {
      id: `${Math.floor(1000 + Math.random() * 9000)}`,
      requestType: data.requestType || 'shift_venue',
      lectureSessionId: data.lectureSessionId,
      timetableEntryId: data.timetableEntryId,
      courseCode: targetEntry?.courseCode || targetSession?.courseCode || 'CSC301',
      courseTitle: targetEntry?.courseTitle || targetSession?.courseTitle || 'Data Structures',
      requestedBy: 'Dr. Sarah Jenkins',
      requestedByRole: 'Lecturer',
      proposedVenueId: data.proposedVenueId,
      proposedVenueName: proposedVenue?.name || 'Hall B',
      proposedStartTime: data.proposedStartTime || '10:00:00',
      proposedEndTime: data.proposedEndTime || '12:00:00',
      reason: data.reason || 'Venue capacity requirement',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);
    toast.success('Discrepancy request submitted for approval');
  };

  const handleApproveRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
    setSelectedRequestForDetail(null);
    toast.success(`Request #${id} approved successfully`);
  };

  const handleRejectRequest = (id: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected', rejectionReason: reason } : r))
    );
    setSelectedRequestForReject(null);
    setSelectedRequestForDetail(null);
    toast.error(`Request #${id} rejected`);
  };

  const handleWithdrawRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'withdrawn' } : r))
    );
    toast.info(`Request #${id} withdrawn`);
  };

  return (
    <>
      <RequestsView
        requests={requests}
        onOpenSubmitDiscrepancy={() => setIsSubmitOpen(true)}
        onOpenDetailSlideOver={(req) => setSelectedRequestForDetail(req)}
        onWithdrawTrigger={(req) => setWithdrawTarget(req)}
      />

      <SubmitDiscrepancyModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmit={handleSubmitDiscrepancy}
        entries={mockTimetableEntries}
        sessions={mockLectureSessions}
        venues={mockVenues}
      />

      <DiscrepancyDetailSlideOver
        isOpen={Boolean(selectedRequestForDetail)}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
        onApprove={handleApproveRequest}
        onRejectTrigger={(id) => {
          const req = requests.find((r) => r.id === id);
          if (req) setSelectedRequestForReject(req);
        }}
        onWithdraw={handleWithdrawRequest}
      />

      <RejectDiscrepancyModal
        isOpen={Boolean(selectedRequestForReject)}
        onClose={() => setSelectedRequestForReject(null)}
        onConfirm={(reason: string) => {
          if (selectedRequestForReject) {
            handleRejectRequest(selectedRequestForReject.id, reason);
          }
        }}
      />

      <WithdrawRequestModal
        isOpen={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdrawRequest}
        request={withdrawTarget}
      />
    </>
  );
}
