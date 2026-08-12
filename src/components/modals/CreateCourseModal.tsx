import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Course, Department, Faculty, School, User, AdminLevel } from "@/types";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Course> & { scopeId?: string; lecturerIds?: string[] }) => void;
  departments: Department[];
  faculties?: Faculty[];
  schools?: School[];
  lecturers: User[];
  initialData?: Course | null;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
  faculties = [],
  schools = [],
  lecturers,
  initialData,
}: CreateCourseModalProps) {
  const [code, setCode] = useState(initialData?.code || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [level, setLevel] = useState(initialData?.level || 300);
  const [creditUnits, setCreditUnits] = useState(initialData?.creditUnits || 3);
  const [owningLevel, setOwningLevel] = useState<AdminLevel>(initialData?.owningLevel || "department");
  const [scopeId, setScopeId] = useState<string>(initialData?.departmentId || "");
  const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>(
    initialData?.lecturers?.map((l) => l.id) || []
  );

  useEffect(() => {
    if (owningLevel === "school" && schools.length > 0 && !scopeId) {
      setScopeId(schools[0].id);
    } else if (owningLevel === "faculty" && faculties.length > 0 && !scopeId) {
      setScopeId(faculties[0].id);
    } else if (owningLevel === "department" && departments.length > 0 && !scopeId) {
      setScopeId(departments[0].id);
    }
  }, [owningLevel, departments, faculties, schools, scopeId]);

  const handleOwningLevelChange = (newLevel: AdminLevel) => {
    setOwningLevel(newLevel);
    if (newLevel === "school" && schools.length > 0) {
      setScopeId(schools[0].id);
    } else if (newLevel === "faculty" && faculties.length > 0) {
      setScopeId(faculties[0].id);
    } else if (newLevel === "department" && departments.length > 0) {
      setScopeId(departments[0].id);
    } else {
      setScopeId("");
    }
  };

  const toggleLecturer = (id: string) => {
    setSelectedLecturerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;
    const activeScopeId = scopeId || (owningLevel === "department" ? departments[0]?.id : owningLevel === "faculty" ? faculties[0]?.id : schools[0]?.id) || "";
    const assignedLecturers = lecturers.filter((l) => selectedLecturerIds.includes(l.id));
    const dept = departments.find((d) => d.id === activeScopeId);

    onSubmit({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      level: Number(level),
      creditUnits: Number(creditUnits),
      departmentId: owningLevel === "department" ? activeScopeId : undefined,
      departmentName: dept?.name,
      owningLevel,
      scopeId: activeScopeId,
      lecturers: assignedLecturers,
      lecturerIds: selectedLecturerIds,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Course" : "Create New Course"}
      description="Enter course details and assign teaching staff."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Text variant="caption" className="font-semibold mb-1 block">Course Code</Text>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CSC 301"
              required
            />
          </div>
          <div className="space-y-1">
            <Text variant="caption" className="font-semibold mb-1 block">Course Title</Text>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Database Systems"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Text variant="caption" className="font-semibold mb-1 block">Academic Level</Text>
            <Select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              options={[
                { value: 100, label: "100 Level" },
                { value: 200, label: "200 Level" },
                { value: 300, label: "300 Level" },
                { value: 400, label: "400 Level" },
                { value: 500, label: "500 Level" },
              ]}
            />
          </div>
          <div className="space-y-1">
            <Text variant="caption" className="font-semibold mb-1 block">Credit Units</Text>
            <Input
              type="number"
              min={1}
              max={6}
              value={creditUnits}
              onChange={(e) => setCreditUnits(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Text variant="caption" className="font-semibold mb-1 block">Owning Scope Level</Text>
            <Select
              value={owningLevel}
              onChange={(e) => handleOwningLevelChange(e.target.value as AdminLevel)}
              options={[
                { value: "department", label: "Department Owned" },
                { value: "faculty", label: "Faculty Level" },
                { value: "school", label: "School Level" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <Text variant="caption" className="font-semibold mb-1 block">
              {owningLevel === "school"
                ? "Owning School"
                : owningLevel === "faculty"
                ? "Owning Faculty"
                : "Owning Department"}
            </Text>

            {owningLevel === "school" && (
              <Select
                value={scopeId || (schools[0]?.id ?? "")}
                onChange={(e) => setScopeId(e.target.value)}
                options={schools.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
              />
            )}

            {owningLevel === "faculty" && (
              <Select
                value={scopeId || (faculties[0]?.id ?? "")}
                onChange={(e) => setScopeId(e.target.value)}
                options={faculties.map((f) => ({ value: f.id, label: `${f.code} - ${f.name}` }))}
              />
            )}

            {owningLevel === "department" && (
              <Select
                value={scopeId || (departments[0]?.id ?? "")}
                onChange={(e) => setScopeId(e.target.value)}
                options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Text variant="caption" className="font-semibold text-text-main">
            Assigned Teaching Lecturers
          </Text>
          <div className="max-h-36 overflow-y-auto space-y-1 p-2 border border-border rounded-xl bg-surface-raised">
            {lecturers.length === 0 ? (
              <div className="text-xs text-text-muted p-2">No lecturers available for assignment.</div>
            ) : (
              lecturers.map((lec) => {
                const isSelected = selectedLecturerIds.includes(lec.id);
                return (
                  <div
                    key={lec.id}
                    onClick={() => toggleLecturer(lec.id)}
                    className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? "bg-primary-muted text-primary font-bold" : "hover:bg-surface"
                    }`}
                  >
                    <span>{lec.name}</span>
                    <span className="text-[10px] text-text-muted">{lec.email || lec.identifier}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" type="submit" className="cursor-pointer">
            {initialData ? "Save Changes" : "Create Course"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
