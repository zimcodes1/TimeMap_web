import { useState, useEffect, useMemo } from "react";
import { Clock, Check, AlertCircle, Ban } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { getVenueAvailabilityAPI, type VenueAvailabilityResponse } from "@/api/main/venuesAPI";

export interface TimeSlotItem {
	periodIndex: number;
	start: string; // "08:00:00"
	end: string;   // "10:00:00"
	label: string; // "8:00 AM - 10:00 AM"
	isAvailable: boolean;
	isJummat?: boolean;
}

interface TimeSlotPickerProps {
	venueId: string;
	dayOfWeek: string;
	date?: string;
	isEvent?: boolean;
	selectedStartTime?: string;
	selectedEndTime?: string;
	onSelectSlot: (startTime: string, endTime: string) => void;
}

const STANDARD_PERIODS = [
	{ periodIndex: 0, start: "08:00:00", end: "10:00:00", label: "8:00 AM - 10:00 AM" },
	{ periodIndex: 1, start: "10:00:00", end: "12:00:00", label: "10:00 AM - 12:00 PM" },
	{ periodIndex: 2, start: "12:00:00", end: "14:00:00", label: "12:00 PM - 2:00 PM" },
	{ periodIndex: 3, start: "14:00:00", end: "16:00:00", label: "2:00 PM - 4:00 PM" },
	{ periodIndex: 4, start: "16:00:00", end: "18:00:00", label: "4:00 PM - 6:00 PM" },
];

