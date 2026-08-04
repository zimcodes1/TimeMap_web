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
  const [owningLevel, setOwningLevel] = useState<AdminLevel>(initialData?.owningLevel || 'department');
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
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Course Code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CSC 301"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Course Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Database Systems"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Level</label>
            <Select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              options={[
                { value: 100, label: '100 Level' },
                { value: 200, label: '200 Level' },
                { value: 300, label: '300 Level' },
                { value: 400, label: '400 Level' },
                { value: 500, label: '500 Level' },
              ]}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Credit Units</label>
            <Input
              type="number"
              min={1}
              max={6}
              value={creditUnits}
              onChange={(e) => setCreditUnits(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Department</label>
            <Select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">Owning Scope Level</label>
          <Select
            value={owningLevel}
            onChange={(e) => setOwningLevel(e.target.value as AdminLevel)}
            options={[
              { value: 'university', label: 'University Wide' },
              { value: 'school', label: 'School Level' },
              { value: 'faculty', label: 'Faculty Level' },
              { value: 'department', label: 'Department Level' },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <Text variant="caption" className="font-semibold text-text-main">
            Assigned Lecturers
          </Text>
          <div className="max-h-36 overflow-y-auto space-y-1 p-2 border border-border rounded-xl bg-surface-raised">
            {lecturers.map((lec) => {
              const isSelected = selectedLecturerIds.includes(lec.id);
              return (
                <div
                  key={lec.id}
                  onClick={() => toggleLecturer(lec.id)}
                  className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-primary-muted text-primary font-bold' : 'hover:bg-surface'
                  }`}
                >
                  <span>{lec.name}</span>
                  <span className="text-[10px] text-text-muted">{lec.email}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {initialData ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
