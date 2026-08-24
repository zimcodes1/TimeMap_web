import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Course, Department, Faculty, School, AdminLevel } from "@/types";

interface OfferAccessGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    courseId: string;
    grantedToLevel: AdminLevel;
    grantedToDepartmentId?: string;
    grantedToFacultyId?: string;
    grantedToSchoolId?: string;
  }) => void;
  courses: Course[];
  departments: Department[];
  faculties?: Faculty[];
  schools?: School[];
}

export default function OfferAccessGrantModal({
  isOpen,
  onClose,
  onSubmit,
  courses,
  departments,
  faculties = [],
  schools = [],
}: OfferAccessGrantModalProps) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [grantedToLevel, setGrantedToLevel] = useState<AdminLevel>("department");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [targetId, setTargetId] = useState(departments[0]?.id || "");

  const selectedCourse = courses.find((c) => c.id === (courseId || courses[0]?.id));

  // Filter available departments based on selected target faculty
  const availableDepartments = useMemo(() => {
    if (!selectedFacultyId) return departments;
    const targetFaculty = faculties.find((f) => String(f.id) === String(selectedFacultyId));
    return departments.filter(
      (d) =>
        String(d.facultyId) === String(selectedFacultyId) ||
        (targetFaculty && d.facultyName === targetFaculty.name)
    );
  }, [departments, faculties, selectedFacultyId]);

  useEffect(() => {
    if (!courseId && courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  useEffect(() => {
    if (grantedToLevel === "school" && schools.length > 0) {
      setTargetId(schools[0].id);
    } else if (grantedToLevel === "faculty" && faculties.length > 0) {
      setTargetId(faculties[0].id);
    } else if (grantedToLevel === "department" && availableDepartments.length > 0) {
      setTargetId(availableDepartments[0].id);
    }
  }, [grantedToLevel, availableDepartments, faculties, schools]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCourseId = courseId || courses[0]?.id;
    if (!activeCourseId) return;

    onSubmit({
      courseId: activeCourseId,
      grantedToLevel,
      grantedToDepartmentId: grantedToLevel === "department" ? targetId : undefined,
      grantedToFacultyId: grantedToLevel === "faculty" ? targetId : undefined,
      grantedToSchoolId: grantedToLevel === "school" ? targetId : undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Offer Course Access Grant"
      description="Share access to an owned course with another department, faculty, or school."
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="cursor-pointer">
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
            value={courseId || courses[0]?.id || ""}
            onChange={(e) => setCourseId(e.target.value)}
            options={courses.map((c) => ({
              value: c.id,
              label: `${c.code} - ${c.title} (${c.level} Level)`,
            }))}
          />
        </div>

        {selectedCourse && (
          <div className="p-3 bg-raised/50 border border-border/50 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between text-text-muted">
              <span>Course Level: <strong className="text-text-main">{selectedCourse.level} Level</strong></span>
              {selectedCourse.departmentName && (
                <span>Owner: <strong className="text-text-main">{selectedCourse.departmentName}</strong></span>
              )}
            </div>
            <p className="text-primary/90 font-medium">
              Note: This grant will grant course access for students at <strong>{selectedCourse.level} Level</strong> in the target domain.
            </p>
          </div>
        )}

        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Target Scope Level
          </Text>
          <Select
            value={grantedToLevel}
            onChange={(e) => setGrantedToLevel(e.target.value as AdminLevel)}
            options={[
              { value: "department", label: "Specific Department" },
              { value: "faculty", label: "Entire Faculty" },
              { value: "school", label: "Entire School" },
            ]}
          />
        </div>

        {grantedToLevel === "department" && faculties.length > 0 && (
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Target Faculty (Filter)
            </Text>
            <Select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              options={[
                { value: "", label: "All Faculties" },
                ...faculties.map((f) => ({ value: f.id, label: `${f.code} - ${f.name}` })),
              ]}
            />
          </div>
        )}

        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            {grantedToLevel === "school"
              ? "Target School"
              : grantedToLevel === "faculty"
              ? "Target Faculty"
              : "Target Department"}
          </Text>

          {grantedToLevel === "school" && (
            <Select
              value={targetId || (schools[0]?.id ?? "")}
              onChange={(e) => setTargetId(e.target.value)}
              options={schools.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
            />
          )}

          {grantedToLevel === "faculty" && (
            <Select
              value={targetId || (faculties[0]?.id ?? "")}
              onChange={(e) => setTargetId(e.target.value)}
              options={faculties.map((f) => ({ value: f.id, label: `${f.code} - ${f.name}` }))}
            />
          )}

          {grantedToLevel === "department" && (
            <Select
              value={targetId || (availableDepartments[0]?.id ?? "")}
              onChange={(e) => setTargetId(e.target.value)}
              options={availableDepartments.map((d) => ({
                value: d.id,
                label: `${d.code} - ${d.name}${d.facultyName ? ` (${d.facultyName})` : ""}`,
              }))}
            />
          )}
        </div>
      </form>
    </Modal>
  );
}
