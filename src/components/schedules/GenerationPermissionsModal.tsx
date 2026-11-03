import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock } from "lucide-react";
import type { GenerationScopePermission } from "@/types";
import {
	getGenerationPermissions,
	updateGenerationPermissions,
} from "@/api/main/generationAPI";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface GenerationPermissionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	schoolId?: string;
}

export function GenerationPermissionsModal({
	isOpen,
	onClose,
	schoolId,
}: GenerationPermissionsModalProps) {
	const { user } = useAuth();
	const isSchoolAdmin = user?.role === "admin" && user?.adminLevel === "school";
	const queryClient = useQueryClient();

	const { data: permission, isLoading } = useQuery<GenerationScopePermission>({
		queryKey: ["scheduling", "generationPermissions", schoolId],
		queryFn: () => getGenerationPermissions(schoolId),
		enabled: isOpen && Boolean(schoolId),
	});

	const [allowFaculty, setAllowFaculty] = useState(false);
	const [allowDept, setAllowDept] = useState(false);
	const [allowFacultyExam, setAllowFacultyExam] = useState(false);
	const [allowDeptExam, setAllowDeptExam] = useState(false);

	useEffect(() => {
		if (permission) {
			setAllowFaculty(Boolean(permission.allowFacultyGeneration));
			setAllowDept(Boolean(permission.allowDepartmentGeneration));
			setAllowFacultyExam(Boolean(permission.allowFacultyExamGeneration));
			setAllowDeptExam(Boolean(permission.allowDepartmentExamGeneration));
		}
	}, [permission]);

	const updateMutation = useMutation({
		mutationFn: () =>
			updateGenerationPermissions({
				school: schoolId!,
				allow_faculty_generation: allowFaculty,
				allow_department_generation: allowDept,
				allow_faculty_exam_generation: allowFacultyExam,
				allow_department_exam_generation: allowDeptExam,
			}),
		onSuccess: () => {
			toast.success("Generation permissions updated successfully.");
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "generationPermissions"],
			});
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "exam-optimizer-access"],
			});
			onClose();
		},
		onError: (err: any) => {
			toast.error(
				err?.response?.data?.error || "Failed to update permissions.",
			);
		},
	});

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				<div className="flex items-center gap-2">
					<ShieldCheck size={18} className="text-primary" />
					<span className="font-bold text-base text-text-main">
						Timetable Generation Scope Permissions
					</span>
				</div>
			}
			description="Configure decentralized timetable generation privileges for faculties and departments across lecture and exam scheduling."
			size="md"
		>
			<div className="space-y-4 pt-1">
				{!isSchoolAdmin && (
					<div className="p-3 rounded-xl bg-surface-raised border border-border text-text-muted text-xs flex items-center gap-2">
						<Lock size={14} className="shrink-0" />
						<span>
							View-only mode. Only School Administrators can modify
							scope generation policies.
						</span>
					</div>
				)}

				{isLoading ? (
					<div className="py-8 text-center text-xs text-text-muted animate-pulse">
						Loading permissions...
					</div>
				) : (
					<div className="space-y-4">
						{/* Group 1: Lecture Timetable Generation */}
						<div className="space-y-2">
							<div className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
								Lecture Timetable Generation
							</div>

							{/* Faculty Toggle */}
							<div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3">
								<div className="space-y-0.5">
									<p className="text-xs font-semibold text-text-main">
										Faculty-Level Lecture Generation
									</p>
									<p className="text-[11px] text-text-muted">
										Allow faculty administrators to generate and test
										faculty-scoped lecture timetables.
									</p>
								</div>
								<input
									type="checkbox"
									checked={allowFaculty}
									onChange={(e) => setAllowFaculty(e.target.checked)}
									disabled={!isSchoolAdmin || updateMutation.isPending}
									className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer disabled:cursor-not-allowed"
								/>
							</div>

							{/* Department Toggle */}
							<div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3">
								<div className="space-y-0.5">
									<p className="text-xs font-semibold text-text-main">
										Department-Level Lecture Generation
									</p>
									<p className="text-[11px] text-text-muted">
										Allow department administrators to generate and test
										department-scoped lecture timetables.
									</p>
								</div>
								<input
									type="checkbox"
									checked={allowDept}
									onChange={(e) => setAllowDept(e.target.checked)}
									disabled={!isSchoolAdmin || updateMutation.isPending}
									className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer disabled:cursor-not-allowed"
								/>
							</div>
						</div>

						{/* Group 2: Examination Timetable Generation */}
						<div className="space-y-2 pt-2 border-t border-border">
							<div className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
								Examination Timetable Generation
							</div>

							{/* Faculty Exam Toggle */}
							<div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3">
								<div className="space-y-0.5">
									<p className="text-xs font-semibold text-text-main">
										Faculty-Level Exam Generation
									</p>
									<p className="text-[11px] text-text-muted">
										Allow faculty exam officers to independently generate
										and optimize faculty exam timetables.
									</p>
								</div>
								<input
									type="checkbox"
									checked={allowFacultyExam}
									onChange={(e) => setAllowFacultyExam(e.target.checked)}
									disabled={!isSchoolAdmin || updateMutation.isPending}
									className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer disabled:cursor-not-allowed"
								/>
							</div>

							{/* Department Exam Toggle */}
							<div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3">
								<div className="space-y-0.5">
									<p className="text-xs font-semibold text-text-main">
										Department-Level Exam Generation
									</p>
									<p className="text-[11px] text-text-muted">
										Allow department exam officers to independently generate
										and optimize department exam timetables.
									</p>
								</div>
								<input
									type="checkbox"
									checked={allowDeptExam}
									onChange={(e) => setAllowDeptExam(e.target.checked)}
									disabled={!isSchoolAdmin || updateMutation.isPending}
									className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer disabled:cursor-not-allowed"
								/>
							</div>
						</div>
					</div>
				)}

				<div className="flex justify-end gap-2 pt-3 border-t border-border">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						className="cursor-pointer text-xs h-8"
					>
						{isSchoolAdmin ? "Cancel" : "Close"}
					</Button>

					{isSchoolAdmin && (
						<Button
							variant="primary"
							size="sm"
							onClick={() => updateMutation.mutate()}
							disabled={isLoading || updateMutation.isPending}
							className="cursor-pointer text-xs h-8"
						>
							{updateMutation.isPending ? "Saving..." : "Save Policy"}
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
}
