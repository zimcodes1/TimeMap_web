import { createFileRoute } from '@tanstack/react-router';
import NotificationsContainer from '@/app/main/Notifications';

export const Route = createFileRoute('/_main/notifications')({
  component: NotificationsContainer,
  beforeLoad: () => document.title = "Notifications | NSUK TimeMap"
});
