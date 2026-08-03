# Admin Web Dashboard — Pages, Modals & API Endpoint Mapping

This reference document outlines all the UI pages, modals, slide-overs, and forms required for the **TimeMap Admin Web Dashboard** (`TimeMap_web`), structured for UI scaffold creation prior to API integration.

---

## 1. SideNav Pages (Main Dashboard Navigation)

These pages are accessible directly from the primary `SideNav` sidebar and form the core administrative experience.

---

### 1.1 Dashboard & Analytics (`/dashboard`)
* **Purpose**: Overview of system activity, quick stats, and administrative analytics metrics.
* **SideNav Category**: Overview
* **Key UI Components**:
  * Metrics Cards: Total Venues, Active Courses, Pending Discrepancy Requests, Unreported Session Flags.
  * Charts: Lecture-Hold Rate (Bar/Line Chart), Venue Utilization (Bar Chart), Discrepancy Frequency (Pie/Donut Chart).
  * Filter Bar: Date Range Picker (`start_date`, `end_date`), Department / Course dropdowns, `group_by` selector.
* **Modals & Forms**:
  * *No dedicated modals* (filters operate directly on the page state).
* **API Endpoints & Methods**:
  * `GET /api/reporting/analytics/lecture-hold-rate/`
  * `GET /api/reporting/analytics/venue-utilization/`
  * `GET /api/reporting/analytics/discrepancy-frequency/`
  * `GET /api/discrepancies/requests/?status=pending` (for pending badge count)
  * `GET /api/reporting/flags/?acknowledged=false` (for unresolved flags badge count)

---

### 1.2 Hierarchy Management (`/hierarchy`)
* **Purpose**: Manage the institutional structure — Schools, Faculties, and Departments.
* **SideNav Category**: Management
* **Key UI Components**:
  * Tabs / Section Views: Schools List, Faculties List, Departments List.
  * Interactive Organizational Tree View.
  * Live Search & Scope Indicator (scoped by Department/Faculty/School Admin level).
* **Modals & Forms**:
  * **Create / Edit School Modal**: Form fields (`name`, `code`).
  * **Create / Edit Faculty Modal**: Form fields (`school`, `name`, `code`).
  * **Create / Edit Department Modal**: Form fields (`faculty`, `name`, `code`).
  * **Delete Confirmation Dialog**: Deletion warning prompt.
* **API Endpoints & Methods**:
  * `GET /api/hierarchy/schools/`
  * `POST /api/hierarchy/schools/`
  * `PUT / PATCH /api/hierarchy/schools/{id}/`
  * `DELETE /api/hierarchy/schools/{id}/`
  * `GET /api/hierarchy/faculties/`
  * `POST /api/hierarchy/faculties/`
  * `PUT / PATCH /api/hierarchy/faculties/{id}/`
  * `DELETE /api/hierarchy/faculties/{id}/`
  * `GET /api/hierarchy/departments/`
  * `POST /api/hierarchy/departments/`
  * `PUT / PATCH /api/hierarchy/departments/{id}/`
  * `DELETE /api/hierarchy/departments/{id}/`

---

### 1.3 Venues & Facilities (`/venues`)
* **Purpose**: Manage venue registry, capacity, facility tags, and operational availability.
* **SideNav Category**: Scheduling & Venues
* **Key UI Components**:
  * Venue Table / Grid: Name, Type, Capacity, Exam Capacity, Owning Level, Status (Active/Inactive).
  * Facilities Registry Side-Drawer / Tab: HD Projector, AC, Smart Board, etc.
  * Filter Bar: Venue Type, Owning Level, Facility multiselect.
* **Modals & Forms**:
  * **Create / Edit Venue Modal**: Form fields (`name`, `venue_type`, `capacity`, `exam_capacity`, `facilities` multiselect, `owning_level`, `owning_department`).
  * **Create / Edit Facility Modal**: Form fields (`name`).
  * **Deactivate / Activate Venue Confirmation Modal**: Modal warning about active timetable implications.
* **API Endpoints & Methods**:
  * `GET /api/venues/venues/`
  * `POST /api/venues/venues/`
  * `PUT / PATCH /api/venues/venues/{id}/`
  * `DELETE /api/venues/venues/{id}/`
  * `POST /api/venues/venues/{id}/activate/`
  * `POST /api/venues/venues/{id}/deactivate/`
  * `GET /api/venues/facilities/`
  * `POST /api/venues/facilities/`
  * `PUT / PATCH /api/venues/facilities/{id}/`
  * `DELETE /api/venues/facilities/{id}/`

---

