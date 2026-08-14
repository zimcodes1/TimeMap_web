import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BellRing, ShieldCheck, CheckCircle2, RefreshCw, LogOut, UserCheck } from "lucide-react";
import type { User } from "@/types";

interface SettingsViewProps {
  user: User | null;
  fcmEnabled: boolean;
  isTogglingPush: boolean;
  onTogglePush: () => void;
  onLogout: () => void;
}

export default function SettingsView({
  user,
  fcmEnabled,
  isTogglingPush,
  onTogglePush,
  onLogout,
}: SettingsViewProps) {
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8 text-center">
          <Text variant="body-sm" color="muted">
            Admin session not found. Please log in to view account settings.
          </Text>
        </Card>
      </div>
    );
  }

  const scopeLevel = user.adminLevel || "department";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Admin Profile & System Settings
          </Text>
          <Text variant="body-sm" color="muted">
            Review administrator credentials, scope privileges, Web Push notification settings, and session status.
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="h-9 px-3 text-xs text-danger border-danger-surface hover:bg-danger-surface cursor-pointer self-start sm:self-auto"
        >
          <LogOut size={14} className="mr-1.5" /> Logout Session
        </Button>
      </div>

      {/* Profile Specs & Role Scope Card */}
      <Card className="p-5 space-y-5">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <div className="w-20 h-20 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-xl shrink-0 shadow-sm">
            {user.name
              ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
              : "AD"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Text variant="h5" weight="bold" className="text-text-main truncate">
                {user.name}
              </Text>
            </div>
            <Text variant="caption" color="muted" className="block text-xs mt-0.5">
              {user.email} • Staff Identifier: <span className="font-semibold text-text-main">{user.identifier || user.staffId || "N/A"}</span>
            </Text>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="default" className="capitalize sm:py-2">
                Role: {user.role}
              </Badge>
              <Badge variant="primary" className="capitalize sm:py-2">
                Scope: {scopeLevel} Level {user.adminScopeName ? `(${user.adminScopeName})` : ""}
              </Badge>
            </div>
          </div>
        </div>

        {/* Administrative Privileges Breakdown */}
        <div className="space-y-3 text-xs">
          <div className="font-bold text-text-main flex items-center gap-1.5 text-sm">
            <ShieldCheck size={18} className="text-primary" /> Administrative Privileges Breakdown ({scopeLevel.toUpperCase()} SCOPE):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl border border-border bg-surface-raised space-y-1">
              <div className="font-bold text-primary flex items-center gap-1">
                <UserCheck size={13} /> Timetable & Venue Management
              </div>
              <p className="text-text-muted leading-relaxed">
                Full authority to create, update, and manage timetable entries, lecture sessions, exam sittings, and venue registries within your {scopeLevel} scope.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface-raised space-y-1">
              <div className="font-bold text-primary flex items-center gap-1">
                <UserCheck size={13} /> Discrepancies & Approvals
              </div>
              <p className="text-text-muted leading-relaxed">
                Review and approve/reject schedule shift requests, venue change requests, course access sharing grants, and lecture-hold dispute resolutions.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Web Push Registration Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start justify-between max-sm:flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <BellRing size={24} />
            </div>
            <div>
              <Text variant="h6" weight="bold" className="text-text-main">
                Web Push Notifications (FCM Device Token)
              </Text>
              <Text variant="body-sm" color="muted">
                Receive instant browser push notifications when discrepancy requests or access grants require your administrative approval.
              </Text>
              <div className="mt-2 max-sm:flex-col flex  items-center gap-2">
                <Badge variant={fcmEnabled ? "success" : "danger"} className="py-2">
                  {fcmEnabled ? "Push Registered & Active" : "Push Disabled"}
                </Badge>
                {fcmEnabled && (
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Web FCM Token Registered
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePush}
            disabled={isTogglingPush}
            className="cursor-pointer ml-auto"
          >
            <RefreshCw size={14} className={`mr-1 ${isTogglingPush ? "animate-spin" : ""}`} />
            {fcmEnabled ? "Disable Web Push" : "Enable Web Push"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
