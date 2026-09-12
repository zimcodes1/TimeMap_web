import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardView from "@/pages/main/DashboardView";
import {
	getLectureHoldRateAnalytics,
	getVenueUtilizationAnalytics,
	getDiscrepancyAnalytics,
	getDashboardSummaryCounts,
	getDepartmentsList,
} from "@/api/main/dashboardAPI";
import { getSemesters } from "@/api/main/semestersAPI";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardContainer() {
	const { user: currentUser } = useAuth();
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [departmentFilter, setDepartmentFilter] = useState<string>("");
	const [groupBy, setGroupBy] = useState<string>("week");

	const filterParams = {
		startDate: startDate || undefined,
		endDate: endDate || undefined,
		departmentId: departmentFilter || undefined,
		groupBy: groupBy || undefined,
	};

	const { data: holdRate, isLoading: holdRateLoading } = useQuery({
		queryKey: ["analytics", "hold-rate", filterParams],
		queryFn: () => getLectureHoldRateAnalytics(filterParams),
	});

	const { data: utilization, isLoading: utilizationLoading } = useQuery({
		queryKey: ["analytics", "utilization", filterParams],
		queryFn: () => getVenueUtilizationAnalytics(filterParams),
	});

	const { data: discrepancies, isLoading: discrepanciesLoading } = useQuery({
		queryKey: ["analytics", "discrepancies", filterParams],
		queryFn: () => getDiscrepancyAnalytics(filterParams),
	});

	const { data: summaryCounts, isLoading: countsLoading } = useQuery({
		queryKey: ["analytics", "summary-counts"],
		queryFn: getDashboardSummaryCounts,
	});

	const { data: departments = [] } = useQuery({
		queryKey: ["hierarchy", "departments"],
		queryFn: getDepartmentsList,
	});

	const { data: semesters = [] } = useQuery({
		queryKey: ["semesters", "list"],
		queryFn: () => getSemesters(),
	});

	const activeSemester = semesters.find((s) => s.isActive);

	const handleResetFilters = () => {
		setStartDate("");
		setEndDate("");
		setDepartmentFilter("");
		setGroupBy("week");
	};

	return (
		<DashboardView
			holdRate={holdRate}
			holdRateLoading={holdRateLoading}
			utilization={utilization}
			utilizationLoading={utilizationLoading}
			discrepancies={discrepancies}
			discrepanciesLoading={discrepanciesLoading}
			summaryCounts={summaryCounts}
			countsLoading={countsLoading}
			departments={departments}
			adminLevel={currentUser?.adminLevel}
			activeSemester={activeSemester}
			startDate={startDate}
			onStartDateChange={setStartDate}
			endDate={endDate}
			onEndDateChange={setEndDate}
			departmentFilter={departmentFilter}
			onDepartmentFilterChange={setDepartmentFilter}
			groupBy={groupBy}
			onGroupByChange={setGroupBy}
			onResetFilters={handleResetFilters}
		/>
	);
}
