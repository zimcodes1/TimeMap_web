import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Course } from "@/types";

interface RequestAccessGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { courseId: string }) => void;
  externalCourses: Course[];
}

export default function RequestAccessGrantModal({
  isOpen,
  onClose,
  onSubmit,
  externalCourses,
}: RequestAccessGrantModalProps) {
  const [courseId, setCourseId] = useState(externalCourses[0]?.id || "");

  useEffect(() => {
    if (!courseId && externalCourses.length > 0) {
      setCourseId(externalCourses[0].id);
    }
  }, [externalCourses, courseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCourseId = courseId || externalCourses[0]?.id;
    if (!activeCourseId) return;
    onSubmit({ courseId: activeCourseId });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request External Course Access"
      description="Request course access permission from another department admin."
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="cursor-pointer">
            Submit Access Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Select External Course
          </Text>
          <Select
            value={courseId || externalCourses[0]?.id || ""}
            onChange={(e) => setCourseId(e.target.value)}
            options={externalCourses.map((c) => ({
              value: c.id,
              label: `${c.code} - ${c.title} (${c.departmentName || "External Department"})`,
            }))}
          />
        </div>
      </form>
    </Modal>
  );
}
