import { useState } from 'react';
import ReportsView from '@/pages/main/ReportsView';
import DisputeResponseModal from '@/components/modals/DisputeResponseModal';
import AcknowledgeFlagModal from '@/components/modals/AcknowledgeFlagModal';
import ReportDetailModal from '@/components/modals/ReportDetailModal';
import { mockReports, mockFlags } from '@/constants/mockData';
import type { ClassRepReport, UnreportedSessionFlag } from '@/types';
import { toast } from 'sonner';

export default function ReportsContainer() {
  const [reports, setReports] = useState<ClassRepReport[]>(mockReports);
  const [flags, setFlags] = useState<UnreportedSessionFlag[]>(mockFlags);

  const [selectedReportForDispute, setSelectedReportForDispute] = useState<ClassRepReport | null>(null);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<ClassRepReport | null>(null);
  const [selectedFlagForAck, setSelectedFlagForAck] = useState<UnreportedSessionFlag | null>(null);

  const handleDisputeResponse = (reportId: string, text: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, lecturerResponse: text } : r))
    );
    setSelectedReportForDispute(null);
    toast.success('Dispute response recorded');
  };

  const handleAcknowledgeFlag = (flagId: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? {
              ...f,
              isAcknowledged: true,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedByName: 'Dr. Sarah Jenkins',
            }
          : f
      )
    );
    setSelectedFlagForAck(null);
    toast.success(`Flag #${flagId} acknowledged`);
  };

  const handleTriggerSweep = () => {
    toast.info('Triggering manual expired session sweep...');
    setTimeout(() => {
      toast.success('Sweep completed. System flags updated.');
    }, 800);
  };

  return (
    <>
      <ReportsView
        reports={reports}
        flags={flags}
        onOpenReportDetail={(r) => setSelectedReportForDetail(r)}
        onOpenDisputeResponse={(r) => setSelectedReportForDispute(r)}
        onAcknowledgeFlagTrigger={(f) => setSelectedFlagForAck(f)}
        onTriggerSweep={handleTriggerSweep}
      />

      <ReportDetailModal
        isOpen={Boolean(selectedReportForDetail)}
        onClose={() => setSelectedReportForDetail(null)}
        onOpenDisputeResponse={(r) => setSelectedReportForDispute(r)}
        report={selectedReportForDetail}
      />

      <DisputeResponseModal
        isOpen={Boolean(selectedReportForDispute)}
        onClose={() => setSelectedReportForDispute(null)}
        onSubmit={(text: string) => {
          if (selectedReportForDispute) {
            handleDisputeResponse(selectedReportForDispute.id, text);
          }
        }}
        report={selectedReportForDispute}
      />

      <AcknowledgeFlagModal
        isOpen={Boolean(selectedFlagForAck)}
        onClose={() => setSelectedFlagForAck(null)}
        onConfirm={() => {
          if (selectedFlagForAck) {
            handleAcknowledgeFlag(selectedFlagForAck.id);
          }
        }}
        flag={selectedFlagForAck}
      />
    </>
  );
}
