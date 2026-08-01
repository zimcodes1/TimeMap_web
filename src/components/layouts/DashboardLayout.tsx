import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Outlet } from "@tanstack/react-router";
import Preloader from "../preloader";
import Topbar from "../ui/Topbar";
import SideNav from "../ui/SideNav";

export default function DashboardLayout() {
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <Preloader key="preloader" onComplete={() => setLoading(false)} />
      ) : (
        <div className="flex h-screen overflow-hidden bg-[color:var(--sidebar)] text-foreground">
          {/* Sidebar — hidden on mobile, visible md+ */}
          <div className="hidden h-screen shrink-0 md:flex">
            <SideNav
              collapsed={collapsed}
              onToggle={() => setCollapsed((c) => !c)}
            />
          </div>

          {/* Main */}
          <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
            <div className="sticky top-0 z-20 shrink-0">
              <Topbar />
            </div>

            <main className="flex-1 overflow-y-auto sm:p-6">
              <div className="min-h-full sm:rounded-[1.5rem] sm:border border-border/70 bg-background/95 sm:p-6 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.28)]">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
