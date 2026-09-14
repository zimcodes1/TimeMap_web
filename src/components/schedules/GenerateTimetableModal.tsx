import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Sparkles, Settings2, AlertTriangle, Cpu } from "lucide-react";
import type {
	Semester,
	School,
	Faculty,
	Department,
	TimetableGenerationRun,
	GenerateTimetablePayload,
} from "@/types";
import { generateTimetable } from "@/api/main/generationAPI";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface GenerateTimetableModalProps {
	isOpen: boolean;
	onClose: () => void;
	onGenerationComplete: (run: TimetableGenerationRun) => void;
	semesters: Semester[];
	activeSemester?: Semester;
	schools?: School[];
	faculties?: Faculty[];
	departments?: Department[];
	allowFacultyGeneration?: boolean;
	allowDepartmentGeneration?: boolean;
}

export function GenerateTimetableModal({
	isOpen,
	onClose,
	onGenerationComplete,
	semesters,
	activeSemester,
	schools = [],
	faculties = [],
	departments = [],
	allowFacultyGeneration = false,
	allowDepartmentGeneration = false,
}: GenerateTimetableModalProps) {
	const { user } = useAuth();
	const isSuperuser =
		user?.role === "admin" && user?.adminLevel === "university";
	const isSchoolAdmin = user?.role === "admin" && user?.adminLevel === "school";
	const isFacultyAdmin =
		user?.role === "admin" && user?.adminLevel === "faculty";
	const isDeptAdmin =
		user?.role === "admin" && user?.adminLevel === "department";

	const [semesterId, setSemesterId] = useState<string>("");
	const [scopeType, setScopeType] = useState<
		"school" | "faculty" | "department"
	>("school");
	const [scopeId, setScopeId] = useState<string>("");

	// Advanced optimizer parameters
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [populationSize, setPopulationSize] = useState<number>(100);
	const [maxGenerations, setMaxGenerations] = useState<number>(300);
	const [mutationRate, setMutationRate] = useState<number>(0.15);
	const [stagnationLimit, setStagnationLimit] = useState<number>(40);

	const [isGenerating, setIsGenerating] = useState(false);

	// Initialize semester
	useEffect(() => {
		if (activeSemester?.id) {
			setSemesterId(activeSemester.id);
		} else if (semesters.length > 0 && !semesterId) {
			const active = semesters.find((s) => s.isActive) || semesters[0];
			setSemesterId(active.id);
		}
	}, [activeSemester, semesters, semesterId]);

	// Initialize scope based on user role
	useEffect(() => {
		if (isSchoolAdmin) {
			setScopeType("school");
			const sId = user?.adminScopeId || user?.schoolId || schools[0]?.id || "";
			setScopeId(String(sId));
		} else if (isFacultyAdmin) {
			setScopeType("faculty");
			const fId =
				user?.adminScopeId || user?.facultyId || faculties[0]?.id || "";
			setScopeId(String(fId));
		} else if (isDeptAdmin) {
			setScopeType("department");
			const dId =
				user?.adminScopeId || user?.departmentId || departments[0]?.id || "";
			setScopeId(String(dId));
		} else if (isSuperuser && schools.length > 0 && !scopeId) {
			setScopeType("school");
			setScopeId(schools[0].id);
		}
	}, [
		isSchoolAdmin,
		isFacultyAdmin,
		isDeptAdmin,
		isSuperuser,
		user,
		schools,
		faculties,
		departments,
		scopeId,
	]);

	// Check if current user has permission to generate
	const hasPermission = () => {
		if (isSuperuser || isSchoolAdmin) return true;
		if (isFacultyAdmin && allowFacultyGeneration) return true;
		if (isDeptAdmin && allowDepartmentGeneration) return true;
		return false;
	};

	const getPermissionNotice = () => {
		if (isFacultyAdmin && !allowFacultyGeneration) {
			return "Faculty-level generation is currently disabled by system policy. Only school-level admins can run timetable generation.";
		}
		if (isDeptAdmin && !allowDepartmentGeneration) {
			return "Department-level generation is currently disabled by system policy. Only school-level admins can run timetable generation.";
		}
		return null;
	};

	const handleScopeTypeChange = (
		newType: "school" | "faculty" | "department",
	) => {
		setScopeType(newType);
		if (newType === "school") {
			setScopeId(user?.schoolId || schools[0]?.id || "");
		} else if (newType === "faculty") {
			setScopeId(faculties[0]?.id || "");
		} else {
			setScopeId(departments[0]?.id || "");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!semesterId) {
			toast.error("Please select an academic semester.");
			return;
		}
		if (!scopeId) {
			toast.error("Please select a target scope.");
			return;
		}

		const payload: GenerateTimetablePayload = {
			semester: semesterId,
			scope_type: scopeType,
			scope_id: scopeId,
			population_size: Number(populationSize) || 100,
			max_generations: Number(maxGenerations) || 300,
			mutation_rate: Number(mutationRate) || 0.15,
			stagnation_limit: Number(stagnationLimit) || 40,
			publish_immediately: false, // Must be reviewed first!
		};

		setIsGenerating(true);
		try {
			const run = await generateTimetable(payload);
			toast.success("Timetable generated successfully!");
			onClose();
			onGenerationComplete(run);
		} catch (err: any) {
			const errorMsg =
				err?.response?.data?.error ||
				err?.response?.data?.detail ||
				err?.message ||
				"Failed to generate timetable.";
			toast.error(errorMsg);
		} finally {
			setIsGenerating(false);
		}
	};

	const permissionNotice = getPermissionNotice();

	return (
		<Modal
			isOpen={isOpen}
			onClose={isGenerating ? () => {} : onClose}
			title={
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
						<Sparkles size={18} />
					</div>
					<div>
						<span className="font-bold text-base text-text-main">
							Automated Timetable Generator
						</span>
					</div>
				</div>
			}
			description="Run the Genetic Algorithm timetable scheduler to generate clash-free lecture schedules for the semester."
			size="lg"
		>
			{permissionNotice ? (
				<div className="p-4 rounded-xl bg-danger-surface border border-danger/30 text-danger flex items-start gap-3 my-2">
					<AlertTriangle size={20} className="shrink-0 mt-0.5" />
					<div className="space-y-1 text-xs">
						<p className="font-bold">Generation Permission Restricted</p>
						<p className="text-text-muted">{permissionNotice}</p>
					</div>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-4 pt-1">
					{/* Target Semester */}
					<div className="space-y-1">
						<Text variant="caption" className="font-semibold block">
							Target Semester
						</Text>
						<Select
							value={semesterId}
							onChange={(e) => setSemesterId(e.target.value)}
							disabled={isGenerating}
							options={semesters.map((s) => ({
								value: s.id,
								label: `${s.displayName || (s.name === "first" ? "First Semester" : "Second Semester")}${s.isActive ? " (Active)" : ""}`,
							}))}
						/>
					</div>

					{/* Scope Level Selector (If School Admin or Superuser) */}
					{(isSchoolAdmin || isSuperuser) && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="space-y-1">
								<Text variant="caption" className="font-semibold block">
									Generation Scope Level
								</Text>
								<Select
									value={scopeType}
									onChange={(e) =>
										handleScopeTypeChange(
											e.target.value as "school" | "faculty" | "department",
										)
									}
									disabled={isGenerating}
									options={[
										{ value: "school", label: "School-Wide (All Programs)" },
										{ value: "faculty", label: "Faculty Scoped" },
										{ value: "department", label: "Department Scoped" },
									]}
								/>
							</div>

							<div className="space-y-1">
								<Text variant="caption" className="font-semibold block">
									{scopeType === "school"
										? "Target School"
										: scopeType === "faculty"
											? "Target Faculty"
											: "Target Department"}
								</Text>

								{scopeType === "school" && (
									<Select
										value={scopeId}
										onChange={(e) => setScopeId(e.target.value)}
										disabled={isGenerating || schools.length <= 1}
										options={schools.map((s) => ({
											value: s.id,
											label: `${s.code} - ${s.name}`,
										}))}
									/>
								)}

								{scopeType === "faculty" && (
									<Select
										value={scopeId}
										onChange={(e) => setScopeId(e.target.value)}
										disabled={isGenerating}
										options={faculties.map((f) => ({
											value: f.id,
											label: `${f.code} - ${f.name}`,
										}))}
									/>
								)}

								{scopeType === "department" && (
									<Select
										value={scopeId}
										onChange={(e) => setScopeId(e.target.value)}
										disabled={isGenerating}
										options={departments.map((d) => ({
											value: d.id,
											label: `${d.code} - ${d.name}`,
										}))}
									/>
								)}
							</div>
						</div>
					)}

					{/* Scope indicator if scoped admin */}
					{!isSchoolAdmin && !isSuperuser && (
						<div className="p-3 bg-surface-raised border border-border rounded-xl text-xs flex items-center justify-between">
							<span className="text-text-muted">Target Scope:</span>
							<span className="font-semibold text-text-main">
								{user?.adminScopeName ||
									user?.departmentName ||
									user?.facultyName ||
									scopeType}{" "}
								({scopeType.toUpperCase()})
							</span>
						</div>
					)}

					{/* Advanced Optimizer Settings Accordion */}
					<div className="border border-border rounded-xl p-3 bg-surface-raised/40 space-y-3">
						<button
							type="button"
							onClick={() => setShowAdvanced((prev) => !prev)}
							disabled={isGenerating}
							className="w-full flex items-center justify-between text-xs font-semibold text-text-main cursor-pointer hover:text-primary transition-colors"
						>
							<div className="flex items-center gap-1.5">
								<Settings2 size={14} className="text-text-muted" />
								<span>Optimizer Hyperparameters (Advanced)</span>
							</div>
							<span className="text-[10px] text-text-muted">
								{showAdvanced ? "Hide" : "Show"}
							</span>
						</button>

						{showAdvanced && (
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
								<div className="space-y-1">
									<label className="text-[11px] text-text-muted block">
										Population
									</label>
									<Input
										type="number"
										min={10}
										max={300}
										value={populationSize}
										onChange={(e) => setPopulationSize(Number(e.target.value))}
										disabled={isGenerating}
										className="h-8 text-xs"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[11px] text-text-muted block">
										Max Generations
									</label>
									<Input
										type="number"
										min={20}
										max={1000}
										value={maxGenerations}
										onChange={(e) => setMaxGenerations(Number(e.target.value))}
										disabled={isGenerating}
										className="h-8 text-xs"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[11px] text-text-muted block">
										Mutation Rate
									</label>
									<Input
										type="number"
										step={0.01}
										min={0.01}
										max={1.0}
										value={mutationRate}
										onChange={(e) => setMutationRate(Number(e.target.value))}
										disabled={isGenerating}
										className="h-8 text-xs"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[11px] text-text-muted block">
										Stagnation
									</label>
									<Input
										type="number"
										min={10}
										max={200}
										value={stagnationLimit}
										onChange={(e) => setStagnationLimit(Number(e.target.value))}
										disabled={isGenerating}
										className="h-8 text-xs"
									/>
								</div>
							</div>
						)}
					</div>

					{/* Running State Banner */}
					{isGenerating && (
						<div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2 animate-pulse">
							<div className="flex items-center gap-2 text-primary font-semibold text-xs">
								<Cpu size={16} className="animate-spin" />
								<span>Genetic Algorithm Optimizer is executing...</span>
							</div>
							<p className="text-[11px] text-text-muted leading-relaxed">
								Evaluating candidate timetables across 24 academic lecture
								slots. Enforcing zero student cohort clashes, zero lecturer
								double-bookings, zero venue conflicts, distinct days for
								multi-session courses, and max 3 lectures/day per program
								cohort.
							</p>
						</div>
					)}

					{/* Footer Actions */}
					<div className="flex justify-end gap-2 pt-3 border-t border-border">
						<Button
							variant="outline"
							type="button"
							onClick={onClose}
							disabled={isGenerating}
							className="cursor-pointer text-xs h-9"
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							type="submit"
							disabled={isGenerating || !hasPermission()}
							className="cursor-pointer gap-2 text-xs h-9"
						>
							<Sparkles size={14} />
							<span>
								{isGenerating ? "Optimizing Schedule..." : "Run Generator"}
							</span>
						</Button>
					</div>
				</form>
			)}
		</Modal>
	);
}
