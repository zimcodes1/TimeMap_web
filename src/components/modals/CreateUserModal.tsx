import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { AlertTriangle } from "lucide-react";
import type {
	User,
	UserRole,
	Department,
	Faculty,
	School,
	Program,
	AdminLevel,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";
import {
	filterDepartmentsByScope,
	filterFacultiesByScope,
	filterSchoolsByScope,
} from "@/lib/scopeUtils";

interface CreateUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		data: Partial<User> & { scopeId?: string },
	) => void | Promise<void>;
	departments: Department[];
	faculties?: Faculty[];
	schools?: School[];
	programs?: Program[];
	initialData?: User | null;
}

export default function CreateUserModal({
	isOpen,
	onClose,
	onSubmit,
	departments,
	faculties = [],
	schools = [],
	programs = [],
	initialData,
}: CreateUserModalProps) {
	const { user: currentUser } = useAuth();
	const currentAdminLevel = currentUser?.adminLevel;
	const isDeptAdmin =
		currentUser?.role === "admin" && currentAdminLevel === "department";
	const isFacultyAdmin =
		currentUser?.role === "admin" && currentAdminLevel === "faculty";
	const isSchoolAdmin =
		currentUser?.role === "admin" && currentAdminLevel === "school";

	const scopedDepts = useMemo(
		() => filterDepartmentsByScope(departments, currentUser, faculties),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			departments,
			faculties,
			currentUser?.id,
			currentUser?.adminLevel,
			currentUser?.adminScopeId,
		],
	);
	const scopedFacs = useMemo(
		() => filterFacultiesByScope(faculties, currentUser, departments),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			faculties,
			departments,
			currentUser?.id,
			currentUser?.adminLevel,
			currentUser?.adminScopeId,
		],
	);
	const scopedSchs = useMemo(
		() => filterSchoolsByScope(schools, currentUser),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			schools,
			currentUser?.id,
			currentUser?.adminLevel,
			currentUser?.adminScopeId,
		],
	);

	const [name, setName] = useState(initialData?.name || "");
	const [email, setEmail] = useState(initialData?.email || "");
	const [identifier, setIdentifier] = useState(initialData?.identifier || "");
	const [role, setRole] = useState<UserRole | "">(initialData?.role || "");

	// Admin Scope Level & Selected Scope ID
	const [adminLevel, setAdminLevel] = useState<AdminLevel | "">(
		initialData?.adminLevel || "",
	);
	const [scopeId, setScopeId] = useState<string>(
		initialData?.departmentId || initialData?.adminScopeId || "",
	);

	// Student specific fields
	const [programId, setProgramId] = useState<string>(
		initialData?.programId || "",
	);
	const [level, setLevel] = useState<string>(
		initialData?.level ? String(initialData.level) : "",
	);
	const [isClassRep, setIsClassRep] = useState(
		initialData?.isClassRep || false,
	);

	// Form Validation & API Error States
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formError, setFormError] = useState<string | null>(null);

	// Reset or Sync fields when modal opens/closes or initialData changes
	useEffect(() => {
		if (isOpen) {
			setName(initialData?.name || "");
			setEmail(initialData?.email || "");
			setIdentifier(initialData?.identifier || "");

			const defaultRole: UserRole | "" = isDeptAdmin
				? "student"
				: isFacultyAdmin || isSchoolAdmin || currentAdminLevel === "university"
					? "admin"
					: "";
			setRole(initialData?.role || defaultRole);

			const defaultAdminLevel: AdminLevel | "" = isFacultyAdmin
				? "department"
				: isSchoolAdmin
					? "faculty"
					: currentAdminLevel === "university"
						? "school"
						: "";
			setAdminLevel(initialData?.adminLevel || defaultAdminLevel);

			let matchedScopeId =
				initialData?.departmentId ||
				(initialData as { department_id?: string | number } | undefined)
					?.department_id ||
				initialData?.adminScopeId ||
				"";

			if (isDeptAdmin && scopedDepts.length > 0) {
				matchedScopeId = scopedDepts[0].id;
			} else if (isFacultyAdmin && scopedDepts.length > 0 && !matchedScopeId) {
				matchedScopeId = scopedDepts[0].id;
			} else if (isSchoolAdmin && scopedFacs.length > 0 && !matchedScopeId) {
				matchedScopeId = scopedFacs[0].id;
			} else if (
				currentAdminLevel === "university" &&
				scopedSchs.length > 0 &&
				!matchedScopeId
			) {
				matchedScopeId = scopedSchs[0].id;
			} else if (matchedScopeId) {
				const foundById = scopedDepts.find(
					(d) => String(d.id) === String(matchedScopeId),
				);
				if (foundById) matchedScopeId = foundById.id;
			}

			setScopeId(String(matchedScopeId));
			setProgramId(initialData?.programId || "");
			setLevel(initialData?.level ? String(initialData.level) : "");
			setIsClassRep(initialData?.isClassRep || isDeptAdmin);
			setErrors({});
			setFormError(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, initialData]);

	// Compute selected department & dynamic max level
	const selectedDept = scopedDepts.find((d) => d.id === scopeId);
	const deptMaxLevel = selectedDept?.max_level || selectedDept?.maxLevel || 400;

	// Available Programs for the selected department
	const availablePrograms = useMemo(() => {
		if (!scopeId) return [];
		if (selectedDept?.programs && selectedDept.programs.length > 0)
			return selectedDept.programs;
		return programs.filter((p) => String(p.departmentId) === String(scopeId));
	}, [scopeId, selectedDept, programs]);

	const selectedProgram = availablePrograms.find(
		(p) => String(p.id) === String(programId),
	);
	const effectiveMaxLevel = selectedProgram?.maxLevel || deptMaxLevel;

	// Auto-pick default program when department changes or available programs load
	useEffect(() => {
		if (role === "student" && availablePrograms.length > 0) {
			if (!availablePrograms.some((p) => String(p.id) === String(programId))) {
				const def =
					availablePrograms.find((p) => p.isDefault) || availablePrograms[0];
				setProgramId(def.id);
			}
		}
	}, [role, availablePrograms, programId]);

	// Generate level options up to effective max level
	const availableLevels: Array<{
		value: string;
		label: string;
		disabled?: boolean;
	}> = [{ value: "", label: "-- Select Academic Level --", disabled: true }];
	for (let lvl = 100; lvl <= effectiveMaxLevel; lvl += 100) {
		availableLevels.push({ value: String(lvl), label: `${lvl} Level` });
	}

	// When effectiveMaxLevel changes for student, ensure level doesn't exceed it
	useEffect(() => {
		if (role === "student" && level && Number(level) > effectiveMaxLevel) {
			setLevel("");
			setErrors((prev) => ({
				...prev,
				level: `Selected level exceeds maximum level (${effectiveMaxLevel}L) for ${selectedProgram?.name || selectedDept?.name || "department"}.`,
			}));
		}
	}, [
		effectiveMaxLevel,
		level,
		role,
		selectedDept?.name,
		selectedProgram?.name,
	]);

	const handleRoleChange = (newRole: UserRole) => {
		setRole(newRole);
		setAdminLevel("");
		setScopeId(isDeptAdmin && scopedDepts.length > 0 ? scopedDepts[0].id : "");
		setProgramId("");
		setLevel("");
		setIsClassRep(newRole === "student" && isDeptAdmin);
		setErrors((prev) => {
			const copy = { ...prev };
			delete copy.role;
			delete copy.adminLevel;
			delete copy.scopeId;
			delete copy.level;
			return copy;
		});
		setFormError(null);
	};

	const handleAdminLevelChange = (newLevel: AdminLevel) => {
		setAdminLevel(newLevel);
		setScopeId("");
		setErrors((prev) => {
			const copy = { ...prev };
			delete copy.adminLevel;
			delete copy.scopeId;
			return copy;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		const newErrors: Record<string, string> = {};

		// 1. Role Validation
		if (!role) {
			newErrors.role = "Please select a user account role.";
		}

		// 2. Identifier Validation
		if (!identifier.trim()) {
			newErrors.identifier =
				role === "student"
					? "Please enter student matric number."
					: "Please enter staff ID.";
		}

		// 3. Name Validation
		if (!name.trim()) {
			newErrors.name = "Please enter full name.";
		}

		// 4. Email Validation
		if (!email.trim()) {
			newErrors.email = "Please enter email address.";
		} else if (!/\S+@\S+\.\S+/.test(email.trim())) {
			newErrors.email = "Please enter a valid email address.";
		}

		// 5. Role-Specific Validations
		if (role === "admin") {
			if (!adminLevel) {
				newErrors.adminLevel = "Please select an admin scope level.";
			}
			if (!scopeId) {
				newErrors.scopeId = "Please select an assigned scope entity.";
			}
		} else if (role === "lecturer" || role === "student") {
			if (!scopeId) {
				newErrors.scopeId = "Please select a department.";
			}
		}

		if (role === "student") {
			if (!level) {
				newErrors.level = "Please select an academic level.";
			} else if (Number(level) > effectiveMaxLevel) {
				newErrors.level = `Level ${level}L exceeds maximum level (${effectiveMaxLevel}L).`;
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			setFormError(
				"Form submission failed. Please complete all required fields correctly.",
			);
			return;
		}

		try {
			if (role === "admin") {
				await onSubmit({
					name: name.trim(),
					email: email.trim(),
					identifier: identifier.trim().toUpperCase(),
					role: "admin",
					adminLevel: adminLevel as AdminLevel,
					scopeId,
					departmentId: adminLevel === "department" ? scopeId : undefined,
					isActive: true,
					requiresPasswordReset: true,
				});
			} else {
				await onSubmit({
					name: name.trim(),
					email: email.trim(),
					identifier: identifier.trim().toUpperCase(),
					role: role as UserRole,
					departmentId: scopeId,
					departmentName: selectedDept?.name,
					programId: programId || undefined,
					programName: selectedProgram?.name,
					programCode: selectedProgram?.code,
					level: Number(level),
					isClassRep,
					isActive: true,
					requiresPasswordReset: true,
				});
			}
			onClose();
		} catch (err: unknown) {
			if (typeof err === "object" && err !== null && "response" in err) {
				const res = (
					err as { response?: { data?: Record<string, string | string[]> } }
				).response;
				if (res?.data) {
					const apiErrors: Record<string, string> = {};
					Object.entries(res.data).forEach(([key, val]) => {
						const msg = Array.isArray(val) ? val.join(" ") : String(val);
						apiErrors[key] = msg;
					});
					setErrors(apiErrors);
					setFormError(
						"Failed to save user account. Please resolve the errors below.",
					);
					return;
				}
			}
			setFormError(
				err instanceof Error
					? err.message
					: "An unexpected error occurred during creation.",
			);
		}
	};

	const roleSelectOptions =
		isFacultyAdmin || isSchoolAdmin || currentAdminLevel === "university"
			? [{ value: "admin", label: "Admin Officer" }]
			: isDeptAdmin
				? [
						{ value: "student", label: "Class Representative" },
						{ value: "lecturer", label: "Lecturer / Teaching Staff" },
					]
				: [
						{ value: "", label: "-- Select User Role --", disabled: true },
						{ value: "student", label: "Class Representative" },
						{ value: "lecturer", label: "Lecturer / Teaching Staff" },
						{ value: "admin", label: "Admin Officer" },
					];

	const adminLevelSelectOptions = isFacultyAdmin
		? [{ value: "department", label: "Department Admin" }]
		: isSchoolAdmin
			? [{ value: "faculty", label: "Faculty Admin" }]
			: currentAdminLevel === "university"
				? [{ value: "school", label: "School Admin" }]
				: [
						{ value: "", label: "-- Select Scope Level --", disabled: true },
						{ value: "department", label: "Department Admin" },
						{ value: "faculty", label: "Faculty Admin" },
						{ value: "school", label: "School Admin" },
						{ value: "university", label: "University Admin" },
					];

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={initialData ? "Edit User Account" : "Create User Account"}
			description="Register student, lecturer, or admin officer credentials with exact scope permissions."
			size="lg"
			footer={
				<>
					<Button
						variant="outline"
						onClick={onClose}
						className="cursor-pointer"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleSubmit}
						className="cursor-pointer"
					>
						{initialData ? "Save User" : "Create Account"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Error Alert Banner */}
				{formError && (
					<div className="p-3 rounded-xl bg-danger/10 border border-danger/30 flex items-start gap-2 text-xs text-danger font-medium animate-in fade-in duration-200">
						<AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
						<div className="flex-1">{formError}</div>
					</div>
				)}

				{/* Row 1: Role & Identifier */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<Select
							label="User Role *"
							value={role}
							error={errors.role}
							onChange={(e) => handleRoleChange(e.target.value as UserRole)}
							options={roleSelectOptions}
						/>
					</div>
					<div>
						<Text
							variant="caption"
							className="font-semibold mb-1 block text-text-muted"
						>
							{role === "student"
								? "Matric Number *"
								: role === "lecturer" || role === "admin"
									? "Staff ID *"
									: "Unique Identifier *"}
						</Text>
						<Input
							placeholder={
								role === "student"
									? "Matric Number (e.g. NSUK/CSC/2021/001)"
									: "Staff ID (e.g. NSUK/STAFF/0100)"
							}
							value={identifier}
							onChange={(e) => {
								setIdentifier(e.target.value);
								if (errors.identifier)
									setErrors((prev) => ({ ...prev, identifier: "" }));
							}}
						/>
						{errors.identifier && (
							<span className="text-xs text-danger font-medium mt-1 block">
								{errors.identifier}
							</span>
						)}
					</div>
				</div>

				{/* Row 2: Full Name & Email */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<Text
							variant="caption"
							className="font-semibold mb-1 block text-text-muted"
						>
							Full Name *
						</Text>
						<Input
							placeholder="e.g. Alice Smith"
							value={name}
							onChange={(e) => {
								setName(e.target.value);
								if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
							}}
						/>
						{errors.name && (
							<span className="text-xs text-danger font-medium mt-1 block">
								{errors.name}
							</span>
						)}
					</div>
					<div>
						<Text
							variant="caption"
							className="font-semibold mb-1 block text-text-muted"
						>
							Email Address *
						</Text>
						<Input
							type="email"
							placeholder="e.g. alice.smith@nsuk.edu.ng"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
							}}
						/>
						{errors.email && (
							<span className="text-xs text-danger font-medium mt-1 block">
								{errors.email}
							</span>
						)}
					</div>
				</div>

				{/* Admin Specific Section: Level FIRST, Scope Entity SECOND */}
				{role === "admin" && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<Select
								label="Admin Scope Level *"
								value={adminLevel}
								error={errors.adminLevel}
								onChange={(e) =>
									handleAdminLevelChange(e.target.value as AdminLevel)
								}
								options={adminLevelSelectOptions}
							/>
						</div>

						<div>
							<Select
								label={
									adminLevel === "school"
										? "Assigned Scope School *"
										: adminLevel === "faculty"
											? "Assigned Scope Faculty *"
											: "Assigned Scope Department *"
								}
								value={scopeId}
								error={errors.scopeId}
								onChange={(e) => {
									setScopeId(e.target.value);
									if (errors.scopeId)
										setErrors((prev) => ({ ...prev, scopeId: "" }));
								}}
								options={
									!adminLevel
										? [
												{
													value: "",
													label: "-- Select Admin Scope Level First --",
													disabled: true,
												},
											]
										: adminLevel === "school"
											? [
													{
														value: "",
														label: "-- Select Scope School --",
														disabled: true,
													},
													...scopedSchs.map((s) => ({
														value: s.id,
														label: `${s.code} - ${s.name}`,
													})),
												]
											: adminLevel === "faculty"
												? [
														{
															value: "",
															label: "-- Select Scope Faculty --",
															disabled: true,
														},
														...scopedFacs.map((f) => ({
															value: f.id,
															label: `${f.code} - ${f.name}`,
														})),
													]
												: [
														{
															value: "",
															label: "-- Select Scope Department --",
															disabled: true,
														},
														...scopedDepts.map((d) => ({
															value: d.id,
															label: `${d.code} - ${d.name}`,
														})),
													]
								}
							/>
						</div>
					</div>
				)}

				{/* Lecturer / Student Section */}
				{(role === "student" || role === "lecturer") && (
					<div>
						<Select
							label="Assigned Department *"
							value={scopeId}
							disabled={isDeptAdmin && scopedDepts.length === 1}
							error={errors.scopeId}
							onChange={(e) => {
								setScopeId(e.target.value);
								if (errors.scopeId)
									setErrors((prev) => ({ ...prev, scopeId: "" }));
							}}
							options={[
								...(!isDeptAdmin
									? [
											{
												value: "",
												label: "-- Select Department --",
												disabled: true,
											},
										]
									: []),
								...scopedDepts.map((d) => ({
									value: d.id,
									label: `${d.code} - ${d.name} (Max: ${d.max_level || d.maxLevel || 400}L)`,
								})),
							]}
							helperText={
								isDeptAdmin
									? `Locked to your assigned department scope (${selectedDept?.code || ""})`
									: undefined
							}
						/>
					</div>
				)}

				{/* Student Specific Degree Program Selection */}
				{role === "student" && availablePrograms.length > 0 && (
					<div>
						<Select
							label="Academic Program"
							value={programId}
							onChange={(e) => {
								setProgramId(e.target.value);
								setLevel("");
							}}
							options={availablePrograms.map((prog) => ({
								value: prog.id,
								label: `${prog.name} (${prog.code}) — Max ${prog.maxLevel}L${prog.isDefault ? " [Default]" : ""}`,
							}))}
							helperText={
								selectedProgram
									? `Degree duration: up to ${selectedProgram.maxLevel}L`
									: undefined
							}
						/>
					</div>
				)}

				{/* Student Specific Level & Class Rep checkbox */}
				{role === "student" && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
						<div>
							<Select
								label="Academic Level *"
								value={level}
								error={errors.level}
								onChange={(e) => {
									setLevel(e.target.value);
									if (errors.level)
										setErrors((prev) => ({ ...prev, level: "" }));
								}}
								options={availableLevels}
								helperText={
									selectedProgram
										? `Available levels for ${selectedProgram.code}: 100L to ${effectiveMaxLevel}L`
										: selectedDept
											? `Available levels for ${selectedDept.code}: 100L to ${effectiveMaxLevel}L`
											: "Select department first to view level range"
								}
							/>
						</div>
						<div className="flex flex-col gap-1 sm:pt-6">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="isClassRep"
									checked={isClassRep}
									disabled={isDeptAdmin}
									onChange={(e) => {
										setIsClassRep(e.target.checked);
										if (errors.is_class_rep)
											setErrors((prev) => ({ ...prev, is_class_rep: "" }));
									}}
									className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
								/>
								<label
									htmlFor="isClassRep"
									className="text-xs font-semibold text-text-main cursor-pointer select-none"
								>
									Designate as Class Representative
								</label>
							</div>
							<span className="text-[11px] text-text-muted">
								Max 2 class reps allowed per department & level.
							</span>
							{errors.is_class_rep && (
								<span className="text-xs text-danger font-medium mt-0.5">
									{errors.is_class_rep}
								</span>
							)}
						</div>
					</div>
				)}
			</form>
		</Modal>
	);
}
