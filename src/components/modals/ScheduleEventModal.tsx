import { useState, useMemo, useEffect } from "react";
import {
	Calendar,
	MapPin,
	GraduationCap,
	X,
	AlertCircle,
	Check,
	Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import {
	MultiSelect,
	type MultiSelectOption,
} from "@/components/ui/MultiSelect";
import { TimeSlotPicker } from "@/components/schedules/TimeSlotPicker";
import type { Venue, Program, Department, Faculty, User } from "@/types";
import type { CreateScheduleEntryPayload } from "@/api/main/schedulesAPI";

interface ScheduleEventModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (payload: CreateScheduleEntryPayload) => void;
	isPending?: boolean;
	venues: Venue[];
	programs: Program[];
	departments?: Department[];
	faculties?: Faculty[];
	defaultDepartmentId?: string | number;
	activeSemesterId?: string;
	user: User | null;
}

export function ScheduleEventModal({
	isOpen,
	onClose,
	onSubmit,
	isPending = false,
	venues = [],
	programs = [],
	departments = [],
	faculties = [],
	defaultDepartmentId,
	activeSemesterId,
	user,
}: ScheduleEventModalProps) {
	// Form fields
	const [title, setTitle] = useState("");
	const [selectedScopeValues, setSelectedScopeValues] = useState<string[]>([]);
	const [selectedProgramId, setSelectedProgramId] = useState<string>("");
	const [selectedLevel, setSelectedLevel] = useState<string>("");

	// Default date to today
	const todayStr = useMemo(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	}, []);

	const [eventDate, setEventDate] = useState<string>(todayStr);
	const [selectedVenueId, setSelectedVenueId] = useState<string>("");
	const [startTime, setStartTime] = useState<string>("");
	const [endTime, setEndTime] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	// User permission scopes - scope is determined by logged in admin
	const isSuperuser =
		user?.role === "admin" &&
		(user?.adminLevel === "system" || user?.adminLevel === "university");
	const adminLevel =
		user?.adminLevel || (isSuperuser ? "system" : "department");
	const isSchoolOrSystemAdmin =
		adminLevel === "school" ||
		adminLevel === "system" ||
		adminLevel === "university" ||
		isSuperuser;
	const isFacultyAdmin = adminLevel === "faculty";
	const isDeptAdmin = !isSchoolOrSystemAdmin && !isFacultyAdmin;

	const userDeptId = useMemo(() => {
		// 1. If explicit defaultDepartmentId passed and is valid
		if (defaultDepartmentId && String(defaultDepartmentId).trim() !== "") {
			const deptStr = String(defaultDepartmentId);
			if (!isNaN(Number(deptStr))) return deptStr;
			const match = departments.find(
				(d) =>
					d.name.toLowerCase() === deptStr.toLowerCase() ||
					d.code.toLowerCase() === deptStr.toLowerCase(),
			);
			if (match) return String(match.id);
		}

		// 2. Department admin scopeId
		if (
			isDeptAdmin &&
			user?.adminScopeId &&
			!isNaN(Number(user.adminScopeId))
		) {
			return String(user.adminScopeId);
		}

		// 3. User departmentId
		if (user?.departmentId) {
			const deptStr = String(user.departmentId);
			if (!isNaN(Number(deptStr))) return deptStr;
			const match = departments.find(
				(d) =>
					d.name.toLowerCase() === deptStr.toLowerCase() ||
					d.code.toLowerCase() === deptStr.toLowerCase(),
			);
			if (match) return String(match.id);
		}

		// 4. Match by department name
		if (user?.departmentName) {
			const match = departments.find(
				(d) =>
					d.name.toLowerCase() === user.departmentName!.toLowerCase() ||
					d.code.toLowerCase() === user.departmentName!.toLowerCase(),
			);
			if (match) return String(match.id);
		}

		// 5. Fallback to first department in list
		return departments.length > 0 ? String(departments[0].id) : "";
	}, [user, defaultDepartmentId, departments, isDeptAdmin]);

	const userFacultyId = useMemo(() => {
		return (
			user?.facultyId ||
			(isFacultyAdmin ? user?.adminScopeId : undefined) ||
			(faculties.length > 0 ? String(faculties[0].id) : "")
		);
	}, [user, isFacultyAdmin, faculties]);

	// Build multiselect options for Faculty Admin or School Admin
	const scopeOptions = useMemo<MultiSelectOption[]>(() => {
		const opts: MultiSelectOption[] = [];

		if (isFacultyAdmin) {
			// Departments in this faculty
			const facultyDepts = userFacultyId
				? departments.filter(
						(d) => String(d.facultyId) === String(userFacultyId),
					)
				: departments;

			facultyDepts.forEach((d) => {
				opts.push({
					value: `dept-${d.id}`,
					label: d.name,
					subtitle: d.code,
					group: "Departments in Faculty",
				});
			});

			// Other faculties in case of joint / inter-faculty event
			faculties.forEach((f) => {
				opts.push({
					value: `faculty-${f.id}`,
					label: `${f.name} (Faculty-wide)`,
					subtitle: f.code,
					group: "Faculties",
				});
			});
		} else if (isSchoolOrSystemAdmin) {
			// All faculties
			faculties.forEach((f) => {
				opts.push({
					value: `faculty-${f.id}`,
					label: `${f.name} (Faculty-wide)`,
					subtitle: f.code,
					group: "Faculties",
				});
			});

			// All departments
			departments.forEach((d) => {
				opts.push({
					value: `dept-${d.id}`,
					label: d.name,
					subtitle: d.code,
					group: "Departments",
				});
			});
		}

		return opts;
	}, [
		isFacultyAdmin,
		isSchoolOrSystemAdmin,
		userFacultyId,
		departments,
		faculties,
	]);

	// Extract selected department IDs and faculty IDs from multiselect
	const selectedDepartmentIds = useMemo(() => {
		return selectedScopeValues
			.filter((v) => v.startsWith("dept-"))
			.map((v) => v.replace("dept-", ""));
	}, [selectedScopeValues]);

	const selectedFacultyIds = useMemo(() => {
		return selectedScopeValues
			.filter((v) => v.startsWith("faculty-"))
			.map((v) => v.replace("faculty-", ""));
	}, [selectedScopeValues]);

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setTitle("");
			setError(null);
			setStartTime("");
			setEndTime("");
			setEventDate(todayStr);
			setSelectedScopeValues([]);
			setSelectedProgramId("");
			setSelectedLevel("");
		}
	}, [isOpen, todayStr]);

	// Calculate derived day of week from eventDate
	const derivedDayOfWeek = useMemo(() => {
		if (!eventDate) return "Monday";
		const dateObj = new Date(`${eventDate}T00:00:00`);
		const days = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];
		return days[dateObj.getDay()] || "Monday";
	}, [eventDate]);

	// Filter venues according to admin scope & selected departments/faculties
	const allowedVenues = useMemo(() => {
		if (!venues || venues.length === 0) return [];

		return venues.filter((v) => {
			if (!v.isAvailable) return false;

			if (isDeptAdmin) {
				const deptId = String(userDeptId);
				if (
					v.owningLevel === "department" &&
					String(v.owningDepartmentId) === deptId
				) {
					return true;
				}
				if (v.owningLevel === "faculty" && !v.owningDepartmentId) {
					return true;
				}
				if (v.owningLevel === "school") {
					return true;
				}
				return false;
			}

			if (isFacultyAdmin) {
				const facId = String(userFacultyId);

				// If specific departments/faculties were picked in multiselect
				if (selectedDepartmentIds.length > 0 || selectedFacultyIds.length > 0) {
					if (
						v.owningLevel === "department" &&
						selectedDepartmentIds.includes(String(v.owningDepartmentId))
					) {
						return true;
					}
					if (
						v.owningLevel === "faculty" &&
						(selectedFacultyIds.includes(String(v.owningFacultyId)) ||
							String(v.owningFacultyId) === facId)
					) {
						return true;
					}
					if (v.owningLevel === "school") {
						return true;
					}
					return false;
				}

				// Faculty-wide event
				if (
					v.owningLevel === "faculty" &&
					(!v.owningFacultyId || String(v.owningFacultyId) === facId)
				) {
					return true;
				}
				if (v.owningLevel === "department") {
					const dept = departments.find(
						(d) => String(d.id) === String(v.owningDepartmentId),
					);
					if (!facId || (dept && String(dept.facultyId) === facId)) {
						return true;
					}
				}
				if (v.owningLevel === "school") {
					return true;
				}
				return false;
			}

			// School / System scope
			if (selectedDepartmentIds.length > 0 || selectedFacultyIds.length > 0) {
				if (
					v.owningLevel === "department" &&
					selectedDepartmentIds.includes(String(v.owningDepartmentId))
				) {
					return true;
				}
				if (
					v.owningLevel === "faculty" &&
					selectedFacultyIds.includes(String(v.owningFacultyId))
				) {
					return true;
				}
				if (v.owningLevel === "school") {
					return true;
				}
				return false;
			}
			return true;
		});
	}, [
		venues,
		isDeptAdmin,
		isFacultyAdmin,
		userDeptId,
		userFacultyId,
		selectedDepartmentIds,
		selectedFacultyIds,
		departments,
	]);

	// Auto-select first venue if current selection not in allowed list
	useEffect(() => {
		if (allowedVenues.length > 0) {
			const exists = allowedVenues.some(
				(v) => String(v.id) === String(selectedVenueId),
			);
			if (!exists) {
				setSelectedVenueId(String(allowedVenues[0].id));
			}
		} else {
			setSelectedVenueId("");
		}
	}, [allowedVenues, selectedVenueId]);

	// Filter programs by selected departments / faculties or admin scope
	const filteredPrograms = useMemo(() => {
		if (selectedDepartmentIds.length > 0) {
			return programs.filter((p) =>
				selectedDepartmentIds.includes(String(p.departmentId)),
			);
		}
		if (selectedFacultyIds.length > 0) {
			return programs.filter((p) =>
				p.facultyId ? selectedFacultyIds.includes(String(p.facultyId)) : true,
			);
		}
		if (isDeptAdmin) {
			if (userDeptId) {
				const byId = programs.filter(
					(p) => String(p.departmentId) === String(userDeptId),
				);
				if (byId.length > 0) return byId;
			}
			// Fallback: match by department name if available
			const deptObj = departments.find(
				(d) => String(d.id) === String(userDeptId),
			);
			const deptName = deptObj?.name || user?.departmentName;
			if (deptName) {
				const byName = programs.filter(
					(p) =>
						p.departmentName &&
						p.departmentName.toLowerCase() === deptName.toLowerCase(),
				);
				if (byName.length > 0) return byName;
			}
			return [];
		}
		if (isFacultyAdmin && userFacultyId) {
			return programs.filter(
				(p) => !p.facultyId || String(p.facultyId) === String(userFacultyId),
			);
		}
		return programs;
	}, [
		programs,
		selectedDepartmentIds,
		selectedFacultyIds,
		isDeptAdmin,
		userDeptId,
		departments,
		user,
		isFacultyAdmin,
		userFacultyId,
	]);

	// Determine the effective max level based on selected program or admin scope
	const effectiveMaxLevel = useMemo(() => {
		// 1. If a specific program is selected, cap at that program's maxLevel
		if (selectedProgramId) {
			const prog = programs.find(
				(p) => String(p.id) === String(selectedProgramId),
			);
			if (prog?.maxLevel && prog.maxLevel >= 100) {
				return prog.maxLevel;
			}
		}

		// 2. For department admins: max across all programs in their department
		if (isDeptAdmin) {
			if (filteredPrograms.length > 0) {
				const maxFromProgs = Math.max(
					...filteredPrograms.map((p) => p.maxLevel || 100),
				);
				if (maxFromProgs >= 100) return maxFromProgs;
			}
			const currentDept = departments.find(
				(d) => String(d.id) === String(userDeptId),
			);
			if (currentDept?.maxLevel) return currentDept.maxLevel;
			if (currentDept?.max_level) return currentDept.max_level;
			return 400;
		}

		// 3. For faculty/school admins targeting specific departments
		if (selectedDepartmentIds.length > 0) {
			const targetedProgs = programs.filter((p) =>
				selectedDepartmentIds.includes(String(p.departmentId)),
			);
			if (targetedProgs.length > 0) {
				return Math.max(...targetedProgs.map((p) => p.maxLevel || 100));
			}
		}

		// 4. For faculty admin: max across all programs in their faculty
		if (isFacultyAdmin && userFacultyId) {
			const facultyProgs = programs.filter(
				(p) => !p.facultyId || String(p.facultyId) === String(userFacultyId),
			);
			if (facultyProgs.length > 0) {
				return Math.max(...facultyProgs.map((p) => p.maxLevel || 100));
			}
		}

		// 5. System / School admin: max across all available programs
		if (programs.length > 0) {
			return Math.max(...programs.map((p) => p.maxLevel || 100));
		}

		return 500;
	}, [
		selectedProgramId,
		isDeptAdmin,
		filteredPrograms,
		departments,
		userDeptId,
		selectedDepartmentIds,
		programs,
		isFacultyAdmin,
		userFacultyId,
	]);

	// Build dynamic level options maxed at effectiveMaxLevel + "Final Year"
	const dynamicLevelOptions = useMemo(() => {
		const standardLevels = [
			{ label: "100 Level", value: "100", num: 100 },
			{ label: "200 Level", value: "200", num: 200 },
			{ label: "300 Level", value: "300", num: 300 },
			{ label: "400 Level", value: "400", num: 400 },
			{ label: "500 Level", value: "500", num: 500 },
			{ label: "600 Level", value: "600", num: 600 },
		];

		const allowed = standardLevels.filter(
			(lvl) => lvl.num <= effectiveMaxLevel,
		);

		return [
			{ label: "General / All Levels", value: "" },
			...allowed.map(({ label, value }) => ({ label, value })),
			{ label: "Final Year", value: "999" },
		];
	}, [effectiveMaxLevel]);

	// Auto-reset selectedLevel if it exceeds the new effective max level
	useEffect(() => {
		if (
			selectedLevel &&
			selectedLevel !== "" &&
			selectedLevel !== "999" &&
			Number(selectedLevel) > effectiveMaxLevel
		) {
			setSelectedLevel("");
		}
	}, [effectiveMaxLevel, selectedLevel]);

	const selectedVenue = useMemo(() => {
		return venues.find((v) => String(v.id) === String(selectedVenueId));
	}, [venues, selectedVenueId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!title.trim()) {
			setError("Event title or name is required.");
			return;
		}

		if (!eventDate) {
			setError("Event date is required.");
			return;
		}

		if (eventDate < todayStr) {
			setError("An event's date cannot be in the past.");
			return;
		}

		if (!selectedVenueId) {
			setError("Please select a venue for the event.");
			return;
		}

		if (!startTime || !endTime) {
			setError("Please select an available time slot for the event.");
			return;
		}

		const payload: CreateScheduleEntryPayload = {
			entry_type: "event",
			title: title.trim(),
			venue: selectedVenueId,
			start_time: startTime,
			end_time: endTime,
			recurrence_start_date: eventDate,
			recurrence_end_date: eventDate,
			semester: activeSemesterId,
			target_program: selectedProgramId || undefined,
			target_level: selectedLevel ? Number(selectedLevel) : undefined,
		};

		onSubmit(payload);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
			<div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
				{/* Modal Header */}
				<div className="px-6 py-4.5 border-b border-border flex items-center justify-between bg-surface-raised/40">
					<div>
						<div className="flex items-center gap-2">
							<Text variant="h3" className="text-base font-bold text-text-main">
								Schedule Academic Event
							</Text>
							<Badge
								variant="secondary"
								className="bg-purple-500/15 text-purple-400 text-[10px]"
							>
								One-Time Event
							</Badge>
						</div>
						<Text variant="caption" className="text-text-muted text-xs">
							Schedule a one-time academic event. Events appear only on their
							scheduled date and take precedence in department-owned venues.
						</Text>
					</div>
					<button
						type="button"
						onClick={onClose}
						disabled={isPending}
						className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors"
					>
						<X size={18} />
					</button>
				</div>

				{/* Modal Form Body */}
				<form
					onSubmit={handleSubmit}
					className="flex-1 overflow-y-auto p-6 space-y-5"
				>
					{error && (
						<div className="p-3.5 rounded-xl border border-danger/30 bg-danger/10 text-danger flex items-center gap-2.5 text-xs animate-in fade-in duration-150">
							<AlertCircle size={15} className="shrink-0" />
							<span>{error}</span>
						</div>
					)}

					{/* Event Title */}
					<div className="space-y-1.5">
						<label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
							<span>Event Title / Name</span>
							<span className="text-danger">*</span>
						</label>
						<Input
							type="text"
							required
							placeholder="e.g., Department Orientation, Seminar, Faculty Board Meeting"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="h-10 text-sm bg-surface-raised/50"
						/>
					</div>

					{/* Searchable Multiselect for Faculty or School Admins */}
					{(isFacultyAdmin || isSchoolOrSystemAdmin) && (
						<MultiSelect
							label={
								isFacultyAdmin
									? "Target Specific Departments or Faculties (Optional)"
									: "Target Specific Departments or Faculties (Optional)"
							}
							placeholder={
								isFacultyAdmin
									? "All departments in faculty (Faculty-wide event)..."
									: "All departments & faculties (School-wide event)..."
							}
							searchPlaceholder="Search departments or faculties..."
							options={scopeOptions}
							selectedValues={selectedScopeValues}
							onChange={setSelectedScopeValues}
							helperText="Leave empty to target all departments/faculties in your scope, or select specific ones."
						/>
					)}

					{/* Target Program & Level */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
								<GraduationCap size={13} className="text-purple-500" />
								<span>Target Program</span>
								<span className="text-[11px] text-text-subtle font-normal">
									(Optional)
								</span>
							</label>
							<select
								value={selectedProgramId}
								onChange={(e) => setSelectedProgramId(e.target.value)}
								className="w-full h-10 px-3 rounded-xl bg-surface-raised/50 border border-border text-xs text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
							>
								<option value="">General / All Programs</option>
								{filteredPrograms.map((p) => (
									<option key={p.id} value={p.id}>
										{p.name} ({p.code})
										{p.maxLevel ? ` — ${p.maxLevel}L max` : ""}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
								<GraduationCap size={13} className="text-purple-500" />
								<span>Target Level</span>
								<span className="text-[11px] text-text-subtle font-normal">
									(Optional)
								</span>
							</label>
							<select
								value={selectedLevel}
								onChange={(e) => setSelectedLevel(e.target.value)}
								className="w-full h-10 px-3 rounded-xl bg-surface-raised/50 border border-border text-xs text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
							>
								{dynamicLevelOptions.map((lvl) => (
									<option key={lvl.value} value={lvl.value}>
										{lvl.label}
									</option>
								))}
							</select>
							{effectiveMaxLevel && (
								<span className="text-[10px] text-text-subtle block">
									Department/Program cap: {effectiveMaxLevel} Level
								</span>
							)}
						</div>
					</div>

					{/* Event Date & Venue Selection */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
								<Calendar size={13} className="text-purple-500" />
								<span>Event Date</span>
								<span className="text-danger">*</span>
							</label>
							<Input
								type="date"
								required
								min={todayStr}
								value={eventDate}
								onChange={(e) => {
									setEventDate(e.target.value);
									// reset slot selection when date changes
									setStartTime("");
									setEndTime("");
								}}
								className="h-10 text-xs bg-surface-raised/50"
							/>
							<span className="text-[11px] text-text-muted block">
								Day:{" "}
								<span className="font-semibold text-text-main">
									{derivedDayOfWeek}
								</span>
							</span>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
								<MapPin size={13} className="text-purple-500" />
								<span>Venue</span>
								<span className="text-danger">*</span>
							</label>
							<select
								value={selectedVenueId}
								onChange={(e) => {
									setSelectedVenueId(e.target.value);
									setStartTime("");
									setEndTime("");
								}}
								className="w-full h-10 px-3 rounded-xl bg-surface-raised/50 border border-border text-xs text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
							>
								{allowedVenues.length === 0 ? (
									<option value="">No venues available</option>
								) : (
									allowedVenues.map((v) => {
										const scopeTag =
											v.owningLevel === "department"
												? `Dept ${v.owningDepartmentName || ""}`
												: v.owningLevel === "faculty"
													? "Faculty"
													: "School";
										return (
											<option key={v.id} value={v.id}>
												{v.name} ({v.capacity} seats) — [{scopeTag}]
											</option>
										);
									})
								)}
							</select>
							{selectedVenue && (
								<span className="text-[11px] text-text-muted block">
									Capacity: {selectedVenue.capacity} seats | Scope:{" "}
									<span className="capitalize font-medium text-text-main">
										{selectedVenue.owningLevel}
									</span>
								</span>
							)}
						</div>
					</div>

					{/* Time Slot Picker */}
					<div className="pt-2 border-t border-border/60">
						<TimeSlotPicker
							venueId={selectedVenueId}
							dayOfWeek={derivedDayOfWeek}
							date={eventDate}
							isEvent={true}
							selectedStartTime={startTime}
							selectedEndTime={endTime}
							onSelectSlot={(start, end) => {
								setStartTime(start);
								setEndTime(end);
							}}
						/>
					</div>

					{/* Preemption Notice Banner */}
					<div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2.5 text-xs text-text-main">
						<Info size={15} className="text-purple-400 shrink-0 mt-0.5" />
						<div className="space-y-0.5">
							<span className="font-semibold text-purple-300 block">
								Preemption & Scope Notice
							</span>
							<span className="text-text-muted text-[11px] leading-relaxed block">
								Events scheduled in department-owned venues automatically shift
								any overlapping lecture sessions. If you select a venue outside
								your authority (e.g., faculty or school hall), the request will
								route to the presiding admin officer for approval.
							</span>
						</div>
					</div>
				</form>

				{/* Modal Footer */}
				<div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-raised/40">
					<div className="text-xs text-text-muted">
						{startTime && endTime ? (
							<span className="flex items-center gap-1.5 text-purple-500 font-medium">
								<Check size={13} />
								Selected: {startTime.slice(0, 5)} - {endTime.slice(0, 5)} (
								{derivedDayOfWeek}, {eventDate})
							</span>
						) : (
							<span>Please choose time slot(s)</span>
						)}
					</div>

					<div className="flex items-center gap-2.5">
						<Button
							type="button"
							variant="ghost"
							onClick={onClose}
							disabled={isPending}
							className="text-xs"
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={
								isPending ||
								!title.trim() ||
								!selectedVenueId ||
								!startTime ||
								!endTime
							}
							className={`${
								isPending ||
								!title.trim() ||
								!selectedVenueId ||
								!startTime ||
								!endTime
									? "bg-purple-400"
									: "bg-purple-600 hover:bg-purple-500"
							} text-white font-medium text-xs px-4 cursor-pointer`}
						>
							{isPending ? (
								<div className="flex items-center gap-1.5">
									<div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
									<span>Scheduling...</span>
								</div>
							) : (
								<div className="flex items-center gap-1.5">
									<span>Schedule Event</span>
								</div>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
