import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Course, User } from "@/types";

interface CourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { courseId: string; studentId?: string; academicSession: string }) => void;
  courses: Course[];
  students?: User[];
}

export default function CourseRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  courses,
  students = [],
}: CourseRegistrationModalProps) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [academicSession, setAcademicSession] = useState("2025/2026");

  useEffect(() => {
    if (!courseId && courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  useEffect(() => {
    if (!studentId && students.length > 0) {
      setStudentId(students[0].id);
    }
  }, [students, studentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCourseId = courseId || courses[0]?.id;
    if (!activeCourseId || !academicSession.trim()) return;

    onSubmit({
      courseId: activeCourseId,
      studentId: studentId || undefined,
      academicSession: academicSession.trim(),
    });
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
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="cursor-pointer">
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
            value={courseId || courses[0]?.id || ""}
            onChange={(e) => setCourseId(e.target.value)}
            options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
          />
        </div>

        {students.length > 0 && (
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Select Student
            </Text>
            <Select
              value={studentId || students[0]?.id || ""}
              onChange={(e) => setStudentId(e.target.value)}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.identifier || s.email})`,
              }))}
            />
          </div>
        )}

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
