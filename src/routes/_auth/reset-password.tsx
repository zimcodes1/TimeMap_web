import { createFileRoute } from '@tanstack/react-router';
import ResetPasswordContainer from '@/app/auth/ResetPassword';

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPasswordContainer,
});
