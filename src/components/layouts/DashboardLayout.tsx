import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import Topbar from "../main/Topbar";
import SideNav from "../main/SideNav";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

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
