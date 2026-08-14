import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { TimetableEntry, User } from '@/types';

interface CreateExamSittingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { timetableEntryId: string; invigilatorIds: string[] }) => void;
  entries?: TimetableEntry[];
  lecturers?: User[];
}

export default function CreateExamSittingModal({
  isOpen,
  onClose,
  onSubmit,
  entries = [],
  lecturers = [],
}: CreateExamSittingModalProps) {
  const [timetableEntryId, setTimetableEntryId] = useState(entries[0]?.id || '');
  const [selectedInvigilatorIds, setSelectedInvigilatorIds] = useState<string[]>([]);

  const toggleInvigilator = (id: string) => {
    setSelectedInvigilatorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timetableEntryId) return;
    onSubmit({ timetableEntryId, invigilatorIds: selectedInvigilatorIds });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Exam Sitting"
      description="Attach invigilators to an exam timetable entry."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Exam Sitting
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Select Exam Timetable Entry
          </Text>
          <Select
            value={timetableEntryId}
            onChange={(e) => setTimetableEntryId(e.target.value)}
            options={entries.map((e) => ({
              value: e.id,
              label: `${e.courseCode} - ${e.courseTitle} (${e.venueName})`,
            }))}
          />
        </div>

        <div>
          <Text variant="caption" className="font-semibold mb-2 block">
            Assign Invigilators
          </Text>
          <div className="flex flex-wrap gap-2">
            {lecturers.map((lec) => {
              const selected = selectedInvigilatorIds.includes(lec.id);
              return (
                <button
                  type="button"
                  key={lec.id}
                  onClick={() => toggleInvigilator(lec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selected
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-text-muted border-border hover:bg-surface-raised'
                  }`}
                >
                  {lec.name}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
