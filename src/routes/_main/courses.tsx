import { createFileRoute } from '@tanstack/react-router';
import CoursesContainer from '@/app/main/Courses';

export const Route = createFileRoute('/_main/courses')({
  component: CoursesContainer,
});
