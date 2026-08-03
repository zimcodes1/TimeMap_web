import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BellRing } from 'lucide-react';
import type { User } from '@/types';

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
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Text variant="h3" weight="bold" className="text-text-main">
          System Settings & Integrations
        </Text>
        <Text variant="body-sm" color="muted">
          Manage admin profile, Google Calendar OAuth sync, and browser push notification delivery.
        </Text>
      </div>

      {/* Profile Specs Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-xl shrink-0">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <Text variant="h5" weight="bold" className="text-text-main">
              {user.name}
            </Text>
            <Text variant="caption" color="muted" className="block">
              {user.email} • Identifier: {user.identifier}
            </Text>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="capitalize">
                Role: {user.role}
              </Badge>
              <Badge variant="success" className="capitalize">
                Scope: {user.adminLevel || 'department'} Level ({user.adminScopeName})
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Google Calendar OAuth Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <Text variant="h6" weight="bold" className="text-text-main">
                Google Calendar Integration
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

      {/* Browser Push Registration Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <BellRing size={24} />
            </div>
            <div>
              <Text variant="h6" weight="bold" className="text-text-main">
                Web Push Notifications (FCM)
              </Text>
              <Text variant="body-sm" color="muted">
                Receive instant browser notifications when discrepancy requests require approval.
              </Text>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => alert('FCM token registered.')}>
            Enable Push Notifications
          </Button>
        </div>
      </Card>
    </div>
  );
}
