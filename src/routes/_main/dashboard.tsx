import { createFileRoute } from '@tanstack/react-router';
import DashboardContainer from '@/app/main/Dashboard';

export const Route = createFileRoute('/_main/dashboard')({
  component: DashboardContainer,
});
