import { useState, useRef, useEffect } from "react";
import { User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Text } from "../ui/text";
import { Badge } from "../ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

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

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <div className="relative" ref={userMenuRef}>
      <button
        type="button"
        onClick={() => setShowUserMenu((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-full border border-border bg-surface hover:bg-surface-raised transition-colors cursor-pointer"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs">
          {userInitials}
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-text-main truncate max-w-[120px]">
          {displayName}
        </span>
        <ChevronDown size={14} className="text-text-subtle" />
      </button>

      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-4 top-18 max-w-xs mx-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:mx-0 w-auto sm:w-64 bg-surface border border-border rounded-2xl shadow-xl p-3 z-50 space-y-2"
          >
            <div className="p-2.5 rounded-xl bg-surface-raised border border-border">
              <Text variant="body-sm" className="font-bold text-text-main">
                {displayName}
              </Text>
              {user?.email && (
                <Text variant="caption" className="text-text-subtle text-xs block mt-0.5">
                  {user.email}
                </Text>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="primary" className="text-[10px] uppercase font-bold bg-primary-muted text-primary">
                  {user?.role || "user"}
                </Badge>
                <Text variant="caption" className="text-[10px] text-text-subtle">
                  {user?.staffId || user?.identifier}
                </Text>
              </div>
            </div>

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
