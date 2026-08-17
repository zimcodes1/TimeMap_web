import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, ShieldOff, CheckCircle, KeyRound, X } from "lucide-react";

interface UsersBulkBarProps {
  selectedCount: number;
  onBulkDisable: () => void;
  onBulkEnable: () => void;
  onBulkReset: () => void;
  onClearSelection: () => void;
  hasBulkToggle: boolean;
  hasBulkReset: boolean;
}

export function UsersBulkBar({
  selectedCount,
  onBulkDisable,
  onBulkEnable,
  onBulkReset,
  onClearSelection,
  hasBulkToggle,
  hasBulkReset,
}: UsersBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="p-3 bg-surface-raised border border-primary/30 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2">
        <CheckSquare size={16} className="text-primary" />
        <Badge variant="primary" className="text-xs px-2.5 py-0.5">
          {selectedCount} User{selectedCount > 1 ? "s" : ""} Selected
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {hasBulkToggle && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDisable}
              className="h-8 px-2.5 text-xs text-danger border-danger/30 hover:bg-danger/10 cursor-pointer"
            >
              <ShieldOff size={13} className="mr-1" /> Bulk Disable
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkEnable}
              className="h-8 px-2.5 text-xs text-success border-success/30 hover:bg-success/10 cursor-pointer"
            >
              <CheckCircle size={13} className="mr-1" /> Bulk Enable
            </Button>
          </>
        )}

        {hasBulkReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkReset}
            className="h-8 px-2.5 text-xs text-warning border-warning/30 hover:bg-warning/10 cursor-pointer"
          >
            <KeyRound size={13} className="mr-1" /> Force Password Reset
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          className="h-8 px-2 text-xs border-border text-text-muted hover:text-text-main cursor-pointer"
          title="Deselect all users"
        >
          <X size={14} className="mr-1" /> Clear
        </Button>
      </div>
    </div>
  );
}
