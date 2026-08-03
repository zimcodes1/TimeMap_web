import { createFileRoute } from '@tanstack/react-router';
import RequestsContainer from '@/app/main/Requests';

export const Route = createFileRoute('/_main/requests')({
  component: RequestsContainer,
});
