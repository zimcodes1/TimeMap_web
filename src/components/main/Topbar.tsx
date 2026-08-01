import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SideNav from "./SideNav";
import SearchModal from "./Search";
import NotificationsDropdown from "./NotificationsDropdown";
import ProfileDropdown from "./ProfileDropdown";

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export default function Topbar({ }: TopbarProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="flex items-center justify-between h-15 px-4 md:px-6 shrink-0 select-none">
      {/* Left Area: Mobile Hamburger Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden text-text-muted hover:text-text-main p-2 rounded-lg hover:bg-surface-raised transition-colors cursor-pointer"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open mobile menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right Area: Search, Notifications, Profile Dropdowns */}
      <div className="flex items-center gap-2">
        <SearchModal />
        <NotificationsDropdown />
        <ProfileDropdown />
      </div>

      {/* Mobile Drawer Navigation Overlay with Framer Motion */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative flex w-64 max-w-[80vw] flex-col bg-surface shadow-2xl z-50 h-full"
            >
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-lg z-10 cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SideNav
                collapsed={false}
                onToggle={() => setMobileNavOpen(false)}
                onCloseMobile={() => setMobileNavOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
