import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { Course } from '@/types';

interface CourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { courseId: string; academicSession: string }) => void;
  courses: Course[];
}

export default function CourseRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  courses,
}: CourseRegistrationModalProps) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [academicSession, setAcademicSession] = useState('2025/2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !academicSession.trim()) return;
    onSubmit({ courseId, academicSession });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Course Registration"
      description="Register students for a course in the specified academic session."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Register Course
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Select Course
          </Text>
          <Select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Academic Session
          </Text>
          <Input
            placeholder="e.g. 2025/2026"
            value={academicSession}
            onChange={(e) => setAcademicSession(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
