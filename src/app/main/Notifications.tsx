import { useState } from 'react';
import NotificationsView from '@/pages/main/NotificationsView';
import { mockNotifications } from '@/constants/mockData';
import type { NotificationItem } from '@/types';

export default function NotificationsContainer() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <NotificationsView
      notifications={notifications}
      onMarkRead={handleMarkRead}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}
