import { createFileRoute } from '@tanstack/react-router';
import LoginContainer from '@/app/auth/Login';

export const Route = createFileRoute('/_auth/login')({
  component: LoginContainer,
  beforeLoad: () => { document.title = "Login | NSUK TimeMap" }
});
