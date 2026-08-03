import { Search as SearchIcon, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dummySearchItems } from "@/constants/dummy";
import { Text } from "../ui/text";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function SearchModal() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredSearch = dummySearchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSearch((prev) => !prev)}
        className="rounded-full h-9 w-9 p-0 border-border text-text-muted hover:text-text-main bg-surface cursor-pointer"
        aria-label="Search"
      >
        <SearchIcon size={16} />
      </Button>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-4 top-18 max-w-md mx-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:mx-0 w-auto sm:w-96 bg-surface border border-border rounded-2xl shadow-xl p-3 z-50"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-raised rounded-xl border border-border">
              <SearchIcon size={16} className="text-text-subtle shrink-0" />
              <input
                type="text"
                placeholder="Search venues, courses, requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-sm text-text-main placeholder:text-text-subtle focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-text-subtle hover:text-text-main p-0.5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item) => (
                  <a
                    key={item.id}
                    href={item.to}
                    onClick={() => setShowSearch(false)}
                    className="flex flex-col p-2.5 rounded-xl hover:bg-primary-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="body-sm" className="font-bold text-text-main">
                        {item.title}
                      </Text>
                      <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">
                        {item.category}
                      </Badge>
                    </div>
                    <Text variant="caption" className="text-text-subtle text-[11px] mt-0.5">
                      {item.subtitle}
                    </Text>
                  </a>
                ))
              ) : (
                <div className="p-4 text-center">
                  <Text variant="caption" className="text-text-subtle">
                    No results found for "{searchQuery}"
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