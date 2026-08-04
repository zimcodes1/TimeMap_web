import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import type { Course, Department, User } from '@/types';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updated: Partial<Course>) => void;
  course: Course | null;
  departments: Department[];
  lecturers: User[];
}

export default function EditCourseModal({
  isOpen,
  onClose,
  onSubmit,
  course,
  departments,
  lecturers,
}: EditCourseModalProps) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<number>(300);
  const [creditUnits, setCreditUnits] = useState<number>(3);
  const [departmentId, setDepartmentId] = useState('');
  const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>([]);

  useEffect(() => {
    if (course) {
      setCode(course.code || '');
      setTitle(course.title || '');
      setLevel(course.level || 300);
      setCreditUnits(course.creditUnits || 3);
      setDepartmentId(course.departmentId || '');
      setSelectedLecturerIds((course.lecturers || []).map((l) => l.id));
    }
  }, [course]);

  const toggleLecturer = (id: string) => {
    setSelectedLecturerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (course && code && title) {
      const assignedLecturers = lecturers.filter((l) => selectedLecturerIds.includes(l.id));
      const targetDept = departments.find((d) => d.id === departmentId);

      onSubmit(course.id, {
        code,
        title,
        level,
        creditUnits,
        departmentId,
        departmentName: targetDept?.name,
        lecturers: assignedLecturers,
      });
      onClose();
    }
  };

  if (!course) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Course — ${course.code}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text variant="body-sm" color="muted">
          Update academic course catalog details and assigned teaching staff.
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Course Code</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Course Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Academic Level</label>
            <Select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
              <option value={100}>100 Level</option>
              <option value={200}>200 Level</option>
              <option value={300}>300 Level</option>
              <option value={400}>400 Level</option>
              <option value={500}>500 Level</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Credit Units</label>
            <Input
              type="number"
              value={creditUnits}
              onChange={(e) => setCreditUnits(Number(e.target.value))}
              min={1}
              max={6}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Department</label>
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-main">Assigned Lecturers</label>
          <div className="flex flex-wrap gap-2 p-3 bg-surface-raised border border-border rounded-xl max-h-36 overflow-y-auto">
            {lecturers.map((lec) => {
              const isSelected = selectedLecturerIds.includes(lec.id);
              return (
                <button
                  type="button"
                  key={lec.id}
                  onClick={() => toggleLecturer(lec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-text-muted border-border hover:bg-secondary'
                  }`}
                >
                  {lec.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Course Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
