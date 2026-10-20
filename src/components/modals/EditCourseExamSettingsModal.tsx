import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	FileText,
	Cpu,
	FlaskConical,
	Clock,
	Users,
	RotateCcw,
	Save,
} from "lucide-react";
import type { Course } from "@/types";

interface EditCourseExamSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		id: string,
		settings: {
			examType: "written" | "cbt" | "lab_practical";
			examDurationMinutes?: number | null;
			examDurationPerStudentMinutes?: number | null;
		},
	) => void;
	course: Course | null;
	isSubmitting?: boolean;
}

const DURATION_PRESETS = [
	{ label: "1 hr (60m)", value: 60 },
	{ label: "1.5 hrs (90m)", value: 90 },
	{ label: "2 hrs (120m)", value: 120, isDefault: true },
	{ label: "2.5 hrs (150m)", value: 150 },
	{ label: "3 hrs (180m)", value: 180 },
];

const CBT_STUDENT_PRESETS = [
	{ label: "30 mins", value: 30 },
	{ label: "45 mins", value: 45, isDefault: true },
	{ label: "60 mins", value: 60 },
	{ label: "90 mins", value: 90 },
];

export default function EditCourseExamSettingsModal({
	isOpen,
	onClose,
	onSubmit,
	course,
	isSubmitting = false,
}: EditCourseExamSettingsModalProps) {
	const [examType, setExamType] = useState<"written" | "cbt" | "lab_practical">(
		"written",
	);
	const [durationMinutes, setDurationMinutes] = useState<number>(120);
	const [perStudentMinutes, setPerStudentMinutes] = useState<number>(45);

	useEffect(() => {
		if (course) {
			setExamType(course.examType || "written");
			setDurationMinutes(course.examDurationMinutes || 120);
			setPerStudentMinutes(course.examDurationPerStudentMinutes || 45);
		}
	}, [course]);

	if (!course) return null;

	const handleResetDefaults = () => {
		setExamType("written");
		setDurationMinutes(120);
		setPerStudentMinutes(45);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(course.id, {
			examType,
			examDurationMinutes:
				examType === "cbt" ? null : Number(durationMinutes) || 120,
			examDurationPerStudentMinutes:
				examType === "cbt" ? Number(perStudentMinutes) || 45 : null,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md"
			title={
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-bold text-base text-text-main">
							Configure Exam Settings
						</span>
						<Badge variant="outline" className="text-xs font-mono font-bold">
							{course.code}
						</Badge>
					</div>
					<Text variant="body-sm" color="muted" className="truncate max-w-md">
						{course.title} · {course.level}L
					</Text>
				</div>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-5 pt-1">
				{/* Course Scope Banner */}
				<div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between text-xs">
					<div>
						<span className="text-text-muted">Owning Scope: </span>
						<span className="font-semibold text-text-main">
							{course.departmentName || course.facultyName || course.owningLevel}
						</span>
					</div>
					<div className="flex items-center gap-1.5 text-text-muted font-mono">
						<Users size={13} className="text-primary" />
						<span>{course.registrationCount || 0} candidates</span>
					</div>
				</div>

				{/* 1. Examination Mode Selection */}
				<div className="space-y-2">
					<label className="text-xs font-bold text-text-main uppercase tracking-wider block">
						Examination Mode
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
						{/* Written */}
						<button
							type="button"
							onClick={() => setExamType("written")}
							className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
								examType === "written"
									? "border-primary bg-primary/10 shadow-xs"
									: "border-border bg-surface hover:bg-surface-raised/50"
							}`}
						>
							<div className="flex items-center justify-between mb-1">
								<FileText
									size={16}
									className={examType === "written" ? "text-primary" : "text-text-muted"}
								/>
								<span
									className={`w-3 h-3 rounded-full border flex items-center justify-center ${
										examType === "written"
											? "border-primary bg-primary"
											: "border-border"
									}`}
								/>
							</div>
							<div className="font-bold text-xs text-text-main">Written Exam</div>
							<div className="text-[10px] text-text-muted mt-0.5">
								Hall / Classroom
							</div>
						</button>

						{/* CBT */}
						<button
							type="button"
							onClick={() => setExamType("cbt")}
							className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
								examType === "cbt"
									? "border-primary bg-primary/10 shadow-xs"
									: "border-border bg-surface hover:bg-surface-raised/50"
							}`}
						>
							<div className="flex items-center justify-between mb-1">
								<Cpu
									size={16}
									className={examType === "cbt" ? "text-emerald-400" : "text-text-muted"}
								/>
								<span
									className={`w-3 h-3 rounded-full border flex items-center justify-center ${
										examType === "cbt"
											? "border-primary bg-primary"
											: "border-border"
									}`}
								/>
							</div>
							<div className="font-bold text-xs text-text-main">CBT Exam</div>
							<div className="text-[10px] text-text-muted mt-0.5">
								Computer Lab shifts
							</div>
						</button>

						{/* Lab Practical */}
						<button
							type="button"
							onClick={() => setExamType("lab_practical")}
							className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
								examType === "lab_practical"
									? "border-primary bg-primary/10 shadow-xs"
									: "border-border bg-surface hover:bg-surface-raised/50"
							}`}
						>
							<div className="flex items-center justify-between mb-1">
								<FlaskConical
									size={16}
									className={
										examType === "lab_practical"
											? "text-amber-400"
											: "text-text-muted"
									}
								/>
								<span
									className={`w-3 h-3 rounded-full border flex items-center justify-center ${
										examType === "lab_practical"
											? "border-primary bg-primary"
											: "border-border"
									}`}
								/>
							</div>
							<div className="font-bold text-xs text-text-main">Practical</div>
							<div className="text-[10px] text-text-muted mt-0.5">
								Laboratory
							</div>
						</button>
					</div>
				</div>

				{/* 2. Total Exam Window Duration (Hidden for CBT since duration is throughput-driven) */}
				{examType !== "cbt" && (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="text-xs font-bold text-text-main uppercase tracking-wider block">
								Sitting Window Duration
							</label>
							<span className="text-[11px] text-primary font-mono font-bold">
								{durationMinutes} minutes ({(durationMinutes / 60).toFixed(1)} hrs)
							</span>
						</div>

						<div className="flex flex-wrap gap-1.5">
							{DURATION_PRESETS.map((p) => (
								<button
									key={p.value}
									type="button"
									onClick={() => setDurationMinutes(p.value)}
									className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
										durationMinutes === p.value
											? "bg-primary text-white border-primary"
											: "bg-surface-raised border-border text-text-muted hover:text-text-main"
									}`}
								>
									{p.label}
								</button>
							))}
						</div>

						<div className="pt-1">
							<Input
								type="number"
								min={30}
								max={360}
								step={15}
								value={durationMinutes}
								onChange={(e) => setDurationMinutes(Number(e.target.value))}
								placeholder="Custom duration in minutes"
								className="h-9 text-xs"
							/>
							<p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
								<Clock size={11} />
								<span>Total timetable timeframe reserved for this course exam sitting.</span>
							</p>
						</div>
					</div>
				)}

				{/* 3. CBT Per-Student Duration (Only visible if CBT) */}
				{examType === "cbt" && (
					<div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5">
						<div className="flex items-center justify-between">
							<label className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
								<Cpu size={14} className="text-emerald-400" />
								<span>Per-Student CBT Test Time</span>
							</label>
							<span className="text-[11px] text-emerald-400 font-mono font-bold">
								{perStudentMinutes} minutes / student
							</span>
						</div>

						<div className="flex flex-wrap gap-1.5">
							{CBT_STUDENT_PRESETS.map((p) => (
								<button
									key={p.value}
									type="button"
									onClick={() => setPerStudentMinutes(p.value)}
									className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
										perStudentMinutes === p.value
											? "bg-emerald-500 text-white border-emerald-500"
											: "bg-surface border-border text-text-muted hover:text-text-main"
									}`}
								>
									{p.label}
								</button>
							))}
						</div>

						<Input
							type="number"
							min={15}
							max={180}
							step={5}
							value={perStudentMinutes}
							onChange={(e) => setPerStudentMinutes(Number(e.target.value))}
							className="h-8 text-xs bg-surface"
							placeholder="Per-student minutes"
						/>

						<div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-text-muted space-y-1">
							<div className="font-semibold text-emerald-400 flex items-center gap-1">
								<span>Dynamic CBT Duration via Throughput</span>
							</div>
							<p className="leading-relaxed">
								No fixed sitting window is needed. The optimizer dynamically computes total shift duration based on candidates ({course.registrationCount || 0}) and assigned computer lab capacities.
							</p>
						</div>
					</div>
				)}

				{/* Modal Footer Controls */}
				<div className="flex items-center justify-between pt-3 border-t border-border">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleResetDefaults}
						className="h-8 gap-1 text-xs text-text-muted hover:text-text-main cursor-pointer"
					>
						<RotateCcw size={12} />
						<span>Reset Defaults</span>
					</Button>

					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onClose}
							disabled={isSubmitting}
							className="h-8 text-xs cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="primary"
							size="sm"
							disabled={isSubmitting}
							className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
						>
							<Save size={13} />
							<span>{isSubmitting ? "Saving..." : "Save Exam Settings"}</span>
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
}

