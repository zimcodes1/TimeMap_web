import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	CheckCircle2,
	AlertTriangle,
	Users,
	UserCheck,
	Building2,
	Calendar,
	Clock,
	Maximize2,
} from "lucide-react";
import type { TimetableGenerationRun } from "@/types";

interface ConflictDiagnosticsPanelProps {
	run: TimetableGenerationRun;
}

interface StudentConflictItem {
	student_group?: string;
	slot?: string;
	course_a?: string;
	occurrence_a?: number;
	course_b?: string;
	occurrence_b?: number;
}

interface LecturerConflictItem {
	lecturer_name?: string;
	lecturer_id?: number | string;
	slot?: string;
	course_a?: string;
	course_b?: string;
}

interface VenueConflictItem {
	venue_name?: string;
	venue_id?: number | string;
	slot?: string;
	course_a?: string;
	course_b?: string;
}

interface DailyLimitConflictItem {
	day?: string;
	student_group?: string;
	scheduled_count?: number;
	max_allowed?: number;
	courses?: string[];
}

interface OccurrenceDayConflictItem {
	course_code?: string;
	day?: string;
	occurrence_a?: number;
	occurrence_b?: number;
}

interface CapacityViolationItem {
	course?: string;
	course_code?: string;
	overflow?: number;
	deficit?: number;
	venue_name?: string;
	venue_capacity?: number;
	capacity?: number;
	expected_students?: number;
	slot?: string;
}

