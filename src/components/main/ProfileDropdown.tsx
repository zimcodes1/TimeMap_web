import React, { useState, useRef, useEffect } from "react";
import {
  User as UserIcon,
  LogOut,
  ChevronDown,
  Building2,
  Network,
  School as SchoolIcon,
  Shield,
  GraduationCap,
  Mail,
  IdCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Text } from "../ui/text";
import { Badge } from "../ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import type { User } from "@/types";

function getAccessLevelLabel(user: User | null): string {
  if (!user) return "User";
  if (user.role === "admin") {
    switch (user.adminLevel) {
      case "department":
        return "Department Admin";
      case "faculty":
        return "Faculty Admin";
      case "school":
        return "School Admin";
      case "university":
        return "University Admin";
      default:
        return "Administrator";
    }
  }
  if (user.role === "lecturer") return "Lecturer";
  if (user.role === "student") return user.isClassRep ? "Class Rep" : "Student";
  return "User";
}

interface HandlingEntity {
  typeLabel: string;
  name: string;
  Icon: React.ElementType;
}

function getHandlingEntityInfo(user: User | null): HandlingEntity | null {
  if (!user) return null;

  if (user.role === "admin") {
    switch (user.adminLevel) {
      case "department":
        return {
          typeLabel: "Department",
          name: user.adminScopeName || user.departmentName || "Assigned Department",
          Icon: Building2,
        };
      case "faculty":
        return {
          typeLabel: "Faculty",
          name: user.adminScopeName || "Assigned Faculty",
          Icon: Network,
        };
      case "school":
        return {
          typeLabel: "School",
          name: user.adminScopeName || "Assigned School",
          Icon: SchoolIcon,
        };
      case "university":
        return {
          typeLabel: "Jurisdiction",
          name: "University Wide",
          Icon: Shield,
        };
      default:
        return {
          typeLabel: "Scope",
          name: user.adminScopeName || "System Scope",
          Icon: Shield,
        };
    }
  }

  if (user.role === "lecturer") {
    return {
      typeLabel: "Department",
      name: user.departmentName || "Assigned Department",
      Icon: Building2,
    };
  }

  if (user.role === "student") {
    const levelStr = user.level ? ` (${user.level}L)` : "";
    return {
      typeLabel: "Department",
      name: (user.departmentName || "Assigned Department") + levelStr,
      Icon: GraduationCap,
    };
  }

  return null;
}

export default function ProfileDropdown() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.identifier || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const accessLevel = getAccessLevelLabel(user);
  const handlingEntity = getHandlingEntityInfo(user);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <div className="relative" ref={userMenuRef}>
      <button
        type="button"
        onClick={() => setShowUserMenu((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full border border-border bg-surface hover:bg-surface-raised transition-colors cursor-pointer"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
          {userInitials}
        </div>
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-text-main truncate max-w-[130px]">
            {displayName}
          </span>
          <span className="text-[10px] text-text-muted font-medium truncate max-w-[130px]">
            {accessLevel}
          </span>
        </div>
        <ChevronDown size={14} className="text-text-subtle shrink-0" />
      </button>

      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-4 top-18 max-w-xs mx-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:mx-0 w-auto sm:w-72 bg-surface border border-border rounded-2xl shadow-xl p-3 z-50 space-y-2.5"
          >
            {/* User Profile Header Card */}
            <div className="p-3 rounded-xl bg-surface-raised border border-border/80 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                    {userInitials}
                  </div>
                  <div>
                    <Text variant="body-sm" className="font-bold text-text-main leading-tight">
                      {displayName}
                    </Text>
                    {user?.email && (
                      <div className="flex items-center gap-1 text-[11px] text-text-subtle mt-0.5">
                        <Mail size={11} className="shrink-0" />
                        <span className="truncate max-w-[150px]">{user.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges & Identity info */}
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/60">
                <Badge variant="primary" className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                  {accessLevel}
                </Badge>
                {(user?.staffId || user?.identifier) && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-text-muted bg-surface px-2 py-0.5 rounded-md border border-border/60">
                    <IdCard size={11} className="shrink-0 text-text-subtle" />
                    <span>{user.staffId || user.identifier}</span>
                  </div>
                )}
              </div>

              {/* Handling Entity Box (Department / Faculty / School Scope) */}
              {handlingEntity && (
                <div className="mt-2 p-2.5 rounded-lg bg-surface border border-border/80 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                    <handlingEntity.Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-extrabold text-text-subtle tracking-wider">
                      {handlingEntity.typeLabel}
                    </div>
                    <div className="text-xs font-bold text-text-main truncate">
                      {handlingEntity.name}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Navigation Items */}
            <div className="space-y-1">
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:bg-surface-raised hover:text-text-main transition-colors"
              >
                <UserIcon size={16} />
                <span>Profile Settings</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-danger hover:bg-danger-surface transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
