import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReportsView from "@/pages/main/ReportsView";
import DisputeResponseModal from "@/components/modals/DisputeResponseModal";
import AcknowledgeFlagModal from "@/components/modals/AcknowledgeFlagModal";
import ReportDetailModal from "@/components/modals/ReportDetailModal";
import {
  getClassRepReportsList,
  respondToReportAPI,
  getUnreportedFlagsList,
  acknowledgeFlagAPI,
  triggerSweepAPI,
} from "@/api/main/reportsAPI";
import type { ClassRepReport, UnreportedSessionFlag } from "@/types";
import { toast } from "sonner";

export default function ReportsContainer() {
  const queryClient = useQueryClient();

  const [selectedReportForDispute, setSelectedReportForDispute] = useState<ClassRepReport | null>(null);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<ClassRepReport | null>(null);
  const [selectedFlagForAck, setSelectedFlagForAck] = useState<UnreportedSessionFlag | null>(null);

  // Queries
  const {
    data: reports = [],
    isLoading: isReportsLoading,
    isRefetching: isReportsRefetching,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["reporting", "reports"],
    queryFn: getClassRepReportsList,
  });

  const {
    data: flags = [],
    isLoading: isFlagsLoading,
    isRefetching: isFlagsRefetching,
    refetch: refetchFlags,
  } = useQuery({
    queryKey: ["reporting", "flags"],
    queryFn: getUnreportedFlagsList,
  });

  const isLoading = isReportsLoading || isFlagsLoading;
  const isRefetching = isReportsRefetching || isFlagsRefetching;

  // Mutations
  const respondToReportMutation = useMutation({
    mutationFn: ({ reportId, text }: { reportId: string; text: string }) =>
      respondToReportAPI(reportId, text),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ["reporting", "reports"] });
      toast.success(`Dispute response recorded for course ${updatedReport.courseCode}.`);
      setSelectedReportForDispute(null);
    },
    onError: () => toast.error("Failed to submit dispute response."),
  });

  const acknowledgeFlagMutation = useMutation({
    mutationFn: (flagId: string) => acknowledgeFlagAPI(flagId),
    onSuccess: (updatedFlag) => {
      queryClient.invalidateQueries({ queryKey: ["reporting", "flags"] });
      toast.success(`Flag #${updatedFlag.id} acknowledged successfully.`);
      setSelectedFlagForAck(null);
    },
    onError: () => toast.error("Failed to acknowledge flag."),
  });

  const triggerSweepMutation = useMutation({
    mutationFn: () => triggerSweepAPI(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["reporting", "flags"] });
      queryClient.invalidateQueries({ queryKey: ["reporting", "reports"] });
      toast.success(res.message || "Manual expired session sweep completed.");
    },
    onError: () => toast.error("Failed to trigger automated sweep."),
  });

  // Handlers
  const handleDisputeResponse = (reportId: string, text: string) => {
    respondToReportMutation.mutate({ reportId, text });
  };

  const handleAcknowledgeFlag = (flagId: string) => {
    acknowledgeFlagMutation.mutate(flagId);
  };

  const handleTriggerSweep = () => {
    triggerSweepMutation.mutate();
  };

  const handleManualRefresh = () => {
    refetchReports();
    refetchFlags();
  };

  return (
    <>
      <ReportsView
        reports={reports}
        flags={flags}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onRefresh={handleManualRefresh}
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
