import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { Course, Department, User, AdminLevel } from '@/types';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Course>) => void;
  departments: Department[];
  lecturers: User[];
  initialData?: Course | null;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
  lecturers,
  initialData,
}: CreateCourseModalProps) {
  const [code, setCode] = useState(initialData?.code || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [level, setLevel] = useState(initialData?.level || 300);
  const [creditUnits, setCreditUnits] = useState(initialData?.creditUnits || 3);
  const [departmentId, setDepartmentId] = useState(initialData?.departmentId || departments[0]?.id || '');
  const [owningLevel, setOwningLevel] = useState<AdminLevel | 'general'>(initialData?.owningLevel || 'department');
  const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>(
    initialData?.lecturers?.map((l) => l.id) || []
  );

  const toggleLecturer = (id: string) => {
    setSelectedLecturerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;
    const assignedLecturers = lecturers.filter((l) => selectedLecturerIds.includes(l.id));
    const dept = departments.find((d) => d.id === departmentId);
    onSubmit({
      code,
      title,
      level: Number(level),
      creditUnits: Number(creditUnits),
      departmentId,
      departmentName: dept?.name,
      owningLevel,
      lecturers: assignedLecturers,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Course' : 'Create New Course'}
      description="Enter course details and assign teaching staff."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Create Course'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Course Code
            </Text>
            <Input
              placeholder="e.g. CSC301"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Level
            </Text>
            <Select
              value={String(level)}
              onChange={(e) => setLevel(Number(e.target.value))}
              options={[
                { value: '100', label: '100 Level' },
                { value: '200', label: '200 Level' },
                { value: '300', label: '300 Level' },
                { value: '400', label: '400 Level' },
                { value: '500', label: '500 Level' },
              ]}
            />
          </div>
        </div>

        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Course Title
          </Text>
          <Input
            placeholder="e.g. Data Structures & Algorithms"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Credit Units
            </Text>
            <Input
              type="number"
              value={creditUnits}
              onChange={(e) => setCreditUnits(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Owning Department
            </Text>
            <Select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Owning Scope Level
            </Text>
            <Select
              value={owningLevel}
              onChange={(e) => setOwningLevel(e.target.value as AdminLevel | 'general')}
              options={[
                { value: 'department', label: 'Departmental Course' },
                { value: 'faculty', label: 'Faculty Wide Course' },
                { value: 'school', label: 'School Central Course' },
                { value: 'general', label: 'General Studies (GST)' },
              ]}
            />
          </div>
        </div>

        <div>
          <Text variant="caption" className="font-semibold mb-2 block">
            Assigned Lecturers
          </Text>
          <div className="flex flex-wrap gap-2">
            {lecturers.map((lec) => {
              const selected = selectedLecturerIds.includes(lec.id);
              return (
                <button
                  type="button"
                  key={lec.id}
                  onClick={() => toggleLecturer(lec.id)}
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
