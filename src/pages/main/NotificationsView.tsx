import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TabSwitcher } from "@/components/ui/tabs";
import { Bell, CheckCheck, Inbox, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { NotificationItem } from "@/types";

interface NotificationsViewProps {
  notifications: NotificationItem[];
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsView({
  notifications,
  isLoading = false,
  isRefetching = false,
  onRefresh,
  onMarkRead,
  onMarkAllRead,
}: NotificationsViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const handleActionClick = (notif: NotificationItem) => {
    if (!notif.isRead) {
      onMarkRead(notif.id);
    }
    if (
      notif.relatedModel === "DiscrepancyRequest" ||
      notif.notificationType?.toLowerCase().includes("discrepancy")
    ) {
      navigate({ to: "/requests" });
    } else if (
      notif.relatedModel === "LectureSession" ||
      notif.relatedModel === "TimetableEntry" ||
      notif.notificationType?.toLowerCase().includes("session")
    ) {
      navigate({ to: "/schedules" });
    } else if (notif.relatedModel === "Course") {
      navigate({ to: "/courses" });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Text variant="h3" weight="bold" className="text-text-main">
              Notifications Inbox
            </Text>
            {unreadCount > 0 && <Badge variant="warning">{unreadCount} Unread</Badge>}
          </div>
          <Text variant="body-sm" color="muted">
            Real-time administrative schedule updates, approval alerts, and system flags.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefetching}
              title="Refresh Notifications Inbox"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw size={13} className={isRefetching ? "animate-spin text-primary" : ""} />
              <span>{isRefetching ? "Refreshing..." : "Refresh"}</span>
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="primary" size="sm" onClick={onMarkAllRead} className="cursor-pointer">
              <CheckCheck size={16} className="mr-1" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={[
          { id: "all", label: "All Notifications", icon: Bell, count: notifications.length },
          { id: "unread", label: "Unread Only", icon: Inbox, count: unreadCount },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as typeof activeTab)}
      />

      {/* Notifications List Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isDiscrepancy =
              notif.relatedModel === "DiscrepancyRequest" ||
              notif.notificationType?.toLowerCase().includes("discrepancy");
            const isSession =
              notif.relatedModel === "LectureSession" ||
              notif.relatedModel === "TimetableEntry" ||
              notif.notificationType?.toLowerCase().includes("session");

            return (
              <Card
                key={notif.id}
                onClick={() => handleActionClick(notif)}
                className={`p-4 transition-all cursor-pointer hover:border-primary/50 ${
                  !notif.isRead
                    ? "border-l-4 border-l-primary bg-primary-muted/20"
                    : "bg-surface opacity-85"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Bell size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Text variant="caption" className="font-bold text-text-main">
                          {notif.title}
                        </Text>
                        <Badge variant="default" className="text-[10px] capitalize">
                          {notif.notificationType.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-main mt-1 break-words">{notif.body}</p>
                      <Text variant="caption" color="muted" className="text-[11px] mt-2 block">
                        {new Date(notif.createdAt).toLocaleString()}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isDiscrepancy ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(notif);
                        }}
                        className="cursor-pointer text-xs gap-1"
                      >
                        Review Request
                        <ArrowRight size={13} />
                      </Button>
                    ) : isSession ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(notif);
                        }}
                        className="cursor-pointer text-xs gap-1"
                      >
                        View Timetable
                        <ArrowRight size={13} />
                      </Button>
                    ) : null}

                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notif.id);
                        }}
                        className="cursor-pointer text-xs"
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center space-y-3">
          <AlertCircle size={36} className="mx-auto text-text-muted opacity-40" />
          <Text variant="h6" weight="bold" className="text-center">
            No Notifications Found
          </Text>
          <Text variant="body-sm" color="muted" className="text-center">
            {activeTab === "unread"
              ? "All caught up! You have no unread notifications."
              : "No notifications recorded in your inbox yet."}
          </Text>
        </Card>
      )}
    </div>
  );
}
