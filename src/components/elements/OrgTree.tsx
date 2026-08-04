import { useState } from 'react';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { Badge } from '../ui/badge';
import { School as SchoolIcon, Network, Building2, ChevronRight, ChevronDown } from 'lucide-react';
import type { School, Faculty, Department } from '@/types';

interface OrgTreeProps {
  schools: School[];
  faculties: Faculty[];
  departments: Department[];
}

export function OrgTree({ schools, faculties, departments }: OrgTreeProps) {
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({
    [schools[0]?.id || '']: true,
  });
  const [expandedFaculties, setExpandedFaculties] = useState<Record<string, boolean>>({
    [faculties[0]?.id || '']: true,
  });

  const toggleSchool = (id: string) => {
    setExpandedSchools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFaculty = (id: string) => {
    setExpandedFaculties((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <Text variant="h6" weight="bold">
            Institutional Organizational Tree
          </Text>
          <Text variant="caption" color="muted">
            Hierarchy diagram showing relationship between Schools, Faculties, and Departments.
          </Text>
        </div>
        <Badge variant="primary">
          {schools.length} Schools • {faculties.length} Faculties • {departments.length} Depts
        </Badge>
      </div>

      <div className="space-y-3">
        {schools.map((school) => {
          const isSchoolExpanded = expandedSchools[school.id] ?? false;
          const schoolFaculties = faculties.filter(
            (f) => f.schoolId === school.id || f.schoolName === school.name
          );

          return (
            <div key={school.id} className="border border-border rounded-xl bg-surface overflow-hidden">
              {/* School Node Header */}
              <div
                onClick={() => toggleSchool(school.id)}
                className="flex items-center justify-between p-3 bg-surface-raised hover:bg-secondary/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isSchoolExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <SchoolIcon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-text-main flex items-center gap-2">
                      {school.name}
                      <span className="text-xs text-primary font-mono font-extrabold">({school.code})</span>
                    </div>
                    <div className="text-xs text-text-muted">School Level Node</div>
                  </div>
                </div>
                <Badge variant="default">{schoolFaculties.length} Faculties</Badge>
              </div>

              {/* Faculties under School */}
              {isSchoolExpanded && (
                <div className="p-3 pl-8 space-y-3 border-t border-border/60 bg-surface/50">
                  {schoolFaculties.length > 0 ? (
                    schoolFaculties.map((faculty) => {
                      const isFacultyExpanded = expandedFaculties[faculty.id] ?? false;
                      const facultyDepts = departments.filter(
                        (d) => d.facultyId === faculty.id || d.facultyName === faculty.name
                      );

                      return (
                        <div
                          key={faculty.id}
                          className="border border-border/80 rounded-xl bg-surface overflow-hidden"
                        >
                          {/* Faculty Node */}
                          <div
                            onClick={() => toggleFaculty(faculty.id)}
                            className="flex items-center justify-between p-2.5 bg-surface-raised/80 hover:bg-secondary/40 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {isFacultyExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                                <Network size={16} />
                              </div>
                              <div>
                                <div className="font-bold text-sm text-text-main flex items-center gap-2">
                                  {faculty.name}
                                  <span className="text-xs text-blue-600 font-mono font-extrabold">
                                    ({faculty.code})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="default" className="text-[10px]">
                              {facultyDepts.length} Departments
                            </Badge>
                          </div>

                          {/* Departments under Faculty */}
                          {isFacultyExpanded && (
                            <div className="p-2.5 pl-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 border-t border-border/40 bg-surface-raised/30">
                              {facultyDepts.length > 0 ? (
                                facultyDepts.map((dept) => (
                                  <div
                                    key={dept.id}
                                    className="p-2 rounded-lg border border-border/60 bg-surface flex items-center gap-2"
                                  >
                                    <div className="p-1 rounded bg-amber-50 text-amber-600">
                                      <Building2 size={14} />
                                    </div>
                                    <div>
                                      <div className="font-bold text-xs text-text-main">{dept.name}</div>
                                      <div className="text-[10px] text-primary font-mono font-bold">
                                        Code: {dept.code}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-text-subtle p-2">No departments under this faculty</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-text-subtle p-2">No faculties registered under this school</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
