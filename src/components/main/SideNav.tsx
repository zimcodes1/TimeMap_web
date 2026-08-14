import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/elements/logo";
import { Text } from "@/components/ui/text";
import { NAV_GROUPS } from "@/constants/data";
import { useAuth } from "@/hooks/useAuth";

interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
}

export default function SideNav({ collapsed, onToggle, onCloseMobile }: SideNavProps) {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  const displayName = user?.name || user?.identifier || "Admin User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-primary text-white transition-all duration-300 shrink-0 select-none shadow-md",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Logo color="#ffffff" size={22} />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <Text variant="h6" className="font-bold text-white leading-tight truncate">
                NSUK TimeMap
              </Text>
              <Text variant="caption" className="text-[10px] text-white/70 truncate">
                Timetable & Venue Portal
              </Text>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Links Container */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-white/20">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <Text
                variant="overline"
                className="px-3 text-[10px] tracking-wider text-white/60 font-semibold uppercase block mb-1.5"
              >
                {group.title}
              </Text>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.to);
                const hasChildren = item.children && item.children.length > 0;
                const isGroupOpen = !!openGroups[item.label];

                if (hasChildren) {
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => collapsed && setHoveredItem(item.label)}
                      onMouseLeave={() => collapsed && setHoveredItem(null)}
                    >
                      {collapsed ? (
                        /* Collapsed Mode Popover Trigger */
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleGroup(item.label)}
                            className={cn(
                              "w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                              active
                                ? "bg-white/30 text-primary shadow-sm font-bold"
                                : "text-white/80 hover:bg-white/15 hover:text-white"
                            )}
                          >
                            <span className="shrink-0">{item.icon}</span>
                          </button>

                          {/* Hover Popover in Collapsed Mode */}
                          {hoveredItem === item.label && (
                            <div className="absolute left-full top-0 ml-2 z-50 w-48 bg-surface border border-border rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-text-main">
                              <Text variant="caption" className="px-2 py-1 font-bold text-text-main block border-b border-border">
                                {item.label}
                              </Text>
                              {item.children?.map((child) => (
                                <Link
                                  key={child.to}
                                  to={child.to}
                                  onClick={onCloseMobile}
                                  className={cn(
                                    "block px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                                    isActive(child.to)
                                      ? "bg-primary-muted text-primary font-semibold"
                                      : "text-text-muted hover:bg-surface-raised hover:text-text-main"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Expanded Accordion Mode */
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleGroup(item.label)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                              active
                                ? "bg-white/20 text-white font-semibold border border-white/25"
                                : "text-white/80 hover:bg-white/15 hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="shrink-0">{item.icon}</span>
                              <span>{item.label}</span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={cn(
                                "transition-transform duration-200 text-white/70",
                                isGroupOpen && "rotate-180 text-white"
                              )}
                            />
                          </button>

                          {isGroupOpen && (
                            <div className="pl-9 pr-1 py-1 space-y-1 mt-1 border-l-2 border-white/20 ml-4">
                              {item.children?.map((child) => (
                                <Link
                                  key={child.to}
                                  to={child.to}
                                  onClick={onCloseMobile}
                                  className={cn(
                                    "block px-3 py-1.5 rounded-lg text-xs transition-colors",
                                    isActive(child.to)
                                      ? "bg-white text-primary font-bold shadow-xs"
                                      : "text-white/85 hover:bg-white/15 hover:text-white"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                /* Standard Item (No Sub-children) */
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => collapsed && setHoveredItem(item.label)}
                    onMouseLeave={() => collapsed && setHoveredItem(null)}
                  >
                    <Link
                      to={item.to}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-3 rounded-lg transition-all duration-200 text-sm font-medium",
                        collapsed ? "justify-center p-2.5" : "px-3 py-3 hover:pl-5",
                        active
                          ? "bg-white/20 text-white font-bold border-r-5 rounded-r-xs"
                          : "text-white/80 hover:bg-white/15 hover:text-white"
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>

                    {/* Tooltip hint in collapsed mode */}
                    {collapsed && hoveredItem === item.label && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-surface text-text-main border border-border rounded-md text-xs font-semibold whitespace-nowrap shadow-md pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Info + Collapse Footer */}
      <div className="p-3 border-t border-white/15 bg-black/10 shrink-0 space-y-2">
        {/* User Card */}
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-white/10 backdrop-blur-xs transition-colors hover:bg-white/20 text-white",
            collapsed && "justify-center p-1.5"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-white text-primary font-extrabold flex items-center justify-center text-xs shrink-0">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <Text variant="caption" className="font-bold text-white truncate block">
                {displayName}
              </Text>
              <Text variant="caption" className="text-white/70 truncate block text-[11px]">
                {user?.email || user?.identifier}
              </Text>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-md transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all text-xs font-semibold cursor-pointer"
        >
          {!collapsed && <span>Collapse Menu</span>}
          <div className={cn("p-1 rounded-md", collapsed && "mx-auto")}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </div>
        </button>
      </div>
    </aside>
  );
}
