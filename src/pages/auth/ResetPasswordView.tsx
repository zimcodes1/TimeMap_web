import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

interface ResetPasswordViewProps {
  onSubmit: (newPassword: string) => void;
}

export default function ResetPasswordView({ onSubmit }: ResetPasswordViewProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    onSubmit(newPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl border-border">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck size={28} />
          </div>
          <Text variant="h4" weight="bold" className="text-text-main">
            First-Login Password Reset
          </Text>
          <Text variant="body-sm" color="muted">
            For security compliance, you must set a new password before accessing the system.
          </Text>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              New Password
            </Text>
            <Input
              type="password"
              placeholder="Enter new strong password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Confirm New Password
            </Text>
            <Input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button variant="primary" className="w-full mt-2" type="submit">
            Update Password & Continue
          </Button>
        </form>
      </Card>
    </div>
  );
}
