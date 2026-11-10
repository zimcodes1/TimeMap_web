import { motion } from "framer-motion";
import {
  Shield,
  Building,
  BookOpen,
  Smartphone,
  User,
  Users,
  ChevronRight,
} from "lucide-react";

interface ScopeItem {
  Icon: typeof Shield;
  iconBg: string;
  iconColor: string;
  role: string;
  description: string;
}

const SCOPE_ITEMS: ScopeItem[] = [
  {
    Icon: Shield,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    role: "Institution Admin",
    description:
      "Full access to all faculties, all venues, and generation controls.",
  },
  {
    Icon: Building,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    role: "Faculty Admin",
    description:
      "Scoped to their faculty's departments, lecturers, and venue access grants.",
  },
  {
    Icon: BookOpen,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    role: "Department Admin",
    description:
      "Manage courses, lecturers, discrepancy queue for their department.",
  },
  {
    Icon: Smartphone,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    role: "Students & Class Reps",
    description:
      "Mobile app only. View schedules, file reports, receive notifications.",
  },
];

interface HierarchyNode {
  label: string;
  Icon: typeof User;
  iconColor: string;
  indent: number;
}

const HIERARCHY_NODES: HierarchyNode[] = [
  { label: "Institution Admin", Icon: Shield, iconColor: "text-emerald-600", indent: 0 },
  { label: "Faculty Admin (×N)", Icon: Building, iconColor: "text-blue-600", indent: 1 },
  { label: "Department Admin (×M)", Icon: BookOpen, iconColor: "text-violet-600", indent: 2 },
  { label: "Lecturer", Icon: User, iconColor: "text-amber-500", indent: 3 },
  { label: "Class Rep", Icon: Users, iconColor: "text-sky-500", indent: 4 },
  { label: "Student", Icon: User, iconColor: "text-text-muted", indent: 5 },
];

export default function RolesSection() {
  return (
    <section className="bg-surface py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-primary-muted text-primary border border-primary/20">
            Roles & Access
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            The Right Person Sees{" "}
            <span className="text-primary">the Right Data</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            TimeMapper enforces hierarchical administrative scope. Every action
            is scoped, attributable, and logged.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left — hierarchy tree */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-background rounded-2xl border border-border p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-5">
              Role Hierarchy
            </h3>
            <div className="flex flex-col gap-2">
              {HIERARCHY_NODES.map((node) => (
                <div
                  key={node.label}
                  className="flex items-center gap-2"
                  style={{ paddingLeft: `${node.indent * 20}px` }}
                >
                  {node.indent > 0 && (
                    <ChevronRight size={14} className="text-text-subtle flex-shrink-0" />
                  )}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-sm font-medium text-text-main`}
                  >
                    <node.Icon size={14} className={node.iconColor} />
                    {node.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — scope descriptions + audit note */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {SCOPE_ITEMS.map((item) => (
              <div
                key={item.role}
                className="flex gap-4 items-start bg-background rounded-2xl border border-border p-4 shadow-sm"
              >
                <div
                  className={`relative flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl ${item.iconBg} ring-1 ring-inset ring-white/50 shadow-sm overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                  <item.Icon size={18} className={`relative z-10 ${item.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main mb-0.5">
                    {item.role}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Audit trail note */}
            <div className="rounded-2xl bg-primary-muted border border-primary/20 p-4 flex gap-3 items-start">
              <Shield size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-primary mb-1">
                  Full Audit Trail
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Every publish, shift, approval, and role grant is timestamped
                  and attributed. Full traceability from first draft to published
                  timetable.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
