import { createFileRoute } from '@tanstack/react-router';
import UsersContainer from '@/app/main/Users';

export const Route = createFileRoute('/_main/users')({
  component: UsersContainer,
  beforeLoad: () => document.title = "User Management | NSUK TimeMap"
});
