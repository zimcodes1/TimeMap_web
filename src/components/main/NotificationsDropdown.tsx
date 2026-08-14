import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  FileText,
  Info,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Text } from "../ui/text";
import {
  getNotificationsList,
  getUnreadNotificationsCount,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
} from "@/api/main/notificationsAPI";
import type { NotificationItem } from "@/types";
import { toast } from "sonner";

export default function NotificationsDropdown() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch unread count with 10s polling interval
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationsCount,
    refetchInterval: 10000, // 10s polling for live notifications
  });

  // Fetch notifications list with 10s polling interval
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: getNotificationsList,
    refetchInterval: 10000, // 10s polling for live notifications
  });

  // Mark single notification read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationReadAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all notifications read
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadAPI,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(res.message || "All notifications marked as read.");
    },
  });

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={notifRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications((prev) => !prev)}
        className="relative rounded-full h-9 w-9 p-0 border-border text-text-muted hover:text-text-main bg-surface cursor-pointer"
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-4 top-18 max-w-sm mx-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:mx-0 w-auto sm:w-88 bg-surface border border-border rounded-2xl shadow-xl p-3 z-50"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-border px-1">
              <div className="flex items-center gap-2">
                <Text variant="h6" className="font-bold text-text-main">
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <Badge variant="primary" className="text-[10px] bg-primary-muted text-primary">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    className="p-1.5 rounded-md text-text-subtle hover:text-primary transition-colors cursor-pointer"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 max-h-72 overflow-y-auto space-y-1 scrollbar-thin">
              {notifications.length > 0 ? (
                notifications.map((item: NotificationItem) => (
                  <div
                    key={item.id}
                    onClick={() => !item.isRead && handleMarkRead(item.id)}
                    className={`p-2.5 rounded-xl transition-colors border cursor-pointer ${
                      !item.isRead
                        ? "bg-primary-muted/30 border-primary/20"
                        : "bg-surface hover:bg-surface-raised border-transparent opacity-80"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-surface border border-border text-primary shrink-0 mt-0.5">
                        {item.notificationType?.includes("conflict") ? (
                          <AlertTriangle size={14} className="text-warning" />
                        ) : item.notificationType?.includes("discrepancy") ? (
                          <FileText size={14} className="text-info" />
                        ) : (
                          <Info size={14} className="text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Text variant="body-sm" className="font-bold text-text-main truncate">
                            {item.title}
                          </Text>
                          <Text variant="caption" className="text-[10px] text-text-subtle">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </div>
                        <Text variant="caption" className="text-text-muted text-xs block mt-0.5 line-clamp-2">
                          {item.body}
                        </Text>
                      </div>
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(item.id);
                          }}
                          title="Mark as read"
                          className="p-1 text-text-subtle hover:text-primary cursor-pointer shrink-0"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <Text variant="caption" className="text-text-subtle">
                    No notifications available
                  </Text>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
