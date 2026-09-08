import {
  LayoutDashboard,
  Calendar,
  MapPin,
  AlertTriangle,
  ClipboardList,
  BookOpen,
  Settings,
  Building2,
  Users,
  ShieldCheck,
  Bell,
} from "lucide-react";
import type { ReactNode } from "react";

export interface NavChildItem {
  label: string;
  to: string;
}

export interface NavItem {
  label: string;
  icon: ReactNode;
  to: string;
  children?: NavChildItem[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        to: "/dashboard",
      },
    ],
  },
  {
    title: "Scheduling & Venues",
    items: [
      {
        label: "Timetables",
        icon: <Calendar size={18} />,
        to: "/schedules",
      },
      {
        label: "Venues & Facilities",
        icon: <MapPin size={18} />,
        to: "/venues",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Hierarchy Tree",
        icon: <Building2 size={18} />,
        to: "/hierarchy",
      },
      {
        label: "Courses & Sharing",
        icon: <BookOpen size={18} />,
        to: "/courses",
      },
      {
        label: "Discrepancy Requests",
        icon: <AlertTriangle size={18} />,
        to: "/requests",
      },
      {
        label: "Class Rep Reports",
        icon: <ClipboardList size={18} />,
        to: "/reports",
      },
      {
        label: "Students",
        icon: <Users size={18} />,
        to: "/students",
      },
      {
        label: "Staff Directory",
        icon: <Users size={18} />,
        to: "/users",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Audit Logs",
        icon: <ShieldCheck size={18} />,
        to: "/audit-logs",
      },
      {
        label: "Notifications",
        icon: <Bell size={18} />,
        to: "/notifications",
      },
      {
        label: "Settings",
        icon: <Settings size={18} />,
        to: "/settings",
      },
    ],
  },
];
