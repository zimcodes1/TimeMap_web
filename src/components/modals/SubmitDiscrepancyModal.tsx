import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Clock, AlertCircle } from "lucide-react";
import type { DiscrepancyRequestType, Venue, TimetableEntry } from "@/types";
import {
	getVenueAvailabilityAPI,
	type VenueAvailabilityResponse,
} from "@/api/main/venuesAPI";

interface SubmitDiscrepancyModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: Record<string, unknown>) => void;
	venues: Venue[];
	entries: TimetableEntry[];
}

export default function SubmitDiscrepancyModal({
	isOpen,
	onClose,
	onSubmit,
	venues,
	entries,
}: SubmitDiscrepancyModalProps) {
	const [requestType, setRequestType] =
		useState<DiscrepancyRequestType>("shift_venue");
	const [timetableEntryId, setTimetableEntryId] = useState(
		entries[0]?.id || "",
	);
	const [proposedVenueId, setProposedVenueId] = useState(venues[0]?.id || "");
	const [proposedStartTime, setProposedStartTime] = useState("08:00:00");
	const [proposedEndTime, setProposedEndTime] = useState("10:00:00");
	const [reason, setReason] = useState("");
	const [availability, setAvailability] =
		useState<VenueAvailabilityResponse | null>(null);
	const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

	const selectedVenueId = proposedVenueId || venues[0]?.id || "";

	// Trigger real-time availability check when venue changes
	useEffect(() => {
		if (!isOpen || !selectedVenueId) return;
		let isMounted = true;
		setIsLoadingAvailability(true);

		getVenueAvailabilityAPI(selectedVenueId)
			.then((res) => {
				if (isMounted) {
					setAvailability(res);
					setIsLoadingAvailability(false);
				}
			})
			.catch(() => {
				if (isMounted) setIsLoadingAvailability(false);
			});

		return () => {
			isMounted = false;
		};
	}, [isOpen, selectedVenueId]);

	// Helper to add 2 hours fixed duration to a time string (HH:MM:SS or HH:MM)
	const calculateTwoHoursLater = (timeStr: string): string => {
		if (!timeStr) return "13:00:00";
		const parts = timeStr.split(":");
		let hours = parseInt(parts[0], 10);
		const minutes = parts[1] || "00";
		const seconds = parts[2] || "00";
		if (isNaN(hours)) return "13:00:00";
		hours = hours + 2;
		const hh = hours < 10 ? `0${hours}` : `${hours}`;
		return `${hh}:${minutes}:${seconds}`;
	};

	const handleStartTimeChange = (val: string) => {
		setProposedStartTime(val);
		setProposedEndTime(calculateTwoHoursLater(val));
	};

	// Check 8:00 AM - 6:00 PM operating hours bounds (max start time is 16:00 to finish by 18:00)
	const startStr = proposedStartTime
		? proposedStartTime.substring(0, 5)
		: "11:00";
	const endStr = proposedEndTime ? proposedEndTime.substring(0, 5) : "13:00";
	const isStartTimeInvalid = startStr < "08:00" || startStr > "16:00";
	const isEndTimeInvalid =
		endStr <= "08:00" || endStr > "18:00" || endStr <= startStr;
	const isTimeOutOfHours =
		(requestType === "shift_time" || requestType === "shift_venue") &&
		(isStartTimeInvalid || isEndTimeInvalid);

	const toHHMMSS = (t: string) => (t.length === 5 ? `${t}:00` : t);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!reason.trim() || isTimeOutOfHours) return;
		const needsVenue =
			requestType === "shift_venue" || requestType === "create_booking";
		const needsTime =
			requestType === "shift_time" || requestType === "shift_venue";
		onSubmit({
			request_type: requestType,
			timetable_entry: timetableEntryId || entries[0]?.id,
			proposed_venue: needsVenue ? proposedVenueId : undefined,
			proposed_start_time: needsTime ? toHHMMSS(proposedStartTime) : undefined,
			proposed_end_time: needsTime ? toHHMMSS(proposedEndTime) : undefined,
			reason,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Submit Discrepancy Request"
			description="Submit a recurring timetable pattern shift, cancellation, postponement, or venue change for approval."
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
						disabled={isTimeOutOfHours || !reason.trim()}
						className="cursor-pointer"
					>
						Submit Request
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Request Type
					</Text>
					<Select
						value={requestType}
						onChange={(e) =>
							setRequestType(e.target.value as DiscrepancyRequestType)
						}
						options={[
							{
								value: "shift_venue",
								label: "Shift Venue (Recurring Pattern)",
							},
							{ value: "shift_time", label: "Shift Time (Recurring Pattern)" },
							{ value: "postpone", label: "Postpone Pattern" },
							{ value: "cancel", label: "Cancel Pattern" },
							{ value: "create_booking", label: "Cross-Scope Booking" },
						]}
					/>
				</div>

				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Target Timetable Pattern
					</Text>
					<Select
						value={timetableEntryId || entries[0]?.id || ""}
						onChange={(e) => setTimetableEntryId(e.target.value)}
						options={entries.map((e) => ({
							value: e.id,
							label: `${e.courseCode} - ${e.courseTitle} (${e.dayOfWeek} ${e.startTime}-${e.endTime} in ${e.venueName})`,
						}))}
					/>
				</div>

				{(requestType === "shift_venue" ||
					requestType === "create_booking") && (
					<div className="space-y-2">
						<Text variant="caption" className="font-semibold mb-1 block">
							Proposed Venue
						</Text>
						<Select
							value={proposedVenueId}
							onChange={(e) => setProposedVenueId(e.target.value)}
							options={venues.map((v) => ({ value: v.id, label: v.name }))}
						/>

						{/* Venue Real-time Availability Callout Box */}
						<div className="p-3 bg-primary/10 rounded-xl border border-primary/20 space-y-1 mt-2">
							<div className="flex items-center justify-between text-xs font-semibold text-primary">
								<span className="flex items-center gap-1.5">
									<Clock size={14} /> Operating Hours: 8:00 AM - 6:00 PM
								</span>
								{isLoadingAvailability && (
									<span className="text-text-muted text-[11px]">
										Checking availability...
									</span>
								)}
							</div>
							<p className="text-xs font-medium text-text-main pt-0.5">
								{availability?.available_time_ranges ||
									"Available time: 8:00 AM - 10:00 AM, 12:00 PM - 6:00 PM"}
							</p>
						</div>
					</div>
				)}

				{(requestType === "shift_time" || requestType === "shift_venue") && (
					<div className="space-y-2">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Text variant="caption" className="font-semibold mb-1 block">
									Proposed Start Time
								</Text>
								<Input
									type="time"
									value={proposedStartTime}
									onChange={(e) => handleStartTimeChange(e.target.value)}
								/>
							</div>
							<div>
								<Text variant="caption" className="font-semibold mb-1 block">
									Proposed End Time (Fixed 2 Hours)
								</Text>
								<Input
									type="time"
									value={proposedEndTime}
									readOnly
									disabled
									className="bg-surface/50 font-medium cursor-not-allowed opacity-80"
								/>
							</div>
						</div>

						{isTimeOutOfHours && (
							<div className="flex items-center gap-1.5 p-2 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs font-medium">
								<AlertCircle size={14} />
								<span>
									Lectures run for 2 hours and must finish by 6:00 PM. Please
									select a start time between 8:00 AM and 4:00 PM.
								</span>
							</div>
						)}
					</div>
				)}

				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Reason / Justification
					</Text>
					<Input
						placeholder="e.g. AC maintenance scheduled in LT1 on Sept 14"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						required
					/>
				</div>
			</form>
		</Modal>
	);
}
