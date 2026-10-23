import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
	Calendar,
	Clock,
	MapPin,
	Users,
	GraduationCap,
	Building2,
	Info,
	CheckCircle2,
} from "lucide-react";
import type { OptimizedExamEvent } from "@/api/main/examOptimizerAPI";
import { formatTime5 } from "@/utils/examTimeframeGrouping";

interface ExamEventDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	event: OptimizedExamEvent | null;
}

export function ExamEventDetailModal({
	isOpen,
	onClose,
	event,
}: ExamEventDetailModalProps) {
	if (!event) return null;

	const examTypeBadgeVariant =
		event.exam_type === "cbt"
			? "success"
			: event.exam_type === "lab_practical"
				? "warning"
				: "info";

	const examTypeLabel =
		event.exam_type === "cbt"
			? "CBT Examination"
			: event.exam_type === "lab_practical"
				? "Lab Practical"
				: "Written Examination";

	const dateObj = new Date(`${event.date}T12:00:00`);
	const formattedDate = dateObj.toLocaleDateString(undefined, {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const durationHours = (event.duration_minutes / 60)
		.toFixed(1)
		.replace(/\.0$/, "");

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="lg"
			title={
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-xl font-bold font-mono text-primary">
						{event.course_code}
					</span>
					<span className="text-base font-semibold text-text-main line-clamp-1">
						{event.course_title}
					</span>
				</div>
			}
			description={
				<div className="flex items-center gap-2 mt-1 flex-wrap">
					<Badge variant="secondary" className="font-bold text-xs">
						{event.course_level} Level
					</Badge>
					<Badge variant={examTypeBadgeVariant} className="text-xs">
						{examTypeLabel}
					</Badge>
					{event.joined_courses && event.joined_courses.length > 0 && (
						<Badge
							variant="outline"
							className="text-xs border-primary/40 text-primary"
						>
							Joined Session: {event.joined_courses.join(", ")}
						</Badge>
					)}
				</div>
			}
			footer={
				<Button variant="outline" size="sm" onClick={onClose} className="px-5">
					Close
				</Button>
			}
		>
			<div className="space-y-5 py-1">
				{/* Schedule & Timing Card */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-raised border border-border">
					<div className="flex items-start gap-2.5">
						<Calendar size={16} className="text-primary mt-0.5 shrink-0" />
						<div>
							<Text variant="caption" color="muted" weight="medium">
								Examination Date
							</Text>
							<Text
								variant="body-sm"
								weight="semibold"
								className="text-text-main"
							>
								{formattedDate}
							</Text>
						</div>
					</div>

					<div className="flex items-start gap-2.5">
						<Clock size={16} className="text-primary mt-0.5 shrink-0" />
						<div>
							<Text variant="caption" color="muted" weight="medium">
								Time Window & Duration
							</Text>
							<Text
								variant="body-sm"
								weight="semibold"
								className="text-text-main"
							>
								{formatTime5(event.start_time)} – {formatTime5(event.end_time)}{" "}
								({event.duration_minutes} mins / {durationHours}h)
							</Text>
						</div>
					</div>
				</div>

				{/* Scope & Academic Metadata */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-raised border border-border">
					<div className="flex items-start gap-2.5">
						<GraduationCap
							size={16}
							className="text-text-muted mt-0.5 shrink-0"
						/>
						<div>
							<Text variant="caption" color="muted" weight="medium">
								Target Program
							</Text>
							<Text
								variant="body-sm"
								weight="semibold"
								className="text-text-main"
							>
								{event.program_name || "General / Multi-Program"}
							</Text>
						</div>
					</div>

					<div className="flex items-start gap-2.5">
						<Building2 size={16} className="text-text-muted mt-0.5 shrink-0" />
						<div>
							<Text variant="caption" color="muted" weight="medium">
								Department
							</Text>
							<Text
								variant="body-sm"
								weight="semibold"
								className="text-text-main"
							>
								{event.department_name || "School-wide / General"}
							</Text>
						</div>
					</div>
				</div>

				{/* Total Candidates */}
				<div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
					<div className="flex items-center gap-2">
						<Users size={18} className="text-primary" />
						<span className="text-sm font-semibold text-text-main">
							Total Registered Candidates:
						</span>
					</div>
					<Badge variant="primary" className="text-sm px-3 py-0.5 font-bold">
						{event.student_count} Candidates
					</Badge>
				</div>

				{/* Physical Venue Allocations */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
							<MapPin size={14} className="text-primary" />
							<span>Physical Room Allocations ({event.venues.length}):</span>
						</div>
						<span className="text-[11px] text-text-muted">
							{event.venues.length > 1
								? "Distributed Multi-Room Plan"
								: "Single Venue Allocation"}
						</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
						{event.venues.map((v) => (
							<div
								key={v.venue_id}
								className="p-3 rounded-xl bg-surface border border-border flex flex-col justify-between"
							>
								<div className="flex flex-col items-center justify-between mb-1.5">
									<span className="font-bold text-xs text-text-main flex items-center gap-1">
										<CheckCircle2
											size={12}
											className="text-emerald-500 shrink-0"
										/>
										<span className="truncate">{v.venue_name}</span>
									</span>
									<Badge
										variant="secondary"
										className="text-[10px] px-1.5 py-0 font-mono"
									>
										{v.students} Seats
									</Badge>
								</div>
								<div className="flex items-center justify-between text-[11px] text-text-muted pt-1 border-t border-border/50">
									<span>Turns: {v.turns || 1}</span>
									{event.exam_type === "cbt" && v.turns > 1 && (
										<span className="text-primary font-medium text-[10px]">
											Sequential Batches
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Optimizer Rationale */}
				{event.explanation && (
					<div className="p-3 rounded-xl bg-surface-raised border border-border/70 text-xs text-text-muted flex items-start gap-2">
						<Info size={14} className="text-primary mt-0.5 shrink-0" />
						<div>
							<span className="font-semibold text-text-main">
								Optimizer Rationale:{" "}
							</span>
							<span>{event.explanation}</span>
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
}
