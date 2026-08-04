import type { User } from "@/types";

export const dummyLoggedInUser: User = {
  id: "USR-001",
  identifier: "NSUK/STF/2024/0042",
  name: "Dr. Amina Bello",
  email: "amina.bello@nsuk.edu.ng",
  role: "admin",
  staffId: "NSUK/STF/2024/0042",
  isActive: true,
};

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: "conflict" | "request" | "system";
}

export const dummyNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Venue Conflict Detected",
    message: "SLT-A has overlapping bookings for CSC 301 and EEE 402 on Monday at 09:00 AM.",
    time: "10m ago",
    unread: true,
    type: "conflict",
  },
  {
    id: "notif-2",
    title: "New Discrepancy Request",
    message: "Dr. Claude Shannon requested a venue shift for EEE 402.",
    time: "1h ago",
    unread: true,
    type: "request",
  },
  {
    id: "notif-3",
    title: "Class Rep Report Submitted",
    message: "David K. submitted a report for CSC 301 lecture session.",
    time: "3h ago",
    unread: false,
    type: "system",
  },
];

export interface SearchItem {
  id: string;
  title: string;
  category: "Venue" | "Course" | "Request" | "User";
  subtitle: string;
  to: string;
}

export const dummySearchItems: SearchItem[] = [
  {
    id: "search-1",
    title: "Science Lecture Theatre A (SLT-A)",
    category: "Venue",
    subtitle: "Faculty of Science • Capacity 350",
    to: "/venues",
  },
  {
    id: "search-2",
    title: "CSC 301 - Database Systems & Architecture",
    category: "Course",
    subtitle: "Department of Computer Science",
    to: "/courses",
  },
  {
    id: "search-3",
    title: "EEE 402 Venue Shift Request",
    category: "Request",
    subtitle: "Pending approval • Target: Faculty",
    to: "/requests",
  },
  {
    id: "search-4",
    title: "Dr. Sarah Jenkins",
    category: "User",
    subtitle: "HOD Computer Science",
    to: "/settings",
  },
];
