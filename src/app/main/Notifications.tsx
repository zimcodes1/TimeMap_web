import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NotificationsView from "@/pages/main/NotificationsView";
import {
  getNotificationsList,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
} from "@/api/main/notificationsAPI";
import { toast } from "sonner";

export default function NotificationsContainer() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: getNotificationsList,
    refetchInterval: 10000, // 10s polling for live notifications
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationReadAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Failed to mark notification as read."),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadAPI,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(res.message || "All notifications marked as read.");
    },
    onError: () => toast.error("Failed to mark all notifications as read."),
  });

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <NotificationsView
      notifications={notifications}
      isLoading={isLoading}
      isRefetching={isRefetching}
      onRefresh={refetch}
      onMarkRead={handleMarkRead}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}
