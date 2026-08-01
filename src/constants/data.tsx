import {
  LayoutDashboard,
  Calendar,
  MapPin,
  AlertTriangle,
  ClipboardList,
  BookOpen,
  Settings,
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
        children: [
          { label: "All Schedules", to: "/schedules" },
          { label: "Lecture Timetable", to: "/schedules/lectures" },
          { label: "Exam Timetable", to: "/schedules/exams" },
        ],
      },
      {
        label: "Venues",
        icon: <MapPin size={18} />,
        to: "/venues",
      },
    ],
  },
  {
    title: "Management",
    items: [
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
        label: "Courses & Staff",
        icon: <BookOpen size={18} />,
        to: "/courses",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        icon: <Settings size={18} />,
        to: "/settings",
      },
    ],
  },
];
