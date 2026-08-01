import { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  FileText,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Text } from "../ui/text";
import {
  dummyNotifications as initialNotifications,
  type NotificationItem,
} from "@/constants/dummy";

export default function NotificationsDropdown() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
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
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs">
            {unreadCount}
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
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    className="p-1 rounded-md text-text-subtle hover:text-primary transition-colors cursor-pointer"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    title="Clear all"
                    className="p-1 rounded-md text-text-subtle hover:text-danger transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 max-h-72 overflow-y-auto space-y-1 scrollbar-thin">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl transition-colors border ${
                      item.unread
                        ? "bg-primary-muted/30 border-primary/20"
                        : "bg-surface hover:bg-surface-raised border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-surface border border-border text-primary shrink-0 mt-0.5">
                        {item.type === "conflict" ? (
                          <AlertTriangle size={14} className="text-warning" />
                        ) : item.type === "request" ? (
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
                            {item.time}
                          </Text>
                        </div>
                        <Text variant="caption" className="text-text-muted text-xs block mt-0.5 line-clamp-2">
                          {item.message}
                        </Text>
                      </div>
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
