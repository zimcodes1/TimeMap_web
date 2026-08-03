import { createFileRoute } from '@tanstack/react-router';
import NotificationsContainer from '@/app/main/Notifications';

export const Route = createFileRoute('/_main/notifications')({
  component: NotificationsContainer,
});
