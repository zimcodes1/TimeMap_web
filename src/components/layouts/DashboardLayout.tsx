import { useState } from "react";
import { Outlet, Navigate } from "@tanstack/react-router";
import Topbar from "../main/Topbar";
import SideNav from "../main/SideNav";
import { useAuth } from "@/hooks/useAuth";
import Logo from "../elements/logo";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated, isLoading, requiresPasswordReset } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse">
            <Logo color="#10b981" size={40} />
          </div>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  if (requiresPasswordReset) {
    return <Navigate to="/reset-password" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text-main">
      {/* Desktop Sidebar (hidden on mobile, visible md+) */}
      <div className="hidden h-screen shrink-0 md:flex">
        <SideNav
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main Content Workspace */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <div className="sticky top-0 z-20 shrink-0">
          <Topbar />
        </div>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-1 sm:p-4 sm:pt-0">
          <div className="min-h-full rounded-2xl md:rounded-3xl border border-border bg-surface p-4 md:p-6 shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
