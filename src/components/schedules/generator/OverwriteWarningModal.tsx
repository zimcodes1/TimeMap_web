import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
	AlertTriangle,
	Sparkles,
	Calendar,
	Building2,
	Loader2,
} from "lucide-react";

interface OverwriteWarningModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	semesterName?: string;
	scopeLabel?: string;
	isGenerating?: boolean;
}

export function OverwriteWarningModal({
	isOpen,
	onClose,
	onConfirm,
	semesterName,
	scopeLabel,
	isGenerating = false,
}: OverwriteWarningModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md"
			title={
				<div className="flex items-center gap-2.5">
					<div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
						<AlertTriangle size={20} />
					</div>
					<div>
						<h3 className="text-base font-bold text-text-main leading-tight">
							Active Published Timetable Detected
						</h3>
						<p className="text-xs text-text-muted">
							Overwrite Caution • Schedule Generation
						</p>
					</div>
				</div>
			}
		>
			<div className="space-y-4 pt-1">
				{/* Warning Callout */}
				<div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs space-y-1.5">
					<div className="flex items-center gap-2 font-semibold text-amber-400">
						<AlertTriangle size={15} className="shrink-0" />
						<span>Live Timetable Currently Active</span>
					</div>
					<p className="text-[11px] text-text-muted leading-relaxed">
						An active, published timetable already exists for this semester and
						scope. Generating a new draft schedule will not immediately alter
						live classes, but if you later publish the new solution, it will{" "}
						<strong className="text-amber-300">
							completely overwrite and replace the active live schedule
						</strong>
						.
					</p>
				</div>

				{/* Scope & Semester Summary */}
				<div className="grid grid-cols-2 gap-2 text-xs">
					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center gap-1.5 text-text-muted text-[11px]">
							<Calendar size={13} className="text-primary" />
							<span>Semester</span>
						</div>
						<div className="font-semibold text-text-main truncate">
							{semesterName || "Selected Semester"}
						</div>
					</div>

					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center gap-1.5 text-text-muted text-[11px]">
							<Building2 size={13} className="text-primary" />
							<span>Administrative Scope</span>
						</div>
						<div className="font-semibold text-text-main truncate">
							{scopeLabel || "Selected Scope"}
						</div>
					</div>
				</div>

				<div className="p-3 rounded-xl bg-surface-raised/50 border border-border text-[11px] text-text-muted leading-relaxed">
					Tip: You will still be able to inspect the generated weekly grid and
					conflict breakdown before deciding whether to publish it.
				</div>

				{/* Actions */}
				<div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={isGenerating}
						className="cursor-pointer text-xs h-9 px-4"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={onConfirm}
						disabled={isGenerating}
						className="cursor-pointer text-xs h-9 px-4 font-semibold gap-1.5 shadow-sm bg-amber-500 hover:bg-amber-600 text-black border-amber-500"
					>
						{isGenerating ? (
							<>
								<Loader2 size={13} className="animate-spin" />
								<span>Starting Optimizer...</span>
							</>
						) : (
							<>
								<Sparkles size={14} />
								<span>Proceed to Generate</span>
							</>
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
