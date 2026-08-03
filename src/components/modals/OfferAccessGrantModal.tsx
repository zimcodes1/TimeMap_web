import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { Course, Department, AdminLevel } from '@/types';

interface OfferAccessGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { courseId: string; grantedToLevel: AdminLevel; grantedToDepartmentId?: string }) => void;
  courses: Course[];
  departments: Department[];
}

export default function OfferAccessGrantModal({
  isOpen,
  onClose,
  onSubmit,
  courses,
  departments,
}: OfferAccessGrantModalProps) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [grantedToLevel, setGrantedToLevel] = useState<AdminLevel>('department');
  const [grantedToDepartmentId, setGrantedToDepartmentId] = useState(departments[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    onSubmit({ courseId, grantedToLevel, grantedToDepartmentId });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Offer Course Access Grant"
      description="Share access to an owned course with another department or faculty."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Offer Access
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Select Course to Share
          </Text>
          <Select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Target Scope Level
          </Text>
          <Select
            value={grantedToLevel}
            onChange={(e) => setGrantedToLevel(e.target.value as AdminLevel)}
            options={[
              { value: 'department', label: 'Specific Department' },
              { value: 'faculty', label: 'Entire Faculty' },
              { value: 'school', label: 'Entire School' },
            ]}
          />
        </div>
        {grantedToLevel === 'department' && (
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Target Department
            </Text>
            <Select
              value={grantedToDepartmentId}
              onChange={(e) => setGrantedToDepartmentId(e.target.value)}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