export function ConflictDiagnosticsPanel({
	run,
}: ConflictDiagnosticsPanelProps) {
	const [activeTab, setActiveTab] = useState<
		"all" | "student" | "lecturer" | "venue" | "daily" | "repeat" | "capacity"
	>("all");

	const cr = run.conflictReport || {};
	const details = cr.details || {};

	const studentConflicts =
		((details.student_conflicts || cr.student_conflicts || []) as StudentConflictItem[]);
	const lecturerConflicts =
		((details.lecturer_conflicts || cr.lecturer_conflicts || []) as LecturerConflictItem[]);
	const venueConflicts =
		((details.venue_conflicts || cr.venue_conflicts || []) as VenueConflictItem[]);
	const dailyLimitViolations =
		((details.daily_limit_violations || cr.daily_limit_violations || []) as DailyLimitConflictItem[]);
	const occurrenceDayViolations =
		((details.occurrence_day_violations || cr.occurrence_day_violations || []) as OccurrenceDayConflictItem[]);
	const capacityViolations =
		((details.capacity_overflows ||
		details.capacity_violations ||
		cr.capacity_violations ||
		cr.capacity_overflows ||
		[]) as CapacityViolationItem[]);

	const totalHardConflicts = run.hardConflictsCount;
	const totalCapacityViolations = capacityViolations.length;

	if (totalHardConflicts === 0 && totalCapacityViolations === 0) {
		return (
			<div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-center">
				<div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
					<CheckCircle2 size={24} />
				</div>
				<h4 className="font-bold text-sm text-text-main">
					Zero Hard Conflicts & Optimal Room Allocations
				</h4>
				<p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
					All 6 hard and soft constraint sets were strictly satisfied: zero
					student group overlaps, zero lecturer double-bookings, zero venue
					collisions, distinct lecture days, and zero room capacity overflows.
				</p>
			</div>
		);
	}

	return (
		<div className="border border-border rounded-2xl bg-surface overflow-hidden space-y-4 p-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
				<div>
					<h4 className="font-bold text-sm text-text-main flex items-center gap-2">
						<AlertTriangle
							size={16}
							className={
								totalHardConflicts > 0 ? "text-amber-400" : "text-emerald-400"
							}
						/>
						<span>Constraint Diagnostics Breakdown</span>
					</h4>
					<p className="text-xs text-text-muted">
						{totalHardConflicts === 0
							? "Zero hard conflicts. Minor soft room capacity adjustments detected below."
							: `${totalHardConflicts} hard constraint collision${totalHardConflicts > 1 ? "s" : ""} require attention.`}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Badge variant={totalHardConflicts === 0 ? "success" : "warning"}>
						{totalHardConflicts} Hard Conflicts
					</Badge>
					{totalCapacityViolations > 0 && (
						<Badge variant="outline">
							{totalCapacityViolations} Room Deficits
						</Badge>
					)}
				</div>
			</div>

			{/* Filter Tabs */}
			<div className="flex flex-wrap gap-1.5 p-1 bg-surface-raised rounded-xl border border-border text-xs">
				<button
					type="button"
					onClick={() => setActiveTab("all")}
					className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
						activeTab === "all"
							? "bg-primary text-primary-foreground shadow-xs"
							: "text-text-muted hover:text-text-main"
					}`}
				>
					All ({totalHardConflicts + totalCapacityViolations})
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("student")}
					className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
						activeTab === "student"
							? "bg-primary text-primary-foreground shadow-xs"
							: "text-text-muted hover:text-text-main"
					}`}
				>
					<Users size={12} />
					<span>Students ({studentConflicts.length})</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("lecturer")}
					className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
						activeTab === "lecturer"
							? "bg-primary text-primary-foreground shadow-xs"
							: "text-text-muted hover:text-text-main"
					}`}
				>
					<UserCheck size={12} />
					<span>Lecturers ({lecturerConflicts.length})</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("venue")}
					className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
						activeTab === "venue"
							? "bg-primary text-primary-foreground shadow-xs"
							: "text-text-muted hover:text-text-main"
					}`}
				>
					<Building2 size={12} />
					<span>Venues ({venueConflicts.length})</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("daily")}
					className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
						activeTab === "daily"
							? "bg-primary text-primary-foreground shadow-xs"
							: "text-text-muted hover:text-text-main"
					}`}
				>
					<Clock size={12} />
					<span>Daily Limit ({dailyLimitViolations.length})</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("repeat")}
					className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
						activeTab === "repeat"
							? "bg-primary text-primary-foreground shadow-xs"
							: "text-text-muted hover:text-text-main"
					}`}
				>
					<Calendar size={12} />
					<span>Repeats ({occurrenceDayViolations.length})</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("capacity")}
					className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
						activeTab === "capacity"
							? "bg-primary text-primary-foreground shadow-xs"
							: "text-text-muted hover:text-text-main"
					}`}
				>
					<Maximize2 size={12} />
					<span>Capacity ({totalCapacityViolations})</span>
				</button>
			</div>

			{/* Violation Cards Container */}
			<div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
				{/* 1. Student Conflicts */}
				{(activeTab === "all" || activeTab === "student") &&
					studentConflicts.map((c, idx) => (
						<div
							key={`stu-${idx}`}
							className="p-3 rounded-xl bg-danger-surface/40 border border-danger/20 text-xs space-y-1.5"
						>
							<div className="flex items-center justify-between text-danger font-semibold">
								<span className="flex items-center gap-1.5">
									<Users size={14} />
									<span>
										Student Cohort Clash: {c.student_group || "Group"}
									</span>
								</span>
								<span className="font-mono text-[11px]">
									{c.slot || "Slot"}
								</span>
							</div>
							<p className="text-[11px] text-text-muted">
								Colliding courses scheduled simultaneously:{" "}
								<strong className="text-text-main">
									{c.course_a} ({c.occurrence_a})
								</strong>{" "}
								and{" "}
								<strong className="text-text-main">
									{c.course_b} ({c.occurrence_b})
								</strong>
							</p>
						</div>
					))}

				{/* 2. Lecturer Conflicts */}
				{(activeTab === "all" || activeTab === "lecturer") &&
					lecturerConflicts.map((c, idx) => (
						<div
							key={`lec-${idx}`}
							className="p-3 rounded-xl bg-danger-surface/40 border border-danger/20 text-xs space-y-1.5"
						>
							<div className="flex items-center justify-between text-danger font-semibold">
								<span className="flex items-center gap-1.5">
									<UserCheck size={14} />
									<span>
										Lecturer Double-Booked:{" "}
										{c.lecturer_name || `Staff #${c.lecturer_id}`}
									</span>
								</span>
								<span className="font-mono text-[11px]">
									{c.slot || "Slot"}
								</span>
							</div>
							<p className="text-[11px] text-text-muted">
								Assigned simultaneously to teach{" "}
								<strong className="text-text-main">{c.course_a}</strong> and{" "}
								<strong className="text-text-main">{c.course_b}</strong> in the
								same slot.
							</p>
						</div>
					))}

				{/* 3. Venue Conflicts */}
				{(activeTab === "all" || activeTab === "venue") &&
					venueConflicts.map((c, idx) => (
						<div
							key={`ven-${idx}`}
							className="p-3 rounded-xl bg-danger-surface/40 border border-danger/20 text-xs space-y-1.5"
						>
							<div className="flex items-center justify-between text-danger font-semibold">
								<span className="flex items-center gap-1.5">
									<Building2 size={14} />
									<span>
										Venue Double-Booked: {c.venue_name || `Room #${c.venue_id}`}
									</span>
								</span>
								<span className="font-mono text-[11px]">
									{c.slot || "Slot"}
								</span>
							</div>
							<p className="text-[11px] text-text-muted">
								Two courses scheduled to use this room at the same time:{" "}
								<strong className="text-text-main">{c.course_a}</strong> and{" "}
								<strong className="text-text-main">{c.course_b}</strong>.
							</p>
						</div>
					))}

				{/* 4. Daily Limit Violations */}
				{(activeTab === "all" || activeTab === "daily") &&
					dailyLimitViolations.map((c, idx) => (
						<div
							key={`day-${idx}`}
							className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5"
						>
							<div className="flex items-center justify-between text-amber-400 font-semibold">
								<span className="flex items-center gap-1.5">
									<Clock size={14} />
									<span>Daily Lecture Limit Exceeded ({c.day})</span>
								</span>
								<span className="font-mono text-[11px]">
									{c.scheduled_count} scheduled / max {c.max_allowed || 3}
								</span>
							</div>
							<p className="text-[11px] text-text-muted">
								Cohort{" "}
								<strong className="text-text-main">{c.student_group}</strong>{" "}
								has {c.scheduled_count} lectures scheduled on {c.day} (
								{c.courses?.join(", ")}), exceeding the 3-lecture daily maximum.
							</p>
						</div>
					))}

				{/* 5. Occurrence Day Violations */}
				{(activeTab === "all" || activeTab === "repeat") &&
					occurrenceDayViolations.map((c, idx) => (
						<div
							key={`rep-${idx}`}
							className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5"
						>
							<div className="flex items-center justify-between text-amber-400 font-semibold">
								<span className="flex items-center gap-1.5">
									<Calendar size={14} />
									<span>Multi-Session Same Day Repeat: {c.course_code}</span>
								</span>
								<span className="font-mono text-[11px]">{c.day}</span>
							</div>
							<p className="text-[11px] text-text-muted">
								Course occurrences{" "}
								<strong className="text-text-main">{c.occurrence_a}</strong> and{" "}
								<strong className="text-text-main">{c.occurrence_b}</strong>{" "}
								were placed on the same day ({c.day}). Multi-occurrence courses
								should occur on distinct days.
							</p>
						</div>
					))}

				{/* 6. Capacity Overflows */}
				{(activeTab === "all" || activeTab === "capacity") &&
					capacityViolations.map((c, idx) => (
						<div
							key={`cap-${idx}`}
							className="p-3 rounded-xl bg-surface-raised border border-border text-xs space-y-1.5"
						>
							<div className="flex items-center justify-between text-text-main font-semibold">
								<span className="flex items-center gap-1.5">
									<Maximize2 size={14} className="text-text-muted" />
									<span>
										Room Capacity Deficit: {c.course || c.course_code}
									</span>
								</span>
								<span className="text-[11px] text-amber-400 font-semibold font-mono">
									-{c.overflow || c.deficit} seats
								</span>
							</div>
							<div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
								<span>
									Venue:{" "}
									<strong className="text-text-main">{c.venue_name}</strong>{" "}
									(Cap: {c.venue_capacity || c.capacity})
								</span>
								<span>
									Expected:{" "}
									<strong className="text-text-main">
										{c.expected_students}
									</strong>{" "}
									students
								</span>
								<span className="font-mono">{c.slot}</span>
							</div>
						</div>
					))}

				{/* Empty category state */}
				{activeTab !== "all" &&
					((activeTab === "student" && studentConflicts.length === 0) ||
						(activeTab === "lecturer" && lecturerConflicts.length === 0) ||
						(activeTab === "venue" && venueConflicts.length === 0) ||
						(activeTab === "daily" && dailyLimitViolations.length === 0) ||
						(activeTab === "repeat" && occurrenceDayViolations.length === 0) ||
						(activeTab === "capacity" && totalCapacityViolations === 0)) && (
						<div className="p-6 text-center border border-dashed border-border rounded-xl bg-surface-raised/40 text-xs text-text-muted space-y-1">
							<CheckCircle2 size={18} className="mx-auto text-emerald-400" />
							<p className="font-semibold text-text-main">
								No violations in this category
							</p>
							<p className="text-[11px]">
								Constraint condition is completely satisfied.
							</p>
						</div>
					)}
			</div>
		</div>
	);
}
