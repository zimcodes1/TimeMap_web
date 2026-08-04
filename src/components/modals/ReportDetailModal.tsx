import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { UserCheck, MessageSquare, Clock } from 'lucide-react';
import type { ClassRepReport } from '@/types';

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDisputeResponse: (report: ClassRepReport) => void;
  report: ClassRepReport | null;
}

export default function ReportDetailModal({
  isOpen,
  onClose,
  onOpenDisputeResponse,
  report,
}: ReportDetailModalProps) {
  if (!report) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Lecture Report — ${report.courseCode}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
          <div>
            <div className="font-bold text-text-main text-sm">{report.courseCode}</div>
            <div className="text-xs text-text-muted">Session ID: {report.sessionId}</div>
          </div>
          <Badge variant={report.held ? 'success' : 'danger'}>
            {report.held ? 'HELD' : 'NOT HELD'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
            <UserCheck size={14} className="text-primary" /> Submitted by Class Rep:
          </div>
          <div className="p-3 bg-surface border border-border rounded-xl text-xs space-y-1">
            <div className="font-bold">{report.reporterName}</div>
            <div className="text-text-muted">Reason / Notes: {report.reasonText || 'No extra notes'}</div>
            <div className="text-[11px] text-text-subtle flex items-center gap-1 mt-1">
              <Clock size={12} /> {new Date(report.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
            <MessageSquare size={14} className="text-blue-600" /> Lecturer Response / Dispute Thread:
          </div>
          <div className="p-3 bg-surface-raised border border-border rounded-xl text-xs">
            {report.lecturerResponse ? (
              <div className="space-y-1">
                <div className="font-semibold text-emerald-600">Lecturer Note:</div>
                <p className="text-text-main">{report.lecturerResponse}</p>
              </div>
            ) : (
              <div className="text-text-muted italic">No response or dispute filed yet.</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onOpenDisputeResponse(report);
            }}
          >
            File / Edit Response
          </Button>
        </div>
      </div>
    </Modal>
  );
}