### 1.4 Courses & Access Sharing (`/courses`)
* **Purpose**: Manage academic courses, student registrations, and cross-department course access grants.
* **SideNav Category**: Management
* **Key UI Components**:
  * Sub-Tabs: **Course Catalog**, **Course Access Grants (Sharing Queue)**, **Student Registrations**.
  * Course Table: Code, Title, Level, Owning Department, Assigned Lecturers count, Registration count.
  * Grant Queue: Pending incoming/outgoing access grant requests with approval status tags.
* **Modals & Forms**:
  * **Create / Edit Course Modal**: Form fields (`code`, `title`, `level`, `owning_level`, `owning_department`, `lecturers` multiselect).
  * **Offer Access Grant Modal**: Select target department/faculty/school to offer course access (`course`, `granted_to_level`, `granted_to_department`, `direction="offered"`).
  * **Request Access Grant Modal**: Browse external courses and submit a request to offer it in admin's scope (`course`, `granted_to_level`, `granted_to_department`, `direction="requested"`).
  * **Approve / Reject Grant Dialog**: Confirmation popup with optional reason input.
  * **Bulk Register Students Modal**: Register students for an academic session (`course`, `academic_session`).
* **API Endpoints & Methods**:
  * `GET /api/courses/courses/`
  * `POST /api/courses/courses/`
  * `PUT / PATCH /api/courses/courses/{id}/`
  * `DELETE /api/courses/courses/{id}/`
  * `GET /api/courses/grants/`
  * `POST /api/courses/grants/`
  * `POST /api/courses/grants/{id}/approve/`
  * `POST /api/courses/grants/{id}/reject/`
  * `DELETE /api/courses/grants/{id}/`
  * `GET /api/courses/registrations/`
  * `POST /api/courses/registrations/`
  * `DELETE /api/courses/registrations/{id}/`

---

### 1.5 Timetables & Scheduling (`/schedules`)
* **Purpose**: Central timetable view, session management, and booking entry creation for lectures, exams, and events.
* **SideNav Category**: Scheduling & Venues
* **Key UI Components**:
  * Calendar / List Toggle View: Daily, Weekly, and Monthly timetable grids.
  * Filter Bar: View by Venue, Course, Department, Entry Type (`lecture`, `exam`, `event`).
  * Sub-Navigation Routes: All Schedules (`/schedules`), Lecture Timetable (`/schedules/lectures`), Exam Timetable (`/schedules/exams`).
* **Modals & Forms**:
  * **Unified Schedule Entry Creation Modal**: Multi-step or tabbed form for entry creation:
    * *General*: `entry_type`, `title`, `course`, `venue`, `start_time`, `end_time`, `academic_session`.
    * *Lecture Recurrence Pattern*: Day of week, start/end dates, recurrence rule builder.
    * *Exam Extras*: `invigilators` multiselect, candidate count auto-calculation preview.
  * **Conflict & Outcome Feedback Modal**: Surfaced automatically upon submission:
    * **HARD_REJECT View**: Displays conflict details (venue clash, lecturer clash, student exam clash).
    * **ROUTE_APPROVAL View**: Explains that cross-scope booking was submitted and routed for approval.
  * **Single Session Edit (Override) Modal**: Shift date, time, or venue for a specific materialized `LectureSession` instance.
  * **Manual Materialize Action Dialog**: Button trigger to force session materialization for a recurring entry.
* **API Endpoints & Methods**:
  * `GET /api/scheduling/entries/`
  * `POST /api/scheduling/entries/` *(Triggers Conflict Engine: 201 PROCEED, 400 HARD_REJECT, 202 ROUTE_APPROVAL)*
  * `PUT / PATCH /api/scheduling/entries/{id}/`
  * `DELETE /api/scheduling/entries/{id}/`
  * `POST /api/scheduling/entries/{id}/materialize/`
  * `GET /api/scheduling/sessions/`
  * `PUT / PATCH /api/scheduling/sessions/{id}/`
  * `GET /api/scheduling/exam-sittings/`
  * `POST /api/scheduling/exam-sittings/`
  * `PUT / PATCH /api/scheduling/exam-sittings/{id}/`
  * `DELETE /api/scheduling/exam-sittings/{id}/`

---

### 1.6 Discrepancy Requests Queue (`/requests`)
* **Purpose**: Manage booking conflicts, venue/time shift requests, postponements, cancellations, and cross-level approvals.
* **SideNav Category**: Management
* **Key UI Components**:
  * Request Queue Table: Requester, Request Type (`shift_venue`, `shift_time`, `postpone`, `cancel`, `create_booking`), Affected Session/Entry, Status (`pending`, `approved`, `rejected`, `applied`, `withdrawn`).
  * Tab Filter: **Pending Approval** (Routed to me), **My Requests** (Submitted by me), **Historical Log**.
