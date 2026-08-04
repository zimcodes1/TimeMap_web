import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BellRing, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import type { User } from '@/types';
import { toast } from 'sonner';

interface SettingsViewProps {
  user: User;
  isCalendarConnected: boolean;
  onOpenConnectCalendar: () => void;
}

export default function SettingsView({
  user,
  isCalendarConnected,
  onOpenConnectCalendar,
}: SettingsViewProps) {
  const [fcmEnabled, setFcmEnabled] = useState(true);

  const toggleFcm = () => {
    setFcmEnabled((prev) => !prev);
    toast.success(`Web Push Notifications ${!fcmEnabled ? 'Enabled' : 'Disabled'}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Text variant="h3" weight="bold" className="text-text-main">
          System Settings & Integrations
        </Text>
        <Text variant="body-sm" color="muted">
          Manage admin profile credentials, Google Calendar OAuth synchronization, and Web Push Notification delivery.
        </Text>
      </div>

      {/* Profile Specs & Role Scope Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <div className="w-14 h-14 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-xl shrink-0">
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div>
            <Text variant="h5" weight="bold" className="text-text-main">
              {user.name}
            </Text>
            <Text variant="caption" color="muted" className="block">
              {user.email} • Staff Identifier: {user.identifier}
            </Text>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="capitalize">
                Role: {user.role}
              </Badge>
              <Badge variant="success" className="capitalize">
                Scope: {user.adminLevel || 'department'} Level ({user.adminScopeName || 'CSC Dept'})
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="font-bold text-text-main flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-primary" /> Administrative Privileges Breakdown:
          </div>
          <ul className="list-disc pl-5 text-text-muted space-y-1">
            <li>Full timetable booking creation and conflict detection engine override within scope.</li>
            <li>Discrepancy request review, approval routing, and batch session shifting.</li>
            <li>Class Rep lecture-hold oversight and automated unreported session flag acknowledgment.</li>
          </ul>
        </div>
      </Card>

      {/* Google Calendar OAuth Integration */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <Text variant="h6" weight="bold" className="text-text-main">
                Google Calendar Integration (OAuth 2.0)
              </Text>
              <Text variant="body-sm" color="muted">
                Sync academic lecture timetables and exam sittings directly to Google Calendar.
              </Text>
              <div className="mt-2">
                {isCalendarConnected ? (
                  <Badge variant="success">OAuth Connected & Active</Badge>
                ) : (
                  <Badge variant="warning">Not Connected</Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant={isCalendarConnected ? 'outline' : 'primary'} onClick={onOpenConnectCalendar}>
            {isCalendarConnected ? 'Manage Integration' : 'Connect Calendar'}
          </Button>
        </div>
      </Card>

      {/* Web Push Registration Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <BellRing size={24} />
            </div>
            <div>
              <Text variant="h6" weight="bold" className="text-text-main">
                Web Push Notifications (FCM Device Token)
              </Text>
              <Text variant="body-sm" color="muted">
                Receive instant browser notifications when discrepancy requests require approval.
              </Text>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={fcmEnabled ? 'success' : 'danger'}>
                  {fcmEnabled ? 'Token Registered' : 'Disabled'}
                </Badge>
                {fcmEnabled && (
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Web Push Active
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={toggleFcm}>
            <RefreshCw size={14} className="mr-1" />
            {fcmEnabled ? 'Disable Push' : 'Enable Push'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
