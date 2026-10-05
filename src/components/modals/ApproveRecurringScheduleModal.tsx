import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CheckCircle2, Calendar, Clock, MapPin, BookOpen } from "lucide-react";

export interface RecurringScheduleApprovalInfo {
	discrepancyId?: string;
	courseCode?: string;
	courseTitle?: string;
	venueName?: string;
	venueCapacity?: number;
	dayOfWeek?: string;
	startTime?: string;
	endTime?: string;
	semesterName?: string;
	lectureStartDate?: string;
	lectureEndDate?: string;
}

interface ApproveRecurringScheduleModalProps {
	isOpen: boolean;
	onClose: () => void;
	onApprove: () => void;
	info?: RecurringScheduleApprovalInfo | null;
	isPending?: boolean;
}

export function ApproveRecurringScheduleModal({
	isOpen,
	onClose,
	onApprove,
	info,
	isPending = false,
}: ApproveRecurringScheduleModalProps) {
	if (!info) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Approve Recurring Schedule"
			size="md"
			footer={
				<div className="flex items-center justify-end gap-2.5 w-full">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={isPending}
						className="cursor-pointer text-xs"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={onApprove}
						disabled={isPending}
						className="cursor-pointer gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
					>
						{isPending ? (
							<div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							<CheckCircle2 size={14} />
						)}
						<span>Approve Schedule</span>
					</Button>
				</div>
			}
		>
			<div className="space-y-4 py-1">
				{/* Success icon & prompt */}
				<div className="flex flex-col items-center text-center space-y-2">
					<div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
						<CheckCircle2 size={32} className="text-emerald-400" />
					</div>
					<div>
						<Text variant="body" weight="bold" className="text-text-main">
							Schedule Created Successfully
						</Text>
						<Text variant="caption" color="muted" className="mt-1 block max-w-sm">
							This recurring schedule is staged as a timetable modification. Would you like to approve and apply it immediately to all lecture sessions across the semester?
						</Text>
					</div>
				</div>

				{/* Summary Card */}
				<div className="p-3.5 rounded-xl border border-border bg-surface-raised space-y-2.5 text-xs">
					{info.courseCode && (
						<div className="flex items-start gap-2">
							<BookOpen size={14} className="text-primary mt-0.5 shrink-0" />
							<div>
								<span className="font-bold text-text-main">
									{info.courseCode}
								</span>
								{info.courseTitle && (
									<span className="text-text-muted ml-1.5">
										{info.courseTitle}
									</span>
								)}
							</div>
						</div>
					)}

					<div className="flex items-center gap-2">
						<Clock size={14} className="text-primary shrink-0" />
						<span className="text-text-main font-medium">
							Every {info.dayOfWeek || "Weekly"} ·{" "}
							{info.startTime?.slice(0, 5)} - {info.endTime?.slice(0, 5)}
						</span>
					</div>

					{info.venueName && (
						<div className="flex items-center gap-2">
							<MapPin size={14} className="text-primary shrink-0" />
							<span className="text-text-main">
								{info.venueName}
								{info.venueCapacity ? (
									<span className="text-text-muted ml-1">
										(Capacity: {info.venueCapacity})
									</span>
								) : null}
							</span>
						</div>
					)}

					{(info.lectureStartDate || info.lectureEndDate || info.semesterName) && (
						<div className="flex items-center gap-2 pt-1 border-t border-border/60 text-[11px] text-text-muted">
							<Calendar size={13} className="text-text-subtle shrink-0" />
							<span>
								{info.semesterName ? `${info.semesterName} · ` : ""}
								Teaching Period: {info.lectureStartDate || "Start"} to {info.lectureEndDate || "End"}
							</span>
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
}