* **Modals & Forms**:
  * **Submit Discrepancy Request Modal**: Form choosing Instance-Level shift (`lecture_session`) vs Pattern-Level shift (`timetable_entry`), target proposed venue/time, and required `reason`.
  * **Discrepancy Detail & Approval Slide-Over**: Displays clash comparison (Original vs Proposed) with **Approve** & **Reject** buttons.
  * **Reject Discrepancy Dialog**: Requires entering rejection reason.
  * **Withdraw Request Confirmation Dialog**: Allows requester to cancel pending submission.
* **API Endpoints & Methods**:
  * `GET /api/discrepancies/requests/`
  * `POST /api/discrepancies/requests/`
  * `POST /api/discrepancies/requests/{id}/approve/`
  * `POST /api/discrepancies/requests/{id}/reject/`
  * `POST /api/discrepancies/requests/{id}/withdraw/`

---

### 1.7 Class Rep Reports & Flags (`/reports`)
* **Purpose**: Administrative oversight of student class rep lecture-hold submissions and automated unreported session flags.
* **SideNav Category**: Management
* **Key UI Components**:
  * Sub-Tabs: **Submitted Reports List**, **Unreported Flags Queue**.
  * Report Table: Course, Session Date/Time, Class Rep Name, Held Status (`Held` / `Not Held`), Rep Reason, Lecturer Response status.
  * Unreported Flags Queue: Flagged expired sessions, Flagged At timestamp, Acknowledgment Status.
* **Modals & Forms**:
  * **Report & Dispute Detail Modal**: Read report details and view lecturer dispute response thread.
  * **Lecturer Dispute Response Modal**: Submit lecturer response text (`response_text`).
  * **Acknowledge Flag Action Dialog**: Confirm acknowledgment of an unreported session flag.
  * **Trigger Manual Sweep Button**: Action button to run server-side sweep for expired sessions.
* **API Endpoints & Methods**:
  * `GET /api/reporting/reports/`
  * `POST /api/reporting/reports/{id}/respond/`
  * `GET /api/reporting/flags/`
  * `POST /api/reporting/flags/{id}/acknowledge/`
  * `POST /api/reporting/flags/trigger_sweep/`

---

### 1.8 User & Staff Management (`/users`)
* **Purpose**: Directory and access control management for Admins, Lecturers, and Students/Class Reps.
* **SideNav Category**: Management
* **Key UI Components**:
  * Sub-Tabs: **Admin Officers**, **Lecturers**, **Students / Class Reps**.
  * User Table: Identifier/Matric No, Full Name, Role, Scope/Department, Status (Active/Inactive), Password Reset Required badge.
* **Modals & Forms**:
  * **Create / Edit User Modal**: Universal user form parameterized by user role (`identifier`, `role`, `email`, `department`, `level`, `is_class_rep`, `scope_level`, etc.).
  * **Reset User Password Confirmation Modal**: Trigger forced password reset / reissue credentials.
  * **Toggle User Active Status Modal**: Deactivate or reactivate user account.
* **API Endpoints & Methods**:
  * `GET /api/auth/admins/` | `POST` | `PUT/PATCH` | `DELETE`
  * `GET /api/auth/lecturers/` | `POST` | `PUT/PATCH` | `DELETE`
  * `GET /api/auth/students/` | `POST` | `PUT/PATCH` | `DELETE`

---

### 1.9 Audit Log Viewer (`/audit-logs`)
* **Purpose**: System-wide security and operational audit trail log for tracking all entity mutations and approvals.
* **SideNav Category**: System
* **Key UI Components**:
  * Audit Log Table: Actor Identifier, Action (`create`, `update`, `delete`, `approve`, `reject`), Target Model, Target ID, Timestamp.
  * Search & Filter Panel: Filter by Actor ID, Target Model (`Venue`, `Course`, `TimetableEntry`, `DiscrepancyRequest`, etc.), Action Type, and Date Range.
* **Modals & Forms**:
  * **Audit Snapshot Diff Modal**: Side-by-side JSON viewer comparing `before_snapshot` vs `after_snapshot`.
* **API Endpoints & Methods**:
  * `GET /api/discrepancies/audit-logs/`

---

