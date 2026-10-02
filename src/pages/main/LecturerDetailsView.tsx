import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, Course, HoldRateAnalytics, Semester } from "@/types";
import LecturerProfileHeader from "@/components/lecturers/LecturerProfileHeader";
import LecturerStatsSection from "@/components/lecturers/LecturerStatsSection";
import LecturerCoursesList from "@/components/lecturers/LecturerCoursesList";

interface LecturerDetailsViewProps {
	lecturer?: User;
	lecturerLoading?: boolean;
	courses: Course[];
	coursesLoading?: boolean;
	holdRate?: HoldRateAnalytics;
	holdRateLoading?: boolean;
	selectedCourseId: string;
	onCourseChange: (courseId: string) => void;
	activeSemester?: Semester;
	canManage?: boolean;
	onEdit: () => void;
	onResetPassword: () => void;
	onToggleStatus: () => void;
}

export const LecturerDetailsView: React.FC<LecturerDetailsViewProps> = ({
	lecturer,
	lecturerLoading = false,
	courses = [],
	coursesLoading = false,
	holdRate,
	holdRateLoading = false,
	selectedCourseId,
	onCourseChange,
	activeSemester,
	canManage = true,
	onEdit,
	onResetPassword,
	onToggleStatus,
}) => {
	if (lecturerLoading) {
		return (
			<div className="space-y-6">
				{/* Top bar skeleton */}
				<div className="flex items-center justify-between">
					<Skeleton className="h-9 w-36 rounded-xl" />
					<Skeleton className="h-6 w-28 rounded-full" />
				</div>

				{/* Profile Card Skeleton */}
				<Card className="p-6 space-y-4">
					<div className="flex items-center gap-5">
						<Skeleton className="w-24 h-24 rounded-2xl" />
						<div className="space-y-2 flex-1">
							<Skeleton className="h-7 w-48" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-64" />
						</div>
					</div>
				</Card>

				{/* Stats Skeleton */}
				<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-20 rounded-2xl" />
					))}
				</div>

				{/* Graph Skeleton */}
				<Skeleton className="h-72 w-full rounded-2xl" />

				{/* Courses Skeleton */}
				<Skeleton className="h-48 w-full rounded-2xl" />
			</div>
		);
	}

	if (!lecturer) {
		return (
			<div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
				<div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 text-danger flex items-center justify-center">
					<AlertCircle size={32} />
				</div>
				<div className="space-y-1">
					<Text variant="h4" weight="bold" className="text-text-main">
						Lecturer Not Found
					</Text>
					<Text variant="body-sm" color="muted" className="max-w-md">
						The requested lecturer record could not be found or is outside your current administrative scope.
					</Text>
				</div>
				<Link to={"/users" as any}>
					<Button variant="outline" className="rounded-xl flex items-center gap-2">
						<ArrowLeft size={16} />
						<span>Return to Staff Directory</span>
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* 1. Lecturer Profile Header */}
			<LecturerProfileHeader
				lecturer={lecturer}
				canManage={canManage}
				onEdit={onEdit}
				onResetPassword={onResetPassword}
				onToggleStatus={onToggleStatus}
			/>

			{/* 2. Lecture Hold Rate Stats & Graph */}
			<LecturerStatsSection
				holdRate={holdRate}
				isLoading={holdRateLoading}
				courses={courses}
				selectedCourseId={selectedCourseId}
				onCourseChange={onCourseChange}
				activeSemester={activeSemester}
			/>

			{/* 3. Assigned Courses This Semester */}
			<LecturerCoursesList
				courses={courses}
				isLoading={coursesLoading}
				activeSemester={activeSemester}
			/>
		</div>
	);
};

export default LecturerDetailsView;
