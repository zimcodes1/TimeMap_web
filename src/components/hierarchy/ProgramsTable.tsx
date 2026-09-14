import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plus, Edit2, Trash2 } from "lucide-react";
import type { Program } from "@/types";

interface ProgramsTableProps {
	programs: Program[];
	isLoading?: boolean;
	canManage: boolean;
	onOpenCreate: () => void;
	onEdit: (program: Program) => void;
	onDelete: (id: string, name: string) => void;
}

export function ProgramsTable({
	programs,
	isLoading = false,
	canManage,
	onOpenCreate,
	onEdit,
	onDelete,
}: ProgramsTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	const filteredPrograms = programs.filter(
		(p) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(p.departmentName &&
				p.departmentName.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	return (
		<div className="space-y-4">
			<TableToolbar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				searchPlaceholder="Search programs by name, code, or department..."
				totalCount={programs.length}
				filteredCount={filteredPrograms.length}
			/>

			{isLoading ? (
				<div className="space-y-3 bg-surface border border-border p-4 rounded-2xl">
					<div className="flex items-center justify-between pb-3 border-b border-border">
						<Skeleton className="h-5 w-36" />
						<Skeleton className="h-5 w-24" />
					</div>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between py-3 border-b border-border/50"
						>
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-44" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-7 w-28 rounded-lg" />
						</div>
					))}
				</div>
			) : filteredPrograms.length === 0 ? (
				<div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
					<div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-subtle">
						<BookOpen size={24} />
					</div>
					<Text variant="h6" weight="bold" className="text-text-main">
						No programs found
					</Text>
					<Text variant="body-sm" color="muted">
						{programs.length === 0
							? "No programs have been configured in your department scope yet."
							: "No academic programs match your search query."}
					</Text>
					{canManage && (
						<Button
							variant="primary"
							size="sm"
							onClick={onOpenCreate}
							className="mt-2 cursor-pointer"
						>
							<Plus size={16} className="mr-1" /> Add Program
						</Button>
					)}
				</div>
			) : (
				<DataTable
					columns={[
						{
							header: "Program Code",
							accessor: (prog: Program) => (
								<span className="font-bold text-primary">{prog.code}</span>
							),
						},
						{
							header: "Program Name",
							accessor: (prog: Program) => (
								<div className="flex items-center gap-2">
									<span className="font-medium text-text-main">
										{prog.name}
									</span>
									{prog.isDefault && (
										<Badge
											variant="primary"
											className="text-[10px] py-0 px-1.5"
										>
											Default
										</Badge>
									)}
								</div>
							),
						},
						{
							header: "Department",
							accessor: (prog: Program) => (
								<span className="text-text-muted">
									{prog.departmentName || "Department"}
								</span>
							),
						},
						{
							header: "Max Level",
							accessor: (prog: Program) => (
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-surface-raised text-text-muted border border-border">
									{prog.maxLevel} Level
								</span>
							),
						},
						...(canManage
							? [
									{
										header: "Actions",
										align: "right" as const,
										accessor: (prog: Program) => (
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="outline"
													size="sm"
													onClick={() => onEdit(prog)}
													className="h-8 px-2 text-xs cursor-pointer"
												>
													<Edit2 size={13} className="mr-1" /> Edit
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														!prog.isDefault && onDelete(prog.id, prog.name)
													}
													disabled={prog.isDefault}
													title={
														prog.isDefault
															? "Default department program cannot be deleted"
															: "Delete program"
													}
													className={`h-8 px-2 text-xs cursor-pointer ${
														prog.isDefault
															? "opacity-40 cursor-not-allowed"
															: "text-danger hover:bg-danger-surface border-danger-surface"
													}`}
												>
													<Trash2 size={13} />
												</Button>
											</div>
										),
									},
								]
							: []),
					]}
					data={filteredPrograms}
					keyExtractor={(p) => p.id}
					currentPage={currentPage}
					onPageChange={setCurrentPage}
				/>
			)}
		</div>
	);
}
