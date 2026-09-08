import { useState, useMemo, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Search, Filter, AlertCircle } from "lucide-react";
import type { Course, Faculty, Department } from "@/types";

interface RequestAccessGrantModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: { courseId: string }) => void;
	externalCourses: Course[];
	faculties?: Faculty[];
	departments?: Department[];
}

export default function RequestAccessGrantModal({
	isOpen,
	onClose,
	onSubmit,
	externalCourses,
	faculties = [],
	departments = [],
}: RequestAccessGrantModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFacultyId, setSelectedFacultyId] = useState("");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
	const [courseId, setCourseId] = useState("");

	// Reset local state when modal closes/opens
	useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
			setSelectedFacultyId("");
			setSelectedDepartmentId("");
			setCourseId("");
		}
	}, [isOpen]);

	// Cascading departments based on selected faculty
	const availableDepartments = useMemo(() => {
		if (!selectedFacultyId) return departments;
		const targetFaculty = faculties.find(
			(f) => String(f.id) === String(selectedFacultyId),
		);
		return departments.filter(
			(d) =>
				String(d.facultyId) === String(selectedFacultyId) ||
				(targetFaculty && d.facultyName === targetFaculty.name),
		);
	}, [departments, faculties, selectedFacultyId]);

	// Reset department if no longer in filtered departments
	useEffect(() => {
		if (
			selectedDepartmentId &&
			!availableDepartments.some(
				(d) => String(d.id) === String(selectedDepartmentId),
			)
		) {
			setSelectedDepartmentId("");
		}
	}, [selectedFacultyId, availableDepartments, selectedDepartmentId]);

	// Determine if user has activated search or faculty selection
	const hasActivatedFilter = Boolean(
		searchQuery.trim() || selectedFacultyId || selectedDepartmentId,
	);

	// Filter external courses
	const filteredCourses = useMemo(() => {
		if (!hasActivatedFilter) return [];

		const q = searchQuery.toLowerCase().trim();
		const targetFaculty = faculties.find(
			(f) => String(f.id) === String(selectedFacultyId),
		);
		const targetDept = departments.find(
			(d) => String(d.id) === String(selectedDepartmentId),
		);

		return externalCourses.filter((c) => {
			// Search match
			const matchesSearch =
				!q ||
				c.code.toLowerCase().includes(q) ||
				c.title.toLowerCase().includes(q) ||
				(c.departmentName && c.departmentName.toLowerCase().includes(q)) ||
				(c.facultyName && c.facultyName.toLowerCase().includes(q));

			// Faculty match
			const matchesFaculty =
				!selectedFacultyId ||
				String(c.owningFaculty) === String(selectedFacultyId) ||
				c.facultyName === selectedFacultyId ||
				(targetFaculty && c.facultyName === targetFaculty.name);

			// Department match
			const matchesDept =
				!selectedDepartmentId ||
				String(c.departmentId) === String(selectedDepartmentId) ||
				String(c.owningDepartment) === String(selectedDepartmentId) ||
				c.departmentName === selectedDepartmentId ||
				(targetDept && c.departmentName === targetDept.name);

			return matchesSearch && matchesFaculty && matchesDept;
		});
	}, [
		externalCourses,
		searchQuery,
		selectedFacultyId,
		selectedDepartmentId,
		hasActivatedFilter,
		faculties,
		departments,
	]);

	// Update selected courseId when filtered list changes
	useEffect(() => {
		if (filteredCourses.length > 0) {
			if (!filteredCourses.some((c) => c.id === courseId)) {
				setCourseId(filteredCourses[0].id);
			}
		} else {
			setCourseId("");
		}
	}, [filteredCourses, courseId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!courseId) return;
		onSubmit({ courseId });
		onClose();
	};

	const selectedCourse = filteredCourses.find((c) => c.id === courseId);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Request External Course Access"
			description="Request access permission for a course owned by another department or faculty."
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
						disabled={!courseId || filteredCourses.length === 0}
						className="cursor-pointer"
					>
						Submit Access Request
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Realtime Search Input */}
				<div>
					<Input
						label="Realtime Course Search"
						placeholder="Search by code (e.g. CSC 201), course title, or department..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						leftIcon={<Search size={16} />}
					/>
				</div>

				{/* Scope Selectors: Faculty & Department */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{faculties.length > 0 && (
						<div>
							<Text variant="caption" className="font-semibold mb-1 block">
								Select Faculty
							</Text>
							<Select
								value={selectedFacultyId}
								onChange={(e) => setSelectedFacultyId(e.target.value)}
								options={[
									{ value: "", label: "All Faculties" },
									...faculties.map((f) => ({
										value: f.id,
										label: `${f.code} - ${f.name}`,
									})),
								]}
							/>
						</div>
					)}

					{departments.length > 0 && (
						<div>
							<Text variant="caption" className="font-semibold mb-1 block">
								Select Department
							</Text>
							<Select
								value={selectedDepartmentId}
								onChange={(e) => setSelectedDepartmentId(e.target.value)}
								options={[
									{ value: "", label: "All Departments" },
									...availableDepartments.map((d) => ({
										value: d.id,
										label: `${d.code} - ${d.name}`,
									})),
								]}
							/>
						</div>
					)}
				</div>

				{/* Course Select Dropdown - Conditional Display */}
				{!hasActivatedFilter ? (
					<div className="p-4 rounded-lg bg-surface border border-border/80 text-center space-y-2">
						<Filter size={24} className="mx-auto text-primary/70" />
						<Text variant="body-sm" className="font-medium text-text-main">
							Select a Faculty/Department or enter a course search term
						</Text>
						<Text variant="caption" color="muted" className="block">
							To keep course lists concise, available courses will be displayed
							once a faculty or search query is selected.
						</Text>
					</div>
				) : filteredCourses.length === 0 ? (
					<div className="p-4 rounded-lg bg-surface border border-border/80space-y-1">
						<AlertCircle size={20} className="mx-auto text-warning" />
						<Text
							variant="body-sm"
							className="font-medium  text-center text-text-main"
						>
							No matching courses found
						</Text>
						<Text
							variant="caption"
							color="muted"
							className="block  text-center "
						>
							Try adjusting your search query or faculty/department selection.
						</Text>
					</div>
				) : (
					<div className="space-y-3">
						<div>
							<Text variant="caption" className="font-semibold mb-1 block">
								Select External Course ({filteredCourses.length} available)
							</Text>
							<Select
								value={courseId}
								onChange={(e) => setCourseId(e.target.value)}
								options={filteredCourses.map((c) => ({
									value: c.id,
									label: `${c.code} - ${c.title} (${c.departmentName || c.facultyName || "External Department"}) [Level ${c.level}]`,
								}))}
							/>
						</div>

						{selectedCourse && (
							<div className="p-3 bg-raised/50 border border-border/50 rounded-lg text-xs space-y-1">
								<div className="flex items-center justify-between text-text-muted">
									<span>
										Level:{" "}
										<strong className="text-text-main">
											{selectedCourse.level} Level
										</strong>
									</span>
									<span>
										Owner:{" "}
										<strong className="text-text-main">
											{selectedCourse.departmentName ||
												selectedCourse.facultyName ||
												"External"}
										</strong>
									</span>
								</div>
								<p className="text-primary/90 font-medium">
									Note: Access will be requested for students in your department
									matching <strong>{selectedCourse.level} Level</strong>.
								</p>
							</div>
						)}
					</div>
				)}
			</form>
		</Modal>
	);
}