export function TimeSlotPicker({
	venueId,
	dayOfWeek,
	date,
	isEvent = false,
	selectedStartTime,
	selectedEndTime,
	onSelectSlot,
}: TimeSlotPickerProps) {
	const [availability, setAvailability] = useState<VenueAvailabilityResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isFriday = dayOfWeek.trim().toLowerCase() === "friday";

	// Fetch venue availability when venue, day, or date changes
	useEffect(() => {
		if (!venueId) {
			setAvailability(null);
			return;
		}

		let isCurrent = true;
		setIsLoading(true);
		setError(null);

		getVenueAvailabilityAPI(venueId, {
			date: date || undefined,
			weekday: dayOfWeek || undefined,
		})
			.then((data) => {
				if (isCurrent) {
					setAvailability(data);
					setIsLoading(false);
				}
			})
			.catch(() => {
				if (isCurrent) {
					setError("Failed to verify venue availability.");
					setIsLoading(false);
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [venueId, dayOfWeek, date]);

	// Build the 5 standard daily periods with availability flags
	const periods: TimeSlotItem[] = useMemo(() => {
		const availableSlots = availability?.slots || [];
		const bookedSlots = availability?.booked_slots || [];

		return STANDARD_PERIODS.map((std) => {
			const isJummat = isFriday && std.periodIndex === 2;

			if (isJummat) {
				return {
					...std,
					isAvailable: false,
					isJummat: true,
				};
			}

			// Check if booked by start/end overlap
			const isBooked = bookedSlots.some(
				(b) => std.start < b.end && std.end > b.start,
			);

			// Check if returned in available slots
			const inAvailableList = availableSlots.some(
				(s) => s.start === std.start && s.end === std.end,
			);

			const isAvailable = !isBooked && (availableSlots.length > 0 ? inAvailableList : !isBooked);

			return {
				...std,
				isAvailable,
				isJummat: false,
			};
		});
	}, [availability, isFriday]);

	// Track which standard period indices are currently selected
	const selectedIndices = useMemo(() => {
		if (!selectedStartTime || !selectedEndTime) return new Set<number>();
		const set = new Set<number>();
		periods.forEach((p) => {
			if (p.start >= selectedStartTime && p.end <= selectedEndTime) {
				set.add(p.periodIndex);
			}
		});
		return set;
	}, [selectedStartTime, selectedEndTime, periods]);

	const handleSlotClick = (period: TimeSlotItem) => {
		if (!period.isAvailable || period.isJummat) return;

		if (!isEvent) {
			// Single slot selection for lectures
			onSelectSlot(period.start, period.end);
			return;
		}

		// For events: Allow consecutive slot selection
		if (selectedIndices.size === 0) {
			onSelectSlot(period.start, period.end);
			return;
		}

		const currentIndices = Array.from(selectedIndices).sort((a, b) => a - b);
		const minIndex = currentIndices[0];
		const maxIndex = currentIndices[currentIndices.length - 1];
		const targetIndex = period.periodIndex;

		if (selectedIndices.has(targetIndex)) {
			// Toggling off an edge slot
			if (currentIndices.length === 1) {
				onSelectSlot("", "");
			} else if (targetIndex === minIndex) {
				const nextPeriod = periods.find((p) => p.periodIndex === currentIndices[1]);
				const lastPeriod = periods.find((p) => p.periodIndex === maxIndex);
				if (nextPeriod && lastPeriod) {
					onSelectSlot(nextPeriod.start, lastPeriod.end);
				}
			} else if (targetIndex === maxIndex) {
				const firstPeriod = periods.find((p) => p.periodIndex === minIndex);
				const prevPeriod = periods.find((p) => p.periodIndex === currentIndices[currentIndices.length - 2]);
				if (firstPeriod && prevPeriod) {
					onSelectSlot(firstPeriod.start, prevPeriod.end);
				}
			} else {
				// Clicked in the middle of a range: reset to just this slot
				onSelectSlot(period.start, period.end);
			}
			return;
		}

		// Expanding range: Check if all intermediate slots between current range and target are available
		const newMin = Math.min(minIndex, targetIndex);
		const newMax = Math.max(maxIndex, targetIndex);

		let allAvailable = true;
		for (let i = newMin; i <= newMax; i++) {
			const p = periods.find((slot) => slot.periodIndex === i);
			if (!p || !p.isAvailable || p.isJummat) {
				allAvailable = false;
				break;
			}
		}

		if (allAvailable) {
			const firstP = periods.find((p) => p.periodIndex === newMin);
			const lastP = periods.find((p) => p.periodIndex === newMax);
			if (firstP && lastP) {
				onSelectSlot(firstP.start, lastP.end);
			}
		} else {
			// Intermediate slot unavailable; switch selection to this target slot
			onSelectSlot(period.start, period.end);
		}
	};

	if (!venueId) {
		return (
			<div className="p-3.5 rounded-xl border border-dashed border-border/70 bg-surface-raised/20 text-center">
				<Clock size={16} className="text-text-muted mx-auto mb-1.5" />
				<Text variant="caption" className="text-text-muted font-medium block">
					Please select a venue above to view available time slots.
				</Text>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5">
					<Clock size={14} className="text-primary" />
					<Text variant="caption" className="font-semibold text-text-main">
						Available Time Slots
					</Text>
					{isEvent && (
						<Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
							Consecutive Selection Enabled
						</Badge>
					)}
				</div>
				{selectedIndices.size > 0 && (
					<span className="text-[11px] font-medium text-primary">
						{selectedIndices.size * 2} hrs ({selectedStartTime?.slice(0, 5)} - {selectedEndTime?.slice(0, 5)})
					</span>
				)}
			</div>

			{isLoading ? (
				<div className="p-4 rounded-xl border border-border bg-surface-raised/20 flex items-center justify-center gap-2 text-text-muted text-xs">
					<div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
					<span>Checking live venue availability...</span>
				</div>
			) : error ? (
				<div className="p-3 rounded-xl border border-danger/20 bg-danger/5 text-danger flex items-center gap-2 text-xs">
					<AlertCircle size={14} />
					<span>{error}</span>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
					{periods.map((period) => {
						const isSelected = selectedIndices.has(period.periodIndex);
						const isJummat = period.isJummat;
						const isBlocked = !period.isAvailable && !isJummat;

						return (
							<button
								key={period.periodIndex}
								type="button"
								onClick={() => handleSlotClick(period)}
								disabled={!period.isAvailable || isJummat}
								className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
									isSelected
										? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
										: period.isAvailable
											? "border-border bg-surface-raised hover:border-primary/40 hover:bg-surface-raised/80 cursor-pointer"
											: "border-border/40 bg-surface/30 opacity-55 cursor-not-allowed"
								}`}
							>
								<div className="space-y-0.5 min-w-0 pr-1">
									<div className="flex items-center gap-1.5">
										<Clock
											size={12}
											className={
												isSelected
													? "text-primary"
													: period.isAvailable
														? "text-text-muted"
														: "text-text-subtle"
											}
										/>
										<span
											className={`text-xs font-semibold truncate ${
												isSelected ? "text-primary" : "text-text-main"
											}`}
										>
											{period.label}
										</span>
									</div>
									<div className="text-[10px] text-text-muted">
										{isJummat ? (
											<span className="text-amber-400 font-medium flex items-center gap-1">
												<Ban size={10} /> Jummat Break (Prohibited)
											</span>
										) : isBlocked ? (
											<span className="text-danger/80 font-medium">
												Unavailable / Booked
											</span>
										) : isSelected ? (
											<span className="text-primary font-medium">Selected</span>
										) : (
											<span className="text-emerald-400 font-medium">Available</span>
										)}
									</div>
								</div>

								{isSelected && (
									<div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
										<Check size={12} className="text-primary font-bold" />
									</div>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
