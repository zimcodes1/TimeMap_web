import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RequestsView from "@/pages/main/RequestsView";
import SubmitDiscrepancyModal from "@/components/modals/SubmitDiscrepancyModal";
import DiscrepancyDetailSlideOver from "@/components/modals/DiscrepancyDetailSlideOver";
import RejectDiscrepancyModal from "@/components/modals/RejectDiscrepancyModal";
import WithdrawRequestModal from "@/components/modals/WithdrawRequestModal";
import {
	getDiscrepanciesList,
	createDiscrepancyAPI,
	approveDiscrepancyAPI,
	rejectDiscrepancyAPI,
	withdrawDiscrepancyAPI,
} from "@/api/main/discrepanciesAPI";
import { getVenues } from "@/api/main/venuesAPI";
import { getTimetableEntries } from "@/api/main/schedulesAPI";
import { getDepartmentsList } from "@/api/main/hierarchyAPI";
import type { DiscrepancyRequest } from "@/types";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

export default function RequestsContainer() {
	const queryClient = useQueryClient();
	const { user: currentUser } = useAuth();

	const [isSubmitOpen, setIsSubmitOpen] = useState(false);
	const [selectedRequestForDetail, setSelectedRequestForDetail] =
		useState<DiscrepancyRequest | null>(null);
	const [selectedRequestForReject, setSelectedRequestForReject] =
		useState<DiscrepancyRequest | null>(null);
	const [withdrawTarget, setWithdrawTarget] =
		useState<DiscrepancyRequest | null>(null);

	const adminLevel = currentUser?.adminLevel;
	const isSuperuser =
		currentUser?.role === "admin" &&
		(!adminLevel || adminLevel === "university");
	const isSchoolAdmin =
		currentUser?.role === "admin" && adminLevel === "school";
	const isFacultyAdmin =
		currentUser?.role === "admin" && adminLevel === "faculty";
	const isDeptAdmin =
		currentUser?.role === "admin" && adminLevel === "department";

	// Queries
	const {
		data: requests = [],
		isLoading: isRequestsLoading,
		isRefetching: isRequestsRefetching,
		refetch: refetchRequests,
	} = useQuery({
		queryKey: ["discrepancies", "list"],
		queryFn: () => getDiscrepanciesList(),
	});

	const { data: venues = [] } = useQuery({
		queryKey: ["venues", "list"],
		queryFn: getVenues,
	});

	const { data: entries = [] } = useQuery({
		queryKey: ["schedules", "entries"],
		queryFn: getTimetableEntries,
	});

	const { data: allDepartments = [] } = useQuery({
		queryKey: ["hierarchy", "departments"],
		queryFn: getDepartmentsList,
	});

	// Overseeing admins can filter requests by departments under their jurisdiction
	const availableDepartments = useMemo(() => {
		if (!currentUser || isDeptAdmin) return [];
		if (isSuperuser || isSchoolAdmin) return allDepartments;
		const targetFacultyId =
			currentUser.facultyId ||
			(isFacultyAdmin ? currentUser.adminScopeId : undefined);
		if (isFacultyAdmin && targetFacultyId) {
			return allDepartments.filter((d) => d.facultyId === targetFacultyId);
		}
		return allDepartments;
	}, [
		allDepartments,
		currentUser,
		isDeptAdmin,
		isSuperuser,
		isSchoolAdmin,
		isFacultyAdmin,
	]);

	// Scope-filtered option lists for submission
	const scopedVenues = useMemo(() => {
		if (!currentUser || isSuperuser) return venues;
		return venues.filter((v) => {
			if (isSchoolAdmin) return v.owningLevel === "school";
			if (isFacultyAdmin)
				return v.owningLevel === "faculty" || v.owningLevel === "department";
			if (isDeptAdmin)
				return v.owningLevel === "department" || v.owningLevel === "faculty";
			return true;
		});
	}, [
		venues,
		currentUser,
		isSuperuser,
		isSchoolAdmin,
		isFacultyAdmin,
		isDeptAdmin,
	]);

	// Mutations
	const createDiscrepancyMutation = useMutation({
		mutationFn: (data: Record<string, unknown>) =>
			createDiscrepancyAPI({
				request_type: (data.request_type as any) || "shift_venue",
				timetable_entry: data.timetable_entry as any,
				proposed_venue: data.proposed_venue as any,
				proposed_start_time: data.proposed_start_time as any,
				proposed_end_time: data.proposed_end_time as any,
				reason: (data.reason as string) || "Discrepancy request",
			}),
		onSuccess: (newReq) => {
			queryClient.invalidateQueries({ queryKey: ["discrepancies", "list"] });
			toast.success(
				`Discrepancy request #${newReq.id} submitted successfully.`,
			);
			setIsSubmitOpen(false);
		},
		onError: (err) => {
			toast.error("Failed to submit discrepancy request.");
			console.error("createDiscrepancy error:", err);
		},
	});

	const approveDiscrepancyMutation = useMutation({
		mutationFn: (id: string) => approveDiscrepancyAPI(id),
		onSuccess: (approved) => {
			queryClient.invalidateQueries({ queryKey: ["discrepancies", "list"] });
			toast.success(
				`Discrepancy request #${approved.id} approved successfully.`,
			);
			setSelectedRequestForDetail(null);
		},
		onError: () => toast.error("Failed to approve discrepancy request."),
	});

	const rejectDiscrepancyMutation = useMutation({
		mutationFn: ({ id, reason }: { id: string; reason: string }) =>
			rejectDiscrepancyAPI(id, reason),
		onSuccess: (rejected) => {
			queryClient.invalidateQueries({ queryKey: ["discrepancies", "list"] });
			toast.error(`Discrepancy request #${rejected.id} rejected.`);
			setSelectedRequestForReject(null);
			setSelectedRequestForDetail(null);
		},
		onError: () => toast.error("Failed to reject discrepancy request."),
	});

	const withdrawDiscrepancyMutation = useMutation({
		mutationFn: (id: string) => withdrawDiscrepancyAPI(id),
		onSuccess: (withdrawn) => {
			queryClient.invalidateQueries({ queryKey: ["discrepancies", "list"] });
			toast.info(`Discrepancy request #${withdrawn.id} withdrawn.`);
			setWithdrawTarget(null);
			setSelectedRequestForDetail(null);
		},
		onError: () => toast.error("Failed to withdraw discrepancy request."),
	});

	// Handlers
	const handleSubmitDiscrepancy = (data: Record<string, unknown>) => {
		createDiscrepancyMutation.mutate(data);
	};

	const handleApproveRequest = (id: string) => {
		approveDiscrepancyMutation.mutate(id);
	};

	const handleRejectRequest = (id: string, reason: string) => {
		rejectDiscrepancyMutation.mutate({ id, reason });
	};

	const handleWithdrawRequest = (id: string) => {
		withdrawDiscrepancyMutation.mutate(id);
	};

	const handleManualRefresh = () => {
		refetchRequests();
	};

	return (
		<>
			<RequestsView
				requests={requests}
				isLoading={isRequestsLoading}
				isRefetching={isRequestsRefetching}
				onRefresh={handleManualRefresh}
				onOpenSubmitDiscrepancy={() => setIsSubmitOpen(true)}
				onOpenDetailSlideOver={(req) => setSelectedRequestForDetail(req)}
				onWithdrawTrigger={(req) => setWithdrawTarget(req)}
				adminLevel={adminLevel}
				departments={availableDepartments}
				currentUserId={currentUser?.id}
			/>

			<SubmitDiscrepancyModal
				isOpen={isSubmitOpen}
				onClose={() => setIsSubmitOpen(false)}
				onSubmit={handleSubmitDiscrepancy}
				entries={entries}
				venues={scopedVenues}
			/>

			<DiscrepancyDetailSlideOver
				isOpen={Boolean(selectedRequestForDetail)}
				onClose={() => setSelectedRequestForDetail(null)}
				request={selectedRequestForDetail}
				onApprove={handleApproveRequest}
				onRejectTrigger={(id) => {
					const req = requests.find((r) => r.id === id);
					if (req) setSelectedRequestForReject(req);
				}}
				onWithdraw={handleWithdrawRequest}
			/>

			<RejectDiscrepancyModal
				isOpen={Boolean(selectedRequestForReject)}
				onClose={() => setSelectedRequestForReject(null)}
				onConfirm={(reason: string) => {
					if (selectedRequestForReject) {
						handleRejectRequest(selectedRequestForReject.id, reason);
					}
				}}
			/>

			<WithdrawRequestModal
				isOpen={Boolean(withdrawTarget)}
				onClose={() => setWithdrawTarget(null)}
				onConfirm={handleWithdrawRequest}
				request={withdrawTarget}
			/>
		</>
	);
}