### 1.10 Notifications Center (`/notifications`)
* **Purpose**: In-app administrative notification inbox for real-time schedule alerts, approval updates, and flag alerts.
* **SideNav Category**: System *(also accessible from TopNav bell dropdown)*
* **Key UI Components**:
  * Notification List: Title, Body, Type badge, Timestamp, Read/Unread indicator.
  * Quick Filter: All, Unread Only.
* **Modals & Forms**:
  * *No separate modal* (clicking a item marks it as read and navigates to the related model detail view).
* **API Endpoints & Methods**:
  * `GET /api/notifications/inbox/`
  * `POST /api/notifications/inbox/{id}/read/`
  * `POST /api/notifications/inbox/mark-all-read/`
  * `GET /api/notifications/inbox/unread-count/`

---

### 1.11 System Settings & Calendar Sync (`/settings`)
* **Purpose**: Admin profile settings, Google Calendar OAuth integration, and system preferences.
* **SideNav Category**: System
* **Key UI Components**:
  * User Profile Card & Role Scope Details.
  * Integrations Panel: Google Calendar Connection card (Connected status badge, Sync toggle).
  * Web Push Notification preferences toggle.
* **Modals & Forms**:
  * **Connect / Disconnect Google Calendar OAuth Modal**: OAuth prompt trigger and connection status confirmation.
  * **Register Web Push Token Action**: Browser permission prompt & FCM token registration.
* **API Endpoints & Methods**:
  * `GET /api/auth/profile/`
  * `POST /api/notifications/devices/`
  * `POST /api/notifications/devices/deactivate/`

---

## 2. Non-SideNav Pages (Auth, Detail & Standalone Routes)

These pages are **NOT** rendered inside the main SideNav navigation menu — they serve as dedicated entryways, authentication flows, or deep detail views.

---

### 2.1 Login Page (`/login`)
* **Purpose**: Primary authentication entryway for all web dashboard users.
* **SideNav Inclusion**: ❌ **NO (Standalone)**
* **Key UI Components**:
  * Split-screen branding card with logo, institutional title, and login form.
* **Modals & Forms**:
  * **Login Form**: Identifier (`matric_number`, `staff_id`, or `username`) and Password fields.
* **API Endpoints & Methods**:
  * `POST /api/auth/login/`

---

### 2.2 Forced First-Login Password Reset Page (`/password-reset`)
* **Purpose**: Mandatory gate page displayed when a user logs in with `requires_password_reset = true`.
* **SideNav Inclusion**: ❌ **NO (Protected Gate Route)**
* **Key UI Components**:
  * Security requirement notice banner explaining mandatory first-login password update.
* **Modals & Forms**:
  * **Password Reset Form**: New Password and Confirm Password fields with strength indicator.
* **API Endpoints & Methods**:
  * `POST /api/auth/password-reset/`

---

### 2.3 Course Detail Page (`/courses/$courseId`)
* **Purpose**: Comprehensive view of a specific course, assigned teaching staff, student enrollment, and active grants.
* **SideNav Inclusion**: ❌ **NO (Sub-route accessed from Course List)**
* **Key UI Components**:
  * Course Header info, Assigned Lecturers list, Registered Students table, Granted Department permissions table.
* **Modals & Forms**:
  * **Assign / Unassign Lecturer Modal**: Form to manage `lecturers` array on course.
* **API Endpoints & Methods**:
  * `GET /api/courses/courses/{id}/`
  * `PUT / PATCH /api/courses/courses/{id}/`
  * `GET /api/courses/registrations/?course={id}`

---

### 2.4 Venue Detail & Schedule Page (`/venues/$venueId`)
* **Purpose**: Deep-dive operational view of a specific venue, its capacity, facility list, and upcoming bookings calendar.
* **SideNav Inclusion**: ❌ **NO (Sub-route accessed from Venue List)**
* **Key UI Components**:
  * Venue Info & Specs Card, Facility tags grid, Live Venue Schedule Calendar.
* **Modals & Forms**:
  * **Quick Booking Modal**: Shortcut to pre-select this venue in schedule creation.
* **API Endpoints & Methods**:
  * `GET /api/venues/venues/{id}/`
  * `GET /api/scheduling/sessions/?venue={id}`

---

### 2.5 Timetable Entry / Session Detail Page (`/schedules/$entryId`)
* **Purpose**: Detailed breakdown of a parent timetable entry and all of its materialized dated `LectureSession` instances.
* **SideNav Inclusion**: ❌ **NO (Sub-route accessed from Timetable Grid)**
* **Key UI Components**:
  * Entry summary (Recurrence pattern, Course, Venue, Time), Session history timeline table with status indicators (`scheduled`, `shifted`, `postponed`, `cancelled`, `held`, `not_held`).
