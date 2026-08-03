import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck } from 'lucide-react';
import type { NotificationItem } from '@/types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationsViewProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Text variant="h3" weight="bold" className="text-text-main">
              Notifications Center
            </Text>
            {unreadCount > 0 && <Badge variant="warning">{unreadCount} Unread</Badge>}
          </div>
          <Text variant="body-sm" color="muted">
            Real-time updates regarding discrepancy approvals, session shifts, and system flags.
          </Text>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={onMarkAllRead}>
            <CheckCheck size={16} className="mr-1" /> Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`p-4 transition-all ${
              !notif.isRead
                ? 'border-l-4 border-l-primary bg-primary-muted/20'
                : 'bg-surface opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Bell size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Text variant="caption" className="font-bold text-text-main">
                      {notif.title}
                    </Text>
                    <Badge variant="default" className="text-[10px]">
                      {notif.notificationType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-main mt-1">{notif.body}</p>
                  <Text variant="caption" color="muted" className="text-[11px] mt-2 block">
                    {new Date(notif.createdAt).toLocaleString()}
                  </Text>
                </div>
              </div>
              {!notif.isRead && (
                <Button variant="ghost" size="sm" onClick={() => onMarkRead(notif.id)}>
                  Mark Read
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
