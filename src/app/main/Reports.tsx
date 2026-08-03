import { useState } from 'react';
import ReportsView from '@/pages/main/ReportsView';
import DisputeResponseModal from '@/components/modals/DisputeResponseModal';
import AcknowledgeFlagModal from '@/components/modals/AcknowledgeFlagModal';
import { mockReports, mockFlags } from '@/constants/mockData';
import type { ClassRepReport, UnreportedSessionFlag } from '@/types';

export default function ReportsContainer() {
  const [reports, setReports] = useState<ClassRepReport[]>(mockReports);
  const [flags, setFlags] = useState<UnreportedSessionFlag[]>(mockFlags);

  const [selectedReportForDispute, setSelectedReportForDispute] = useState<ClassRepReport | null>(null);
  const [selectedFlagForAck, setSelectedFlagForAck] = useState<UnreportedSessionFlag | null>(null);

  const handleDisputeSubmit = (responseText: string) => {
    if (!selectedReportForDispute) return;
    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReportForDispute.id ? { ...r, lecturerResponse: responseText } : r
      )
    );
    setSelectedReportForDispute(null);
  };

  const handleFlagAcknowledge = () => {
    if (!selectedFlagForAck) return;
    setFlags((prev) =>
      prev.map((f) =>
        f.id === selectedFlagForAck.id
          ? {
              ...f,
              isAcknowledged: true,
              acknowledgedByName: 'Dr. Sarah Jenkins',
              acknowledgedAt: new Date().toISOString(),
            }
          : f
      )
    );
    setSelectedFlagForAck(null);
  };

  const handleTriggerSweep = () => {
    const newFlag: UnreportedSessionFlag = {
      id: `flag_${Date.now()}`,
      sessionId: `sess_${Date.now()}`,
      courseCode: 'EEE402',
      timetableEntryTitle: 'EEE402 Signal Processing',
      sessionDate: new Date().toISOString().split('T')[0],
      flaggedAt: new Date().toISOString(),
      isAcknowledged: false,
    };
    setFlags((prev) => [newFlag, ...prev]);
  };

  return (
    <>
      <ReportsView
        reports={reports}
        flags={flags}
        onOpenDisputeResponse={(rep) => setSelectedReportForDispute(rep)}
        onAcknowledgeFlagTrigger={(flag) => setSelectedFlagForAck(flag)}
        onTriggerSweep={handleTriggerSweep}
      />

      <DisputeResponseModal
        isOpen={!!selectedReportForDispute}
        onClose={() => setSelectedReportForDispute(null)}
        onSubmit={handleDisputeSubmit}
        report={selectedReportForDispute}
      />

      <AcknowledgeFlagModal
        isOpen={!!selectedFlagForAck}
        onClose={() => setSelectedFlagForAck(null)}
        onConfirm={handleFlagAcknowledge}
        flag={selectedFlagForAck}
      />
    </>
  );
}
