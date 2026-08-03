import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { ClassRepReport } from '@/types';

interface DisputeResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (responseText: string) => void;
  report: ClassRepReport | null;
}

export default function DisputeResponseModal({
  isOpen,
  onClose,
  onSubmit,
  report,
}: DisputeResponseModalProps) {
  const [responseText, setResponseText] = useState('');

  if (!report) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    onSubmit(responseText);
    setResponseText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lecturer Dispute Response"
      description={`Respond to class rep report for ${report.courseCode}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit Response
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-surface-raised rounded-xl border border-border space-y-1">
          <Text variant="caption" className="font-bold text-text-main block">
            Rep Report: {report.held ? 'Lecture Held' : 'Lecture Not Held'}
          </Text>
          <Text variant="caption" color="muted" className="block text-xs">
            Reason: {report.reasonText || 'No details provided'}
          </Text>
        </div>

        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Lecturer Response
          </Text>
          <Input
            placeholder="e.g. Class rep arrived 20 minutes late; lecture was held from 9:30 AM."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
