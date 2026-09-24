import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getTimetableEntries,
	getLectureSessions,
	getCoursesOptions,
	getVenuesOptions,
	createTimetableEntry,
	updateLectureSessionAPI,
	type CreateScheduleEntryPayload,
} from "@/api/main/schedulesAPI";
import { getPrograms } from "@/api/main/programsAPI";
import { getSemesters, getAcademicSessions } from "@/api/main/semestersAPI";
import {
	getSchoolsList,
	getFacultiesList,
	getDepartmentsList,
} from "@/api/main/hierarchyAPI";
import {
	getGenerationPermissions,
	getGenerationRuns,
	getGenerationRunDetail,
} from "@/api/main/generationAPI";
import type {
	TimetableEntry,
	LectureSession,
	Course,
	Venue,
	Program,
	Semester,
	AcademicSession,
	School,
	Faculty,
	Department,
	TimetableGenerationRun,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";
import {
	getWeekRange,
	getWeekDayDates,
	getSemesterWeekTimeline,
} from "@/utils/semesterWeeks";
import {
	filterFacultiesByScope,
	filterDepartmentsByScope,
	getAdminScopeLabel,
} from "@/lib/scopeUtils";
import type { DepartmentOption } from "@/components/schedules/generator/DepartmentLoopBar";
import SchedulesView from "@/pages/main/SchedulesView";
import ScheduleEntryModal from "@/components/modals/ScheduleEntryModal";
import SessionShiftModal from "@/components/modals/SessionShiftModal";
import ConflictFeedbackModal from "@/components/modals/ConflictFeedbackModal";
import { GenerateTimetableModal } from "@/components/schedules/GenerateTimetableModal";
import { GenerationReportModal } from "@/components/schedules/GenerationReportModal";
import { GenerationHistoryModal } from "@/components/schedules/GenerationHistoryModal";
import { GenerationPermissionsModal } from "@/components/schedules/GenerationPermissionsModal";

export default function SchedulesContainer() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useAuth();

	// Scope and admin level determination
	const isSuperuser =
		user?.role === "admin" && user?.adminLevel === "university";
	const isSchoolAdmin = user?.role === "admin" && user?.adminLevel === "school";
	const isFacultyAdmin =
		user?.role === "admin" && user?.adminLevel === "faculty";
	const isDeptAdmin =
		user?.role === "admin" && user?.adminLevel === "department";
	const userSchoolId = user?.adminScopeId || user?.schoolId;

	// Modals state
	const [isScheduleEntryOpen, setIsScheduleEntryOpen] = useState(false);
	const [selectedSessionForShift, setSelectedSessionForShift] =
		useState<LectureSession | null>(null);

	// Timetable generation modal states
	const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
	const [activeGenerationRun, setActiveGenerationRun] =
		useState<TimetableGenerationRun | null>(null);

	// Defaults when clicking a slot in the grid
	const [scheduleEntryDefaults, setScheduleEntryDefaults] = useState<{
		day?: string;
		startTime?: string;
		endTime?: string;
	}>({});

	// Conflict modal state
	const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
	const [conflictOutcome, setConflictOutcome] = useState<
		"ROUTE_APPROVAL" | "HARD_REJECT" | null
	>(null);
	const [conflictDetailMsg, setConflictDetailMsg] = useState("");
	const [conflictsList, setConflictsList] = useState<
		Array<{
			type: string;
			venueName?: string;
			date?: string;
			startTime?: string;
			endTime?: string;
			conflictingTitle?: string;
		}>
	>([]);

	// Base Data Queries
	const { data: programsData = [] } = useQuery<Program[]>({
		queryKey: ["programs", "list"],
		queryFn: () => getPrograms(),
	});

	const { data: academicSessionsData = [] } = useQuery<AcademicSession[]>({
		queryKey: ["academic-sessions", "list", userSchoolId],
		queryFn: () => getAcademicSessions({ school: userSchoolId || undefined }),
	});

	const { data: semestersData = [] } = useQuery<Semester[]>({
		queryKey: ["semesters", "list", userSchoolId],
		queryFn: () => getSemesters({ school: userSchoolId || undefined }),
	});

	const { data: coursesData = [] } = useQuery<Course[]>({
		queryKey: ["courses", "list"],
		queryFn: getCoursesOptions,
	});

	const { data: venuesData = [] } = useQuery<Venue[]>({
		queryKey: ["venues", "list"],
		queryFn: getVenuesOptions,
	});

	// Hierarchy queries for generator and view scoping
	const { data: schoolsData = [] } = useQuery<School[]>({
		queryKey: ["schools", "list"],
		queryFn: getSchoolsList,
		enabled: isSuperuser || isSchoolAdmin,
	});

	const { data: facultiesData = [] } = useQuery<Faculty[]>({
		queryKey: ["faculties", "list"],
		queryFn: getFacultiesList,
		enabled: isSuperuser || isSchoolAdmin || isFacultyAdmin,
	});

	const { data: departmentsData = [] } = useQuery<Department[]>({
		queryKey: ["departments", "list"],
		queryFn: getDepartmentsList,
		enabled: isSuperuser || isSchoolAdmin || isFacultyAdmin || isDeptAdmin,
	});

	// Generation Scope Permissions Query
	const { data: scopePermission } = useQuery({
		queryKey: ["scheduling", "generationPermissions", userSchoolId],
		queryFn: () => getGenerationPermissions(userSchoolId),
		enabled: Boolean(userSchoolId),
	});

	const allowFacultyGen = scopePermission?.allowFacultyGeneration ?? false;
	const allowDeptGen = scopePermission?.allowDepartmentGeneration ?? false;

	const canGenerate =
		isSuperuser ||
		isSchoolAdmin ||
		(isFacultyAdmin && allowFacultyGen) ||
		(isDeptAdmin && allowDeptGen);

	const canConfigurePermissions = isSuperuser || isSchoolAdmin;

	// Identify current active academic session set by school/system admin
	const currentAcademicSession = useMemo(() => {
		return (
			academicSessionsData.find((s) => s.isCurrent) ||
			academicSessionsData[0] ||
			null
		);
	}, [academicSessionsData]);

	// Identify active semester belonging to the active academic session
	const activeSemester = useMemo(() => {
		if (currentAcademicSession) {
			const activeInSession = semestersData.find(
				(s) =>
					s.isActive &&
					String(s.sessionId) === String(currentAcademicSession.id),
			);
			if (activeInSession) return activeInSession;
		}

		const activeInSchool = semestersData.find(
			(s) =>
				s.isActive &&
				(!userSchoolId || String(s.schoolId) === String(userSchoolId)),
		);
		if (activeInSchool) return activeInSchool;

		return semestersData.find((s) => s.isActive) || semestersData[0];
	}, [semestersData, currentAcademicSession, userSchoolId]);

	// Compute semester timeline relative to the active semester (never counting a full calendar year)
	const semesterTimeline = useMemo(() => {
		return getSemesterWeekTimeline(activeSemester);
	}, [activeSemester]);

	const totalWeeks = semesterTimeline.totalWeeks;
	const defaultCurrentWeek = semesterTimeline.currentWeek;
	const semesterStartDate = semesterTimeline.referenceStartDate;

	// Filter accessible faculties by scope
	const scopedFaculties = useMemo(() => {
		return filterFacultiesByScope(facultiesData, user, departmentsData);
	}, [facultiesData, user, departmentsData]);

	const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");

	useEffect(() => {
		if (scopedFaculties.length > 0 && !selectedFacultyId) {
			setSelectedFacultyId(String(scopedFaculties[0].id));
		}
	}, [scopedFaculties, selectedFacultyId]);

	// Filter accessible departments by scope
	const scopedDepartments = useMemo(() => {
		return filterDepartmentsByScope(departmentsData, user, facultiesData);
	}, [departmentsData, user, facultiesData]);

	// Departments narrowed by selected faculty for school/system admins
	const departmentsInView = useMemo(() => {
		if ((isSchoolAdmin || isSuperuser) && selectedFacultyId) {
			return scopedDepartments.filter(
				(d) => String(d.facultyId) === String(selectedFacultyId),
			);
		}
		return scopedDepartments;
	}, [scopedDepartments, isSchoolAdmin, isSuperuser, selectedFacultyId]);

	// Department selection state
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<
		string | number
	>("");

	// Keep selectedDepartmentId synchronized with accessible departments
	useEffect(() => {
		if (departmentsInView.length > 0) {
			const exists = departmentsInView.some(
				(d) => String(d.id) === String(selectedDepartmentId),
			);
			if (!exists || !selectedDepartmentId) {
				setSelectedDepartmentId(departmentsInView[0].id);
			}
		} else if (scopedDepartments.length > 0 && !selectedDepartmentId) {
			setSelectedDepartmentId(scopedDepartments[0].id);
		}
	}, [departmentsInView, scopedDepartments, selectedDepartmentId]);

	// Degree programs for the selected department
	const departmentPrograms = useMemo(() => {
		if (!selectedDepartmentId) return [];
		return programsData.filter(
			(p) => String(p.departmentId) === String(selectedDepartmentId),
		);
	}, [programsData, selectedDepartmentId]);

	// Program, Level, and Search State (Strictly degree program level - never "ALL")
	const [selectedProgramId, setSelectedProgramId] = useState<string | number>(
		"",
	);
	const [selectedLevel, setSelectedLevel] = useState<number>(100);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [currentWeek, setCurrentWeek] = useState<number>(1);

	// Synchronize selectedProgramId with available department programs
	useEffect(() => {
		if (departmentPrograms.length > 0) {
			const exists = departmentPrograms.some(
				(p) => String(p.id) === String(selectedProgramId),
			);
			if (!exists || !selectedProgramId || selectedProgramId === "ALL") {
				setSelectedProgramId(departmentPrograms[0].id);
			}
		} else {
			setSelectedProgramId("");
		}
	}, [departmentPrograms, selectedProgramId]);

	// Sync currentWeek with defaultCurrentWeek when semester is detected
	useEffect(() => {
		if (defaultCurrentWeek) {
			setCurrentWeek(defaultCurrentWeek);
		}
	}, [defaultCurrentWeek]);

	// Week range and day dates calculation
	const weekRange = useMemo(() => {
		return getWeekRange(semesterStartDate, currentWeek);
	}, [semesterStartDate, currentWeek]);

	const weekDayDates = useMemo(() => {
		return getWeekDayDates(weekRange.startDate);
	}, [weekRange]);

	const isCurrentWeekActive = currentWeek === defaultCurrentWeek;

	// Scope label for current user role
	const scopeLabel = useMemo(() => {
		return getAdminScopeLabel(
			user,
			departmentsData,
			facultiesData,
			selectedFacultyId,
		);
	}, [user, departmentsData, facultiesData, selectedFacultyId]);

	// Active Generation Runs Query for live published conflict report cross-referencing
	const { data: generationRuns = [] } = useQuery<TimetableGenerationRun[]>({
		queryKey: ["scheduling", "runs", activeSemester?.id],
		queryFn: () => getGenerationRuns({ semester: activeSemester?.id }),
		enabled: Boolean(activeSemester?.id),
	});

	const publishedRunSummary = useMemo(() => {
		return generationRuns.find((r) => r.isPublished);
	}, [generationRuns]);

	// Query full detail of the published run so full conflictReport.details are available
	const { data: publishedRunDetail } = useQuery<TimetableGenerationRun>({
		queryKey: ["scheduling", "runDetail", publishedRunSummary?.id],
		queryFn: () => getGenerationRunDetail(publishedRunSummary!.id),
		enabled: Boolean(publishedRunSummary?.id),
	});

	const activeConflictReport =
		publishedRunDetail?.conflictReport || publishedRunSummary?.conflictReport;

	// Department options for DepartmentLoopBar
	const departmentOptions: DepartmentOption[] = useMemo(() => {
		return departmentsInView.map((d) => ({
			id: d.id,
			name: d.name,
			code: d.code,
		}));
	}, [departmentsInView]);

	// Timetable Entries Query (filtered by active semester, department, program, level, and entry_type="lecture")
	const {
		data: entriesData,
		isLoading: entriesLoading,
		isRefetching: entriesRefetching,
		refetch: refetchEntries,
	} = useQuery<TimetableEntry[]>({
		queryKey: [
			"scheduling",
			"entries",
			activeSemester?.id,
			selectedDepartmentId,
			selectedProgramId,
			selectedLevel,
		],
		queryFn: () =>
			getTimetableEntries({
				semester: activeSemester?.id,
				department: selectedDepartmentId || undefined,
				program:
					selectedProgramId && selectedProgramId !== "ALL"
						? selectedProgramId
						: undefined,
				level: selectedLevel || undefined,
				entry_type: "lecture",
			}),
	});

	// Lecture Sessions Query (filtered by week date range, active semester, department, program, level)
	const {
		data: sessionsData,
		isLoading: sessionsLoading,
		isRefetching: sessionsRefetching,
		refetch: refetchSessions,
	} = useQuery<LectureSession[]>({
		queryKey: [
			"scheduling",
			"sessions",
			activeSemester?.id,
			selectedDepartmentId,
			selectedProgramId,
			selectedLevel,
			currentWeek,
			weekRange.startStr,
			weekRange.endStr,
		],
		queryFn: () =>
			getLectureSessions({
				semester: activeSemester?.id,
				department: selectedDepartmentId || undefined,
				program:
					selectedProgramId && selectedProgramId !== "ALL"
						? selectedProgramId
						: undefined,
				level: selectedLevel || undefined,
				start_date: weekRange.startStr,
				end_date: weekRange.endStr,
				entry_type: "lecture",
			}),
	});

	const isRefetching = entriesRefetching || sessionsRefetching;

	// Mutation: Create Timetable Entry
	const createEntryMutation = useMutation({
		mutationFn: (payload: CreateScheduleEntryPayload) =>
			createTimetableEntry(payload),
		onSuccess: (result) => {
			if (result.outcome === "PROCEED") {
				toast.success("Schedule entry created successfully!");
				setIsScheduleEntryOpen(false);
				queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
				queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
			} else if (result.outcome === "ROUTE_APPROVAL") {
				setIsScheduleEntryOpen(false);
				setConflictOutcome("ROUTE_APPROVAL");
				setConflictDetailMsg(result.message);
				setConflictsList([]);
				setIsConflictModalOpen(true);
				queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
			} else if (result.outcome === "HARD_REJECT") {
				setConflictOutcome("HARD_REJECT");
				setConflictDetailMsg(result.detail);
				setConflictsList(
					result.conflicts.map((c) => ({
						type: c.type || "VENUE_CLASH",
						venueName: c.venue_name,
						date: c.date,
						startTime: c.start_time,
						endTime: c.end_time,
						conflictingTitle: c.conflicting_title,
					})),
				);
				setIsConflictModalOpen(true);
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create schedule entry.");
		},
	});

	// Mutation: Shift a single session instance
	const shiftSessionMutation = useMutation({
		mutationFn: ({
			id,
			venue,
			startTime,
			endTime,
		}: {
			id: string;
			venue?: string;
			startTime?: string;
			endTime?: string;
		}) =>
			updateLectureSessionAPI(id, {
				venue: venue ? Number(venue) : undefined,
				session_start_time: startTime,
				session_end_time: endTime,
				status: "shifted",
			}),
		onSuccess: () => {
			toast.success("Session instance shifted successfully.");
			setSelectedSessionForShift(null);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to shift session.");
		},
	});

	// Navigation handlers
	const handlePreviousWeek = () => {
		setCurrentWeek((prev) => Math.max(1, prev - 1));
	};

	const handleNextWeek = () => {
		setCurrentWeek((prev) => Math.min(totalWeeks, prev + 1));
	};

	const handleResetToCurrentWeek = () => {
		setCurrentWeek(defaultCurrentWeek);
	};

	const handleManualRefresh = () => {
		refetchEntries();
		refetchSessions();
		queryClient.invalidateQueries({ queryKey: ["scheduling", "runs"] });
		queryClient.invalidateQueries({ queryKey: ["scheduling", "runDetail"] });
		toast.info("Refreshing schedule data...");
	};

	const handleOpenScheduleEntry = (
		defaultDay?: string,
		defaultSlot?: { start: string; end: string },
	) => {
		setScheduleEntryDefaults({
			day: defaultDay,
			startTime: defaultSlot?.start,
			endTime: defaultSlot?.end,
		});
		setIsScheduleEntryOpen(true);
	};

	const handleCreateScheduleEntrySubmit = (data: Record<string, any>) => {
		createEntryMutation.mutate({
			entry_type: (data.entryType as "lecture" | "exam" | "event") || "lecture",
			title: data.title as string | undefined,
			course: data.courseId as string,
			venue: data.venueId as string,
			start_time: data.startTime as string,
			end_time: data.endTime as string,
			recurrence_rule: data.recurrenceRule as string | undefined,
			recurrence_start_date: data.startDate as string | undefined,
			recurrence_end_date: data.endDate as string | undefined,
			semester: data.semesterId as string | undefined,
			program: data.targetProgramId as string | undefined,
		});
	};

	const handleShiftSessionSubmit = (data: {
		venueId: string;
		startTime: string;
		endTime: string;
	}) => {
		if (!selectedSessionForShift) return;
		shiftSessionMutation.mutate({
			id: selectedSessionForShift.id,
			venue: data.venueId,
			startTime: data.startTime,
			endTime: data.endTime,
		});
	};

	const handleGenerationCompleted = (run: TimetableGenerationRun) => {
		setActiveGenerationRun(run);
		setIsReportModalOpen(true);
	};

	const handlePublishSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
		queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
		queryClient.invalidateQueries({ queryKey: ["scheduling", "runs"] });
		queryClient.invalidateQueries({ queryKey: ["scheduling", "runDetail"] });
		refetchEntries();
		refetchSessions();
	};

	const handleSelectHistoryRun = (run: TimetableGenerationRun) => {
		setIsHistoryModalOpen(false);
		navigate({
			to: "/schedules/generator/$runId",
			params: { runId: run.id },
		});
	};

	return (
		<>
			<SchedulesView
				entries={entriesData}
				entriesLoading={entriesLoading}
				sessions={sessionsData}
				sessionsLoading={sessionsLoading}
				isRefetching={isRefetching}
				faculties={scopedFaculties}
				selectedFacultyId={selectedFacultyId}
				onSelectFaculty={setSelectedFacultyId}
				departments={departmentOptions}
				selectedDepartmentId={selectedDepartmentId}
				onSelectDepartment={setSelectedDepartmentId}
				departmentPrograms={departmentPrograms}
				selectedProgramId={selectedProgramId}
				onSelectProgram={setSelectedProgramId}
				selectedLevel={selectedLevel}
				onSelectLevel={setSelectedLevel}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				currentWeek={currentWeek}
				totalWeeks={totalWeeks}
				onPreviousWeek={handlePreviousWeek}
				onNextWeek={handleNextWeek}
				onResetToCurrentWeek={handleResetToCurrentWeek}
				isCurrentWeekActive={isCurrentWeekActive}
				weekRange={weekRange}
				weekDayDates={weekDayDates}
				activeSemester={activeSemester}
				conflictReport={activeConflictReport}
				onManualRefresh={handleManualRefresh}
				onOpenScheduleEntry={handleOpenScheduleEntry}
				onShiftSessionTrigger={(s) => setSelectedSessionForShift(s)}
				onOpenGenerator={() => setIsGenerateModalOpen(true)}
				onOpenHistory={() => setIsHistoryModalOpen(true)}
				onOpenPermissions={() => setIsPermissionsModalOpen(true)}
				canGenerate={canGenerate}
				canConfigurePermissions={canConfigurePermissions}
				isDeptAdmin={isDeptAdmin}
				isFacultyAdmin={isFacultyAdmin}
				isSchoolAdmin={isSchoolAdmin}
				isSuperuser={isSuperuser}
				scopeLabel={scopeLabel}
			/>

			<GenerateTimetableModal
				isOpen={isGenerateModalOpen}
				onClose={() => setIsGenerateModalOpen(false)}
				onGenerationComplete={handleGenerationCompleted}
				semesters={semestersData}
				activeSemester={activeSemester}
				schools={schoolsData}
				faculties={facultiesData}
				departments={departmentsData}
				allowFacultyGeneration={allowFacultyGen}
				allowDepartmentGeneration={allowDeptGen}
			/>

			<GenerationReportModal
				isOpen={isReportModalOpen}
				onClose={() => setIsReportModalOpen(false)}
				run={activeGenerationRun}
				onPublishSuccess={handlePublishSuccess}
			/>

			<GenerationHistoryModal
				isOpen={isHistoryModalOpen}
				onClose={() => setIsHistoryModalOpen(false)}
				semesterId={activeSemester?.id}
				onSelectRun={handleSelectHistoryRun}
			/>

			<GenerationPermissionsModal
				isOpen={isPermissionsModalOpen}
				onClose={() => setIsPermissionsModalOpen(false)}
				schoolId={userSchoolId}
			/>

			<ScheduleEntryModal
				isOpen={isScheduleEntryOpen}
				onClose={() => setIsScheduleEntryOpen(false)}
				onSubmit={handleCreateScheduleEntrySubmit}
				courses={coursesData}
				venues={venuesData}
				semesters={semestersData}
				programs={programsData}
				defaultDay={scheduleEntryDefaults.day}
				defaultStartTime={scheduleEntryDefaults.startTime}
				defaultEndTime={scheduleEntryDefaults.endTime}
			/>

			<SessionShiftModal
				isOpen={Boolean(selectedSessionForShift)}
				onClose={() => setSelectedSessionForShift(null)}
				onSubmit={handleShiftSessionSubmit}
				session={selectedSessionForShift}
				venues={venuesData}
			/>

			{conflictOutcome && (
				<ConflictFeedbackModal
					isOpen={isConflictModalOpen}
					onClose={() => setIsConflictModalOpen(false)}
					outcomeType={conflictOutcome}
					detailMessage={conflictDetailMsg}
					conflicts={conflictsList}
				/>
			)}
		</>
	);
}
