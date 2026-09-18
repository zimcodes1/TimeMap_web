import { useState, useMemo } from "react";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { Search, X, Check } from "lucide-react";
import type { User } from "@/types";

interface LecturerAssignmentSelectorProps {
	lecturers: User[];
	selectedLecturerIds: string[];
	onToggleLecturer: (id: string) => void;
	maxHeight?: string;
}

export default function LecturerAssignmentSelector({
	lecturers,
	selectedLecturerIds,
	onToggleLecturer,
	maxHeight = "max-h-[220px]",
}: LecturerAssignmentSelectorProps) {
	const [search, setSearch] = useState("");

	const filteredLecturers = useMemo(() => {
		let list = lecturers;
		if (search.trim()) {
			const q = search.toLowerCase().trim();
			list = list.filter(
				(l) =>
					l.name?.toLowerCase().includes(q) ||
					l.identifier?.toLowerCase().includes(q) ||
					l.staffId?.toLowerCase().includes(q) ||
					l.departmentName?.toLowerCase().includes(q) ||
					l.email?.toLowerCase().includes(q),
			);
		}

		// Sort selected items to the top so the admin can always view currently assigned staff
		return [...list].sort((a, b) => {
			const aSel = selectedLecturerIds.includes(String(a.id));
			const bSel = selectedLecturerIds.includes(String(b.id));
			if (aSel && !bSel) return -1;
			if (!aSel && bSel) return 1;
			return (a.name || "").localeCompare(b.name || "");
		});
	}, [lecturers, search, selectedLecturerIds]);

	return (
		<div className="space-y-2 pt-2 border-t border-border">
			<div className="flex items-center justify-between">
				<label className="text-xs font-semibold text-text-main block">
					Assign Teaching Staff ({selectedLecturerIds.length} Selected)
				</label>
				<span className="text-[11px] text-text-muted">
					{lecturers.length} total staff
				</span>
			</div>

			{/* Search Bar */}
			{lecturers.length > 0 && (
				<Input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search staff by name, staff ID, or department..."
					leftIcon={<Search size={13} className="text-text-subtle" />}
					rightIcon={
						search ? (
							<button
								type="button"
								onClick={() => setSearch("")}
								className="hover:text-text-main cursor-pointer p-0.5"
								title="Clear search"
							>
								<X size={13} />
							</button>
						) : undefined
					}
					className="h-8 text-xs bg-surface"
				/>
			)}

			{/* Lecturers List - Displays max 5 items visible with smooth scroll */}
			<div
				className={`${maxHeight} overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-surface`}
			>
				{lecturers.length === 0 ? (
					<Text
						variant="caption"
						color="muted"
						className="p-3 block text-center"
					>
						No lecturers available to assign.
					</Text>
				) : filteredLecturers.length === 0 ? (
					<div className="p-3 text-center space-y-1">
						<Text variant="caption" color="muted" className="block">
							No staff matching &ldquo;{search}&rdquo;
						</Text>
						<button
							type="button"
							onClick={() => setSearch("")}
							className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
						>
							Clear search filter
						</button>
					</div>
				) : (
					filteredLecturers.map((lec) => {
						const isSelected = selectedLecturerIds.includes(String(lec.id));
						return (
							<button
								key={lec.id}
								type="button"
								onClick={() => onToggleLecturer(String(lec.id))}
								className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer border ${
									isSelected
										? "bg-primary/10 border-primary/30 text-text-main shadow-2xs"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-main border-border"
								}`}
							>
								<div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
									{/* Multi-select indicator icon with green accent on select */}
									<div
										className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
											isSelected
												? "bg-primary border-primary text-primary-foreground"
												: "border-border-strong bg-surface text-transparent hover:border-primary/50"
										}`}
									>
										<Check
											size={11}
											strokeWidth={3}
											className={isSelected ? "opacity-100" : "opacity-0"}
										/>
									</div>

									<div className="min-w-0 flex-1">
										<div className="font-semibold truncate">{lec.name}</div>
										<div className="text-[10px] text-text-muted truncate">
											{lec.staffId || lec.identifier || "Staff"}
											{lec.departmentName ? ` • ${lec.departmentName}` : ""}
										</div>
									</div>
								</div>

								{/* Status pill badge */}
								<span
									className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 transition-colors ${
										isSelected
											? "font-bold text-primary bg-primary/15 border border-primary/30"
											: "font-medium text-text-muted border border-border"
									}`}
								>
									{isSelected ? "Assigned" : "Assign"}
								</span>
							</button>
						);
					})
				)}
			</div>
		</div>
	);
}