* **Modals & Forms**:
  * **Batch Shift / Discrepancy Request Modal**: Trigger discrepancy submission directly for this timetable entry.
* **API Endpoints & Methods**:
  * `GET /api/scheduling/entries/{id}/`
  * `GET /api/scheduling/sessions/?timetable_entry={id}`

---

### 2.6 Not Found / Unauthorized Error Pages (`/404`, `/403`)
* **Purpose**: User-friendly fallback screens for invalid URLs or permission hierarchy violations.
* **SideNav Inclusion**: ❌ **NO (System Error Fallback)**
* **Modals & Forms**: None.

---

## 3. Quick Reference: UI Components & API Endpoints Summary Matrix

| Page / Route | SideNav? | Modal / Form Component | Backend API Endpoint | Method |
|---|---|---|---|---|
| **`/login`** | ❌ No | Login Form | `/api/auth/login/` | `POST` |
| **`/password-reset`** | ❌ No | Password Reset Form | `/api/auth/password-reset/` | `POST` |
| **`/dashboard`** | ✅ Yes | Date Range & Department Filter | `/api/reporting/analytics/*` | `GET` |
| **`/hierarchy`** | ✅ Yes | Create/Edit School Modal | `/api/hierarchy/schools/` | `GET`, `POST`, `PUT`, `DELETE` |
| | | Create/Edit Faculty Modal | `/api/hierarchy/faculties/` | `GET`, `POST`, `PUT`, `DELETE` |
| | | Create/Edit Department Modal | `/api/hierarchy/departments/` | `GET`, `POST`, `PUT`, `DELETE` |
| **`/venues`** | ✅ Yes | Create/Edit Venue Modal | `/api/venues/venues/` | `GET`, `POST`, `PUT`, `DELETE` |
| | | Activate / Deactivate Modal | `/api/venues/venues/{id}/(de)activate/` | `POST` |
| | | Create/Edit Facility Modal | `/api/venues/facilities/` | `GET`, `POST`, `PUT`, `DELETE` |
| **`/courses`** | ✅ Yes | Create/Edit Course Modal | `/api/courses/courses/` | `GET`, `POST`, `PUT`, `DELETE` |
| | | Offer Access Grant Modal | `/api/courses/grants/` | `POST` |
| | | Request Access Grant Modal | `/api/courses/grants/` | `POST` |
| | | Approve/Reject Grant Dialog | `/api/courses/grants/{id}/approve/` | `POST` |
| **`/schedules`** | ✅ Yes | Schedule Entry Creation Modal | `/api/scheduling/entries/` | `POST` *(PROCEED / REJECT / ROUTE)* |
| | | Single Session Shift Modal | `/api/scheduling/sessions/{id}/` | `PUT`, `PATCH` |
| | | Create Exam Sitting Modal | `/api/scheduling/exam-sittings/` | `POST` |
| **`/requests`** | ✅ Yes | Submit Discrepancy Modal | `/api/discrepancies/requests/` | `POST` |
| | | Approve Discrepancy Action | `/api/discrepancies/requests/{id}/approve/` | `POST` |
| | | Reject Discrepancy Dialog | `/api/discrepancies/requests/{id}/reject/` | `POST` |
| **`/reports`** | ✅ Yes | Dispute Response Modal | `/api/reporting/reports/{id}/respond/` | `POST` |
| | | Acknowledge Flag Dialog | `/api/reporting/flags/{id}/acknowledge/` | `POST` |
| **`/users`** | ✅ Yes | Create/Edit User Modal | `/api/auth/(admins\|lecturers\|students)/` | `GET`, `POST`, `PUT`, `DELETE` |
| **`/audit-logs`**| ✅ Yes | Audit Snapshot Diff Modal | `/api/discrepancies/audit-logs/` | `GET` |
| **`/notifications`**| ✅ Yes | Mark All Read Button | `/api/notifications/inbox/mark-all-read/` | `POST` |
| **`/settings`** | ✅ Yes | Calendar OAuth Modal | Connected to Google OAuth / Profile | `GET`, `POST` |

---

## 4. Next Steps for UI Development

1. **Scaffold Pages**: Create route files in `src/routes/` for all SideNav and Non-SideNav paths listed above using TanStack Router.
2. **Build Shared Component Primitives**: Dialog/Modal containers, Form controls (Selects, DatePickers, TimePickers), Data Table wrappers, and Badges.
3. **Build Form & Modal Stubs**: Create dialog components with typed state schemas ready to receive React Query mutation hooks during API integration.
