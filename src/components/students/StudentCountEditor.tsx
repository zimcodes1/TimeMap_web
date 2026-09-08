import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function StudentCountEditor({ departmentName, maxLevel, countsByLevel, onSave, saving }: { departmentName: string; maxLevel: number; countsByLevel: Map<number, number>; onSave: (level: number, count: number) => Promise<void>; saving: boolean }) {
  const [level, setLevel] = useState("100");
  const currentCount = countsByLevel.get(Number(level));
  const [value, setValue] = useState(currentCount?.toString() ?? "");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => setValue(currentCount?.toString() ?? ""), [currentCount]);
  useEffect(() => setIsEditing(false), [level]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const count = Number(value);
    if (!Number.isInteger(count) || count < 0) { setError("Enter a whole number that is zero or greater."); return; }
    setError(""); await onSave(Number(level), count); setIsEditing(false);
  };
  const levelOptions = Array.from({ length: Math.floor(maxLevel / 100) }, (_, index) => ({ value: String((index + 1) * 100), label: `${(index + 1) * 100} Level` }));
  const hasExistingTotal = currentCount !== undefined;
  const cancelEdit = () => { setValue(currentCount?.toString() ?? ""); setError(""); setIsEditing(false); };
  return <Card><CardHeader><CardTitle>Your department’s planning totals</CardTitle><CardDescription>Record the current number of students in {departmentName} for each academic level. Existing totals require an explicit edit to prevent routine changes.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"><Select label="Academic level" value={level} onChange={(event) => setLevel(event.target.value)} options={levelOptions} /><Input label="Number of students" type="number" min="0" step="1" value={value} onChange={(event) => setValue(event.target.value)} error={error} placeholder="e.g. 120" disabled={hasExistingTotal && !isEditing} />{hasExistingTotal && !isEditing ? <Button type="button" variant="outline" onClick={() => setIsEditing(true)}><Pencil size={15} className="mr-1" />Edit total</Button> : <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save total"}</Button>{hasExistingTotal && <Button type="button" variant="outline" onClick={cancelEdit} disabled={saving}>Cancel</Button>}</div>}</form></CardContent></Card>;
}
