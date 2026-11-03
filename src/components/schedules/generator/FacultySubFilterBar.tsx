import { School as SchoolIcon, Filter } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { Faculty } from "@/types";

interface FacultySubFilterBarProps {
	faculties: Faculty[];
	selectedFacultyId: string;
	onSelectFaculty: (facultyId: string) => void;
	schoolName?: string;
}

export function FacultySubFilterBar({
	faculties,
	selectedFacultyId,
	onSelectFaculty,
	schoolName,
}: FacultySubFilterBarProps) {
	if (faculties.length <= 1) {
		return null;
	}

	const options = [
		{ value: "ALL", label: "All Faculties in School" },
		...faculties.map((f) => ({
			value: String(f.id),
			label: `${f.code ? `[${f.code}] ` : ""}${f.name}`,
		})),
	];

	return (
		<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface border border-border rounded-2xl shadow-xs">
			<div className="flex items-center gap-2">
				<div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
					<SchoolIcon size={15} />
				</div>
				<div>
					<div className="text-xs font-bold text-text-main flex items-center gap-1.5">
						<span>Faculty Sub-Filter:</span>
						{schoolName && (
							<span className="text-text-muted font-normal text-[11px]">
								({schoolName})
							</span>
						)}
					</div>
					<div className="text-[10px] text-text-subtle">
						Filters departments and programs available in the navigation bar
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2.5 w-full sm:w-auto">
				<div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0 font-medium">
					<Filter size={13} className="text-primary" />
					<span>Active Faculty:</span>
				</div>

				<div className="w-full sm:w-64">
					<Select
						value={selectedFacultyId}
						onChange={(e) => onSelectFaculty(e.target.value)}
						options={options}
					/>
				</div>
			</div>
		</div>
	);
}
