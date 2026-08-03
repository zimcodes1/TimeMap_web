import { useNavigate } from '@tanstack/react-router';
import ResetPasswordView from '@/pages/auth/ResetPasswordView';

export default function ResetPasswordContainer() {
  const navigate = useNavigate();

  const handleResetSubmit = (newPassword: string) => {
    console.log('Password reset successfully to:', newPassword);
    navigate({ to: '/dashboard' });
  };

  return <ResetPasswordView onSubmit={handleResetSubmit} />;
}
