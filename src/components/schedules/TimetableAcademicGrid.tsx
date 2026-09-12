import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, MapPin, User, Layers } from "lucide-react";
import type { TimetableEntry, Program } from "@/types";

interface TimeSlot {
	id: string;
	label: string;
	start: string;
	end: string;
}

const TIME_SLOTS: TimeSlot[] = [
	{ id: "slot-1", label: "08:00 - 10:00", start: "08:00:00", end: "10:00:00" },
	{ id: "slot-2", label: "10:00 - 12:00", start: "10:00:00", end: "12:00:00" },
	{ id: "slot-3", label: "12:00 - 14:00", start: "12:00:00", end: "14:00:00" },
	{ id: "slot-4", label: "14:00 - 16:00", start: "14:00:00", end: "16:00:00" },
	{ id: "slot-5", label: "16:00 - 18:00", start: "16:00:00", end: "18:00:00" },
];

const DAYS: Array<
	"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
> = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimetableAcademicGridProps {
	entries: TimetableEntry[];
	programs?: Program[];
	selectedProgramId?: string;
	onSelectProgram?: (programId: string) => void;
	onOpenCreateEntry?: (defaultDay?: string, defaultSlot?: TimeSlot) => void;
}

export function TimetableAcademicGrid({
	entries,
	programs = [],
	selectedProgramId = "",
	onSelectProgram,
	onOpenCreateEntry,
}: TimetableAcademicGridProps) {
	const [selectedLevel, setSelectedLevel] = useState<string>("");
	const [internalProgramId, setInternalProgramId] =
		useState<string>(selectedProgramId);

	const activeProgramId = onSelectProgram
		? selectedProgramId
		: internalProgramId;
	const handleProgramChange = (id: string) => {
		if (onSelectProgram) onSelectProgram(id);
		else setInternalProgramId(id);
	};

	// Filter entries by program and level
	const displayedEntries = useMemo(() => {
		return entries.filter((entry) => {
			const matchesProgram =
				!activeProgramId ||
				!entry.targetProgramId ||
				entry.targetProgramId === activeProgramId;

			return matchesProgram;
		});
	}, [entries, activeProgramId]);

	// Helper to test if entry overlaps a 2-hour slot
	const isOverlapping = (
		entryStart: string,
		entryEnd: string,
		slotStart: string,
		slotEnd: string,
	) => {
		const norm = (t: string) => (t.length === 5 ? `${t}:00` : t);
		return norm(entryStart) < norm(slotEnd) && norm(entryEnd) > norm(slotStart);
	};

	return (
		<div className="space-y-4">
			{/* Program & Level Filter Tabs */}
			<div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-border rounded-2xl">
				{programs.length > 0 ? (
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="text-xs font-semibold text-text-muted mr-1">
							Program:
						</span>
						<button
							type="button"
							onClick={() => handleProgramChange("")}
							className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
								!activeProgramId
									? "bg-primary text-white shadow-xs"
									: "bg-surface-raised hover:bg-surface-raised/80 text-text-main border border-border"
							}`}
						>
							All Programs
						</button>
						{programs.map((prog) => (
							<button
								key={prog.id}
								type="button"
								onClick={() => handleProgramChange(prog.id)}
								className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
									activeProgramId === prog.id
										? "bg-primary text-white shadow-xs"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-main border border-border"
								}`}
							>
								{prog.name} ({prog.code})
							</button>
						))}
					</div>
				) : (
					<div className="flex items-center gap-2 text-xs text-text-muted">
						<Layers size={14} />
						<span>Standard Department Schedule</span>
					</div>
				)}

				<div className="flex items-center gap-1.5">
					<span className="text-xs font-semibold text-text-muted mr-1">
						Level:
					</span>
					{["", "100", "200", "300", "400", "500"].map((lvl) => (
						<button
							key={lvl || "all"}
							type="button"
							onClick={() => setSelectedLevel(lvl)}
							className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
								selectedLevel === lvl
									? "bg-primary/20 text-primary border border-primary/30"
									: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted border border-border"
							}`}
						>
							{lvl ? `${lvl}L` : "All"}
						</button>
					))}
				</div>
			</div>

			{/* Timetable Academic Matrix Table */}
			<div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs scrollbar-thin">
				<table className="w-full border-collapse text-left min-w-[900px]">
					<thead>
						<tr className="border-b border-border bg-surface-raised/60">
							<th className="p-3.5 text-xs font-bold uppercase tracking-wider text-text-muted w-32 border-r border-border">
								Day \ Time
							</th>
							{TIME_SLOTS.map((slot) => (
								<th
									key={slot.id}
									className="p-3.5 text-xs font-bold text-center text-text-main border-r border-border last:border-r-0 min-w-[150px]"
								>
									{slot.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{DAYS.map((day) => (
							<tr
								key={day}
								className="border-b border-border last:border-b-0 hover:bg-surface-raised/30 transition-colors"
							>
								<td className="p-3.5 font-semibold text-xs text-text-main border-r border-border bg-surface-raised/40 align-top">
									{day}
								</td>
								{TIME_SLOTS.map((slot) => {
									const matchingEntries = displayedEntries.filter(
										(e) =>
											e.dayOfWeek === day &&
											isOverlapping(
												e.startTime,
												e.endTime,
												slot.start,
												slot.end,
											),
									);

									return (
										<td
											key={slot.id}
											className="p-2 border-r border-border last:border-r-0 align-top h-28"
										>
											{matchingEntries.length > 0 ? (
												<div className="space-y-1.5 h-full">
													{matchingEntries.map((entry) => (
														<div
															key={entry.id}
															className={`p-2 rounded-xl text-xs space-y-1 border transition-all ${
																entry.hasConflict
																	? "bg-red-500/10 border-red-500/30 text-red-400"
																	: "bg-primary/10 border-primary/20 text-text-main"
															}`}
														>
															<div className="flex items-center justify-between gap-1">
																<span className="font-extrabold text-primary">
																	{entry.courseCode}
																</span>
																{entry.hasConflict && (
																	<AlertTriangle
																		size={13}
																		className="text-red-400 shrink-0"
																	/>
																)}
															</div>
															<div
																className="text-[11px] font-medium text-text-main truncate"
																title={entry.courseTitle}
															>
																{entry.courseTitle}
															</div>
															<div className="flex items-center gap-1 text-[10px] text-text-muted truncate">
																<MapPin
																	size={10}
																	className="shrink-0 text-text-subtle"
																/>
																<span className="truncate">
																	{entry.venueName}
																</span>
															</div>
															{entry.lecturerName && (
																<div className="flex items-center gap-1 text-[10px] text-text-muted truncate">
																	<User
																		size={10}
																		className="shrink-0 text-text-subtle"
																	/>
																	<span className="truncate">
																		{entry.lecturerName}
																	</span>
																</div>
															)}
															{entry.targetProgramName && (
																<Badge
																	variant="primary"
																	className="text-[9px] py-0 px-1 mt-0.5 max-w-full truncate"
																>
																	{entry.targetProgramName}
																</Badge>
															)}
														</div>
													))}
												</div>
											) : (
												<div
													onClick={() => onOpenCreateEntry?.(day, slot)}
													className="h-full min-h-[5rem] rounded-xl border border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-colors cursor-pointer group"
												>
													<Plus
														size={14}
														className="text-text-subtle group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
													/>
												</div>
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
