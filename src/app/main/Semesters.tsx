/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SemestersView from "@/pages/main/SemestersView";
import CreateAcademicSessionModal from "@/components/modals/CreateAcademicSessionModal";
import CreateSemesterModal from "@/components/modals/CreateSemesterModal";
import EditSemesterModal from "@/components/modals/EditSemesterModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { getSchoolsList } from "@/api/main/hierarchyAPI";
import {
	getAcademicSessions,
	createAcademicSession,
	getSemesters,
	createSemester,
	updateSemester,
	activateSemester,
	deleteSemester,
} from "@/api/main/semestersAPI";
import type { Semester } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export default function SemestersContainer() {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const isSchoolAdmin = user?.role === "admin" && user?.adminLevel === "school";

	// Modal States
	const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
	const [isCreateSemesterOpen, setIsCreateSemesterOpen] = useState(false);
	const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<{
		id: string;
		name: string;
	} | null>(null);

	// Queries
	const { data: schools = [] } = useQuery({
		queryKey: ["hierarchy", "schools"],
		queryFn: getSchoolsList,
		enabled: isSchoolAdmin,
	});

	const {
		data: sessions = [],
		isLoading: sessionsLoading,
		isRefetching: sessionsRefetching,
		refetch: refetchSessions,
	} = useQuery({
		queryKey: ["scheduling", "academic-sessions"],
		queryFn: () => getAcademicSessions(),
		enabled: isSchoolAdmin,
	});

	const {
		data: semesters = [],
		isLoading: semestersLoading,
		isRefetching: semestersRefetching,
		refetch: refetchSemesters,
	} = useQuery({
		queryKey: ["scheduling", "semesters"],
		queryFn: () => getSemesters(),
		enabled: isSchoolAdmin,
	});

	const isRefetching = sessionsRefetching || semestersRefetching;

	const handleManualRefresh = async () => {
		await Promise.all([refetchSessions(), refetchSemesters()]);
		toast.success("Academic calendar data refreshed");
	};

	// Mutations
	const createSessionMutation = useMutation({
		mutationFn: createAcademicSession,
		onSuccess: () => {
			toast.success("Academic session created");
			setIsCreateSessionOpen(false);
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "academic-sessions"],
			});
		},
		onError: (err: any) => {
			const msg =
				err?.response?.data?.detail || "Failed to create academic session";
			toast.error(msg);
		},
	});

	const createSemesterMutation = useMutation({
		mutationFn: createSemester,
		onSuccess: () => {
			toast.success("Semester created successfully");
			setIsCreateSemesterOpen(false);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "semesters"] });
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "academic-sessions"],
			});
		},
		onError: (err: any) => {
			const msg = err?.response?.data?.detail || "Failed to create semester";
			toast.error(msg);
		},
	});

	const updateSemesterMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) =>
			updateSemester(id, data),
		onSuccess: () => {
			toast.success("Semester updated successfully");
			setEditingSemester(null);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "semesters"] });
		},
		onError: (err: any) => {
			const msg = err?.response?.data?.detail || "Failed to update semester";
			toast.error(msg);
		},
	});

	const activateSemesterMutation = useMutation({
		mutationFn: (id: string) => activateSemester(id),
		onSuccess: () => {
			toast.success("Semester activated successfully");
			queryClient.invalidateQueries({ queryKey: ["scheduling", "semesters"] });
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "academic-sessions"],
			});
		},
		onError: (err: any) => {
			const msg = err?.response?.data?.detail || "Failed to activate semester";
			toast.error(msg);
		},
	});

	const deleteSemesterMutation = useMutation({
		mutationFn: (id: string) => deleteSemester(id),
		onSuccess: () => {
			toast.success("Semester deleted");
			setDeleteTarget(null);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "semesters"] });
		},
		onError: (err: any) => {
			const msg = err?.response?.data?.detail || "Failed to delete semester";
			toast.error(msg);
		},
	});

	const defaultSchoolId = user?.adminScopeId || user?.schoolId;

	// Permission Gate
	if (!isSchoolAdmin) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl max-w-lg mx-auto mt-12 space-y-4">
				<div className="w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center">
					<ShieldAlert size={28} />
				</div>
				<div>
					<Text variant="h5" weight="bold" className="text-text-main">
						Access Restricted
					</Text>
					<Text variant="body-sm" color="muted" className="mt-1">
						Academic sessions and semester configuration is exclusively managed
						by School-Level Administrators.
					</Text>
				</div>
				<Link to="/">
					<Button variant="primary" size="sm" className="cursor-pointer">
						Return to Dashboard
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<>
			<SemestersView
				sessions={sessions}
				sessionsLoading={sessionsLoading}
				semesters={semesters}
				semestersLoading={semestersLoading}
				isRefetching={isRefetching}
				onManualRefresh={handleManualRefresh}
				onOpenCreateSession={() => setIsCreateSessionOpen(true)}
				onOpenCreateSemester={() => setIsCreateSemesterOpen(true)}
				onEditSemester={(sem) => setEditingSemester(sem)}
				onActivateSemester={(id) => activateSemesterMutation.mutate(id)}
				onDeleteSemester={(id, name) => setDeleteTarget({ id, name })}
				currentUser={user}
			/>

			<CreateAcademicSessionModal
				isOpen={isCreateSessionOpen}
				onClose={() => setIsCreateSessionOpen(false)}
				onSubmit={(data) => createSessionMutation.mutate(data)}
				schools={schools}
				defaultSchoolId={defaultSchoolId}
				isPending={createSessionMutation.isPending}
			/>

			<CreateSemesterModal
				isOpen={isCreateSemesterOpen}
				onClose={() => setIsCreateSemesterOpen(false)}
				onSubmit={(data) => createSemesterMutation.mutate(data)}
				sessions={sessions}
				isPending={createSemesterMutation.isPending}
			/>

			<EditSemesterModal
				isOpen={Boolean(editingSemester)}
				onClose={() => setEditingSemester(null)}
				onSubmit={(id, data) => updateSemesterMutation.mutate({ id, data })}
				semester={editingSemester}
				isPending={updateSemesterMutation.isPending}
			/>

			<DeleteConfirmModal
				isOpen={Boolean(deleteTarget)}
				onClose={() => setDeleteTarget(null)}
				onConfirm={() => {
					if (deleteTarget) deleteSemesterMutation.mutate(deleteTarget.id);
				}}
				itemName={deleteTarget?.name || ""}
				itemType="Semester"
			/>
		</>
	);
}
