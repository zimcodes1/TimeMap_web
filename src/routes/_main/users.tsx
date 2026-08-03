import { createFileRoute } from '@tanstack/react-router';
import UsersContainer from '@/app/main/Users';

export const Route = createFileRoute('/_main/users')({
  component: UsersContainer,
});
