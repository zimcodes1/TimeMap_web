import { createFileRoute } from '@tanstack/react-router';
import ReportsContainer from '@/app/main/Reports';

export const Route = createFileRoute('/_main/reports')({
  component: ReportsContainer,
});
