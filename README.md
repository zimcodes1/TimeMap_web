# TimeMap Web Admin Dashboard

Enterprise web administration portal for the TimeMap academic timetable, venue allocation, multi-tiered hierarchy, and discrepancy management platform. Built with React 19, TypeScript, Vite, TanStack Router, TanStack Query, and TailwindCSS.

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Technology Stack & Core Dependencies](#2-technology-stack--core-dependencies)
3. [Architecture & Design Patterns](#3-architecture--design-patterns)
   - [3.1 Four-Layer Separation (Routes $\to$ App $\to$ Pages $\to$ Components)](#31-four-layer-separation)
   - [3.2 Server State & TanStack Query Caching](#32-server-state--tanstack-query-caching)
   - [3.3 File-Based Routing with TanStack Router](#33-file-based-routing-with-tanstack-router)
4. [Monorepo & Directory Structure](#4-monorepo--directory-structure)
5. [Feature-by-Feature Implementation Guide](#5-feature-by-feature-implementation-guide)
   - [5.1 Public Landing & Feature Showcase (`/`)](#51-public-landing--feature-showcase-)
   - [5.2 Authentication & Security (`/login`, `/password-reset`)](#52-authentication--security-login-password-reset)
   - [5.3 Executive Dashboard & Analytics (`/dashboard`, `/dashboard/analytics`)](#53-executive-dashboard--analytics-dashboard-dashboardanalytics)
   - [5.4 Organizational Hierarchy Management (`/hierarchy`)](#54-organizational-hierarchy-management-hierarchy)
   - [5.5 Venues & Facilities Catalog (`/venues`)](#55-venues--facilities-catalog-venues)
   - [5.6 Courses & Cross-Department Access Sharing (`/courses`)](#56-courses--cross-department-access-sharing-courses)
   - [5.7 Academic Sessions & Semesters (`/semesters`)](#57-academic-sessions--semesters-semesters)
   - [5.8 Timetables & Master Lecture Schedule (`/schedules`)](#58-timetables--master-lecture-schedule-schedules)
   - [5.9 Automated Lecture Timetable Generator Suite (`/schedules/generator`)](#59-automated-lecture-timetable-generator-suite-schedulesgenerator)
   - [5.10 Examination Timetable Suite & Optimizer (`/exams`, `/exams/generator`)](#510-examination-timetable-suite--optimizer-exams-examsgenerator)
   - [5.11 Discrepancy Reschedule Requests Queue (`/requests`)](#511-discrepancy-reschedule-requests-queue-requests)
   - [5.12 Class Representative Audit Reports & Disputes (`/reports`)](#512-class-representative-audit-reports--disputes-reports)
   - [5.13 User Directory, Students & Lecturer Profiles (`/users`, `/students`)](#513-user-directory-students--lecturer-profiles-users-students)
   - [5.14 Notifications Center, Audit Logs & Calendar Feeds (`/notifications`, `/settings`)](#514-notifications-center-audit-logs--calendar-feeds-notifications-settings)
6. [API Client & Network Integration Architecture](#6-api-client--network-integration-architecture)
7. [Installation, Environment Setup & Running Guide](#7-installation-environment-setup--running-guide)
8. [Building, Linting & Type Checking](#8-building-linting--type-checking)
9. [Integrated Testing & Quality Checklist](#9-integrated-testing--quality-checklist)

---

## 1. Executive Overview

The **TimeMap Web Admin Dashboard** is the command center for institutional academic scheduling. It provides university, school, faculty, and departmental administrators with tools to:
- Construct and visualize complete institutional hierarchies (Schools, Faculties, Departments, Academic Programs).
- Manage physical venues, seating capacities, and equipment facility tags.
- Design recurring lecture timetables with automated real-time conflict detection.
- Execute pure-Python Genetic Algorithm optimization runs with live Server-Sent Events (SSE) progress streaming, side-by-side diagnostics, and atomic publication.
- Plan examination periods, optimize written multi-room seating and CBT parallel centre throughput, and assign invigilators.
- Triage and resolve lecturer reschedule discrepancy requests.
- Audit class representative lecture held/not-held verification reports and lecturer dispute threads.
- Export live timetable feeds to external calendar applications (Google Calendar, Outlook, Apple Calendar via iCal RFC 5545).

---

## 2. Technology Stack & Core Dependencies

| Layer | Library / Framework | Version | Purpose |
|---|---|---|---|
| **Framework** | React | `19.2+` | Component architecture and concurrent rendering |
| **Build Tool** | Vite | `8.1+` | Ultra-fast HMR and bundle compilation |
| **Language** | TypeScript | `6.0+` | End-to-end type safety across domain types and API contracts |
| **Routing** | `@tanstack/react-router` | `1.170+` | Type-safe, file-based routing with layout nesting and search params validation |
| **Data Fetching** | `@tanstack/react-query` | `5.101+` | Server state management, window caching, optimistic updates, and background invalidation |
| **Styling** | TailwindCSS | `4.3+` | High-performance atomic styling via `@tailwindcss/vite` |
| **Forms & Validation** | `react-hook-form` + `zod` | `7.83+` / `4.4+` | Declarative schema validation and zero-re-render form controls |
| **Data Visualization** | `recharts` | `3.10+` | Lecture-hold rate line charts, venue utilization histograms, and cohort distributions |
| **Animations** | `framer-motion` | `12.43+` | Modal transitions, drawer animations, and layout morphing |
| **Notifications** | `sonner` | `2.0+` | Toast notification delivery |
| **Icons** | `lucide-react` | `1.27+` | Consistent, accessible SVG icon library |
| **HTTP Client** | `axios` | `1.18+` | Centralized API client with JWT Bearer interceptors |

---

## 3. Architecture & Design Patterns

### 3.1 Four-Layer Separation

To maintain strict modularity, clean code, and predictable debugging, the frontend enforces a strict 4-layer pattern:

```
src/routes/ (Route Definition & Layout Wrapping)
    │
    ▼
src/app/ (Container Logic: Queries, Mutations, Modal State Orchestration)
    │
    ▼
src/pages/ (Visual Page View: Layout Composition & Section Grouping)
    │
    ▼
src/components/ (Domain Feature Components, Modals, Forms, and UI Primitives)
```

1. **`src/routes/`**: Thin route definitions declaring path parameters, search parameters, route guards, and title metadata.
2. **`src/app/`**: Container components handling `@tanstack/react-query` data fetches, mutations, toast feedback, and state for modals/drawers. Data and callbacks are passed down as props.
3. **`src/pages/`**: Pure UI page presentations receiving data props from `src/app/` and breaking pages into cohesive visual sections.
4. **`src/components/`**: Reusable feature cards, filters, tables, bottom modals, and UI primitives (`Button`, `Badge`, `Modal`, `Input`, `DataTable`).

### 3.2 Server State & TanStack Query Caching

Server state is centrally managed via TanStack Query. Cache keys are strictly namespaced:
- `["hierarchy", "schools"]`
- `["venues", "list", scopeDepartmentId]`
- `["courses", "list", departmentId]`
- `["scheduling", "entries", semesterId, departmentId, programId, level]`
- `["scheduling", "sessions", semesterId, weekNumber, startDate, endDate]`
- `["scheduling", "runs", semesterId]`
- `["exams", "runs", semesterId]`

**Cache Invalidation**: Mutations automatically invalidate relevant query keys on success. For example, publishing a timetable run invalidates `["scheduling", "entries"]` and `["scheduling", "sessions"]`, instantly updating matrix grids without full page reloads.

### 3.3 File-Based Routing with TanStack Router

Routes are automatically generated using `@tanstack/router-plugin`:
- `_auth`: Unauthenticated layout with split-screen branding (`/login`, `/forgot-password`, `/reset-password`).
- `_main`: Authenticated dashboard layout with responsive `SideNav`, `Topbar`, profile menu, and scope indicator.
- Dynamic route segments: `schedules_.generator_.$runId.tsx`, `exams_.generator_.$runId.tsx`, `lecturers_.$lecturerId.tsx`.

---

## 4. Monorepo & Directory Structure

```
TimeMap_web/
├── public/                 # Static assets, branding logos, favicon
├── src/
│   ├── api/                # Grouped API integration endpoints
│   │   ├── apiClient.ts    # Central Axios instance with JWT interceptors
│   │   ├── auth/           # Login, logout, profile, and password reset API
│   │   └── main/           # schedulesAPI, hierarchyAPI, coursesAPI, venuesAPI, generationAPI, examOptimizerAPI
│   ├── app/                # Route container controllers (data wiring, query hooks, modal state)
│   │   ├── auth/           # LoginContainer, ResetPasswordContainer
│   │   └── main/           # SchedulesContainer, HierarchyContainer, VenuesContainer, CoursesContainer, etc.
│   ├── components/         # Feature-grouped component library
│   │   ├── analytics/      # Hold rate tables, capacity deficit cards, departmental totals
│   │   ├── courses/        # Course exam settings, lecturer assignment selectors
│   │   ├── dashboard/      # Stat cards, hold-rate line charts, venue utilization histograms
│   │   ├── exams/          # Exam master view, weekly grid, cohort timeline, period banners
│   │   │   ├── generator/  # Exam config cards, run history modals
│   │   │   └── inspection/ # Exam diagnostics panels, run metrics cards, publish confirm modals
│   │   ├── hierarchy/      # Programs table, org tree visualizer
│   │   ├── landing/        # High-converting landing page sections (Hero, Features, Trust, FAQ)
│   │   ├── layouts/        # DashboardLayout, AuthSplitLayout
│   │   ├── lecturers/      # Lecturer profile headers, workload stats, assigned courses list
│   │   ├── main/           # SideNav, Topbar, Search bar, Profile dropdown, Notifications dropdown
│   │   ├── modals/         # 25+ domain modals (Create/Edit Venue, Shift, Discrepancy, Grants)
│   │   ├── schedules/      # TimetableAcademicGrid, TimetableListView, liveConflictResolver, WeekNavigator
│   │   │   └── generator/  # GA config cards, progress cards, conflict diagnostics panels, inspection grids
│   │   ├── semesters/      # Academic session accordion, semester activation controls
│   │   ├── students/       # Program student headcount editors and charts
│   │   └── ui/             # Reusable design system primitives (button, badge, modal, input, data-table)
│   ├── constants/          # Application constants, default values, day definitions
│   ├── contexts/           # AuthContext (JWT tokens, role profile, auto-refresh)
│   ├── hooks/              # Custom React hooks (useAuth, useDebounce, useMediaQuery)
│   ├── lib/                # Scope utilities, token storage helpers, string formatters
│   ├── pages/              # Visual view pages
│   │   ├── auth/           # LoginView, ForgotPasswordView, ResetPasswordView
│   │   └── main/           # DashboardView, SchedulesView, VenuesView, HierarchyView, ExamsView, etc.
│   ├── routes/             # TanStack Router file routes tree
│   ├── types/              # TypeScript interfaces (Course, Venue, TimetableEntry, LectureSession, ExamSitting)
│   └── utils/              # Semester weeks calculation, time formatters, conflict resolvers
├── index.html              # HTML5 entry template
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration with TailwindCSS and TanStack Router plugins
```

---

## 5. Feature-by-Feature Implementation Guide

### 5.1 Public Landing & Feature Showcase (`/`)

The public landing page (`src/pages/LandingPage.tsx`) presents an institutional overview of TimeMap:
- **Hero Section (`HeroSection.tsx`)**: High-impact headline with an interactive dual-view switcher allowing visitors to preview both the **Admin Web Dashboard** and the **Mobile Companion App**.
- **Interactive Previews**:
  - `AdminDashboardPreview.tsx`: Interactive mockup of the timetable matrix, conflict indicators, and analytics cards.
  - `MobileAppPreview.tsx`: Realistic mobile phone mockup showing today's lecture schedule and class rep reporting cards.
- **Institutional Alignment Sections**: Highlights how TimeMap solves university venue collisions, lecturer clashing, CBT exam saturation, and attendance opacity.
- **Direct Portal Access**: Quick action button routing authorized staff directly to `/login`.

---

### 5.2 Authentication & Security (`/login`, `/password-reset`)

- **Login Screen (`LoginView.tsx`)**: Split layout with brand visuals. Authenticates users using Staff ID or Matriculation Number with immediate JWT issuance.
- **Forced First-Login Password Reset Gate (`ResetPasswordView.tsx`)**: If `requires_password_reset = true` is returned on login, the user is locked from the dashboard and immediately redirected to `/reset-password`.
- **Auth Guard**: Protected routes verify active JWT authentication. Unauthenticated requests are redirected to `/login`.

---

### 5.3 Executive Dashboard & Analytics (`/dashboard`, `/dashboard/analytics`)

- **Role-Based Metric Stat Cards (`RoleBasedStatCards.tsx`)**: Displays Total Venues, Active Courses, Pending Discrepancies, and Unresolved Flags scoped to the logged-in admin's level.
- **Hold-Rate Line Chart (`HoldRateLineChart.tsx`)**: Visualizes weekly lecture delivery compliance trends using Recharts.
- **Venue Utilization Histogram (`VenueUtilizationCard.tsx`)**: Highlights peak room utilization percentages across academic slots.
- **Scope Filter Bar (`DashboardScopeFilterBar.tsx`)**: Enables School and University admins to filter analytics by Faculty, Department, and Date Range.
- **Exam Officer Quick Access (`ExamOfficerDashboardSection.tsx`)**: When an Exam Officer logs in, a dedicated banner highlights the current exam period status and offers quick access to the Exam Optimizer.

---

### 5.4 Organizational Hierarchy Management (`/hierarchy`)

- **Hierarchy Management View (`HierarchyView.tsx`)**: Tabs for Schools, Faculties, Departments, and Academic Programs.
- **Interactive Organizational Tree (`OrgTree.tsx`)**: Visual tree representing the university structure. Clicking a node filters child entities.
- **Modals**:
  - `CreateSchoolModal.tsx`, `EditSchoolModal.tsx`
  - `CreateFacultyModal.tsx`, `EditFacultyModal.tsx`
  - `CreateDepartmentModal.tsx`, `EditDepartmentModal.tsx`
  - `CreateProgramModal.tsx`, `EditProgramModal.tsx`
  - System catches and displays duplicate code errors in real time.

---

### 5.5 Venues & Facilities Catalog (`/venues`)

- **Venues Management View (`VenuesView.tsx`)**:
  - Venue cards and table listing room codes, names, building, owning department, and facility tags.
  - Standard Lecture Capacity vs Exam Seating Capacity breakdown.
- **Live Availability Inspector**: Administrators can verify any room's real-time bookings across academic slots.
- **Modals**:
  - `CreateVenueModal.tsx` & `EditVenueModal.tsx`: Room name, code, capacity, exam capacity, room type (`lecture_hall`, `laboratory`, `classroom`, `auditorium`), and facility checklist.
  - `ToggleVenueStatusModal.tsx`: Safely decommission or reactivate rooms.

---

### 5.6 Courses & Cross-Department Access Sharing (`/courses`)

- **Courses Management View (`CoursesView.tsx`)**:
  - Course registry displaying course code, title, level, owning department, target academic programs, and assigned lecturers.
  - Course Type: `lecture` (standard room) vs `practical` (laboratory required).
  - Exam Configuration: Exam Type (`written`, `cbt`, `lab_practical`) and duration in minutes.
- **Course Access Leasing (`CourseAccessGrant`)**:
  - `OfferAccessGrantModal.tsx`: Department offers a course to a receiving department.
  - `RequestAccessGrantModal.tsx`: Department requests permission to enroll students in another department's course.
  - `CancelAccessGrantModal.tsx`: Safely retracts shared access, instantly updating timetables.

---

### 5.7 Academic Sessions & Semesters (`/semesters`)

- **Sessions & Semesters View (`SessionsAndSemestersView.tsx`)**:
  - Accordion listing academic years (e.g., `2025/2026`).
  - Active semester indicator (`First` or `Second`).
  - Dates: Lecture teaching calendar and Examination period dates.
- **Actions**:
  - `EditAcademicSessionModal.tsx`: Manage session labels and date bounds.
  - `EditSemesterModal.tsx`: Configure start, end, and teaching calendar weeks.
  - `SetExamPeriodModal.tsx`: University/School level configuration of the examination date window.
  - `SetFacultyExamPeriodModal.tsx`: Decentralized faculty-specific exam periods.

---

### 5.8 Timetables & Master Lecture Schedule (`/schedules`)

- **Academic Matrix Table (`TimetableAcademicGrid.tsx`)**:
  - Displays the 5-day $\times$ 5-period academic matrix.
  - Friday `12:00 – 14:00` displays a dedicated **Jummat Break** blackout card.
  - **Live Conflict Badges**: Highlights Hard Conflicts (red shield) and Soft Capacity Warnings (amber triangle).
  - **Shifted Sessions & Vacated Notices**:
    - If a session is shifted to a new slot or venue, it appears in its new slot highlighted in amber with a `Shifted` badge and updated venue.
    - The original vacated slot displays a dashed card: `CSC301 (Shifted → 08:00)`, indicating that the room is now free.
  - **Past Lecture Badges**: Lectures whose dates have passed display gray `Past` badges.
- **List View (`TimetableListView.tsx`)**: Chronological card feed filterable by weekday, level, program, and search text.
- **Live Entry Detail & Conflict Modal (`LiveEntryDetailModal.tsx`)**:
  - Clicking any schedule card opens a complete detail sheet displaying course info, assigned lecturers, venue capacity, and detailed conflict diagnostics.
  - Triggers session shifting directly for eligible upcoming sessions.
- **Manual Booking & Conflict Modal (`ScheduleEntryModal.tsx` & `ConflictFeedbackModal.tsx`)**:
  - Clicking the `+` button in an empty slot allows manual booking.
  - If the backend returns `HARD_REJECT`, `ConflictFeedbackModal` displays a structured explanation of clashing entries and users.

---

### 5.9 Automated Lecture Timetable Generator Suite (`/schedules/generator`)

- **Generator Wizard (`ScheduleGeneratorView.tsx` & `GenerateTimetableModal.tsx`)**:
  - **Scope Selector**: Select School, Faculty, or Department scope.
  - **Pre-Feasibility Check**: Automatically verifies venue-time capacity ($O_k \le T \cdot V_k$). If deficient, displays an immediate deficit notice.
  - **GA Hyperparameters**: Configure population size (50–150), max generations (45–200), crossover rate (0.85), mutation rate (0.08), and stagnation patience (12–40).
- **Live Progress Streaming (`GenerationProgressCard.tsx`)**:
  - Connects to `GET /api/scheduling/generate/stream/` via Server-Sent Events (SSE).
  - Real-time animated progress bar showing current generation, best fitness score, active conflict count, and convergence notifications.
- **Run Inspection & Diagnostics (`ScheduleRunInspectionView.tsx`)**:
  - Detailed metrics cards (Hard Conflicts, Student Clashes, Lecturer Clashes, Venue Clashes, Capacity Penalty).
  - `ConflictDiagnosticsPanel.tsx`: Lists specific course collisions with exact reasons.
  - `RunTimetableAcademicGrid.tsx`: Side-by-side interactive grid of the generated schedule before publication.
  - `RunAllOccurrencesTable.tsx`: Searchable list of all occurrence placements.
- **Atomic Publishing (`PublishConfirmModal.tsx`)**:
  - Prompts administrator confirmation before atomically publishing the run to live `TimetableEntry` and `LectureSession` records.
- **Decentralized Permissions (`GenerationPermissionsModal.tsx`)**:
  - Allows School/University admins to grant or revoke generation rights for specific Faculty and Department administrators.

---

### 5.10 Examination Timetable Suite & Optimizer (`/exams`, `/exams/generator`)

- **Exam Master Timetable View (`ExamsView.tsx` & `ExamMasterScheduleView.tsx`)**:
  - Multi-week calendar view spanning the entire examination window.
  - Operates Monday through Saturday (Sundays excluded; Friday Jummat strictly blacked out).
  - Exam Event Cards: Color-coded by exam type (`written`, `cbt`, `lab_practical`).
  - Multi-room badges showing room allocations (e.g., `Hall A (300) + Hall B (200)`).
- **Exam Cohort Timeline Grid (`ExamCohortTimelineGrid.tsx`)**:
  - Horizontal timeline grouped by program and level, allowing inspection of student exam load distribution and verifying no two exams occur simultaneously for any cohort.
- **Exam Generator Wizard (`ExamOptimizerGeneratorView.tsx`)**:
  - Setup parameters: Target semester, scope, written multi-room threshold, and CBT parallel processing centres.
  - Evaluates all 11 Hard Constraints (H1–H11) and 6 Soft Objectives (S1–S6).
- **Exam Run Inspection & Publication (`ExamOptimizerRunInspectionView.tsx`)**:
  - Displays total exam events placed, written room pairs, CBT turns, and student workload distribution metrics.
  - `ExamPublishConfirmModal.tsx`: Confirms atomic publication of draft exam schedules into live `ExamSitting` records.

---

### 5.11 Discrepancy Reschedule Requests Queue (`/requests`)

- **Discrepancy Queue View (`RequestsView.tsx`)**:
  - Lists pending, approved, and rejected reschedule/cancel requests.
  - Shows requester, course, proposed venue, proposed date/slot, and submitted reason.
- **Slide-Over Detail Drawer (`DiscrepancyDetailSlideOver.tsx`)**:
  - Side-by-side comparison of original session vs proposed change.
  - Real-time conflict inspection on proposed slot.
  - One-click `Approve` (triggers atomic session update and notifications) or `Reject` (with admin reason notes).

---

### 5.12 Class Representative Audit Reports & Disputes (`/reports`)

- **Reports View (`ReportsView.tsx`)**:
  - Lists verified lecture audit reports submitted by class representatives.
  - Status badges: `Held` (green) or `Not Held` (red).
  - Shows submitted timestamp, notes, and required reason for unheld lectures.
- **Lecturer Dispute Threads (`DisputeResponseModal.tsx`)**:
  - Displays lecturer clarification comments on contested reports.
  - Allows department administrators to acknowledge flags and resolve disputed attendance records.

---

### 5.13 User Directory, Students & Lecturer Profiles (`/users`, `/students`)

- **User Accounts Directory (`UsersView.tsx`)**:
  - Filterable by role (`admin`, `lecturer`, `student`) and administrative level.
  - Displays identifier (Staff ID / Matric Number), email, scope, and status.
  - Modals: `CreateUserModal.tsx`, `EditUserModal.tsx`, `ResetPasswordModal.tsx`, `ToggleUserStatusModal.tsx`.
- **Student Headcount Editor (`StudentsView.tsx`)**:
  - `StudentCountEditor.tsx`: Allows department administrators to set official student population headcounts per program and level.
  - `StudentCountCharts.tsx`: Bar charts showing student population distributions across programs.
- **Dedicated Lecturer Profile View (`LecturerDetailsView.tsx`)**:
  - Accessible via `/lecturers/$lecturerId`.
  - Displays lecturer profile, department, assigned courses, weekly teaching hours, and hold-rate statistics.

---

### 5.14 Notifications Center, Audit Logs & Calendar Feeds (`/notifications`, `/settings`)

- **In-App Notification Center (`NotificationsView.tsx`)**:
  - Real-time notification feed with type filters (`SESSION_SHIFTED`, `DISCREPANCY_APPROVAL`, `REPORT_SUBMITTED`).
  - Unread count badge and one-click "Mark All as Read".
- **External Calendar Feeds (`ConnectCalendarModal.tsx` & `/settings`)**:
  - Generates secure, authenticated iCal calendar subscription URLs (`webcal://` or `https://`).
  - Compatible with Google Calendar, Microsoft Outlook, and Apple Calendar.
- **Audit Log Viewer (`AuditLogsView.tsx`)**:
  - Immutable audit trail of all administrative actions (session creation, schedule shifts, discrepancy resolutions).
  - `AuditSnapshotDiffModal.tsx`: Visual before/after diff of modified entities.

---

## 6. API Client & Network Integration Architecture

### 6.1 Centralized Axios Instance (`src/api/apiClient.ts`)

All HTTP communication is routed through a single Axios instance:
- **Base URL Resolution**: Defaults to `VITE_API_BASE_URL` or `http://localhost:8000/api`.
- **Request Interceptor**: Injects `Authorization: Bearer <access_token>` from `localStorage`.
- **Response Interceptor (Token Refresh)**:
  - Intercepts `401 Unauthorized` responses.
  - Attempts a one-time token refresh using `POST /api/auth/token/refresh/`.
  - Replays the original request with the renewed token.
  - If refresh fails, clears session storage and redirects to `/login`.
- **Global Error Handling**: Surfaces clean error messages to Sonner toasts.

### 6.2 Grouped API Integration Modules

Endpoints are modularized in `src/api/main/`:
- `hierarchyAPI.ts`: Schools, faculties, departments, and programs CRUD.
- `venuesAPI.ts`: Venues, capacities, facilities, and live availability lookups.
- `coursesAPI.ts`: Course registry, access leasing grants, and exam settings.
- `schedulesAPI.ts`: Timetable entries, lecture sessions, shifting, and materialization.
- `generationAPI.ts`: GA run parameters, SSE streaming progress, diagnostics, and publishing.
- `examOptimizerAPI.ts`: Exam runs, candidate windows, room allocation, and publishing.
- `discrepanciesAPI.ts`: Reschedule requests, approval routing, and resolution.
- `reportingAPI.ts`: Class rep reports, dispute threads, and audit flags.
- `analyticsAPI.ts`: Hold-rate trends, venue utilization histograms, and metrics.

---

## 7. Installation, Environment Setup & Running Guide

### 7.1 Prerequisites
- **Node.js**: Version `20.x` or higher (Node 22 LTS recommended)
- **Package Manager**: `npm` (v10+), `yarn` (v1.22+), or `pnpm`

### 7.2 Installation & Setup

1. **Enter the web directory**:
   ```bash
   cd TimeMapper/TimeMap_web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in `TimeMap_web/`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173/`.

---

## 8. Building, Linting & Type Checking

- **Type Check**:
  ```bash
  npx tsc --noEmit
  ```
- **Lint Codebase**:
  ```bash
  npm run lint
  ```
- **Production Build**:
  ```bash
  npm run build
  ```
  The production bundle is compiled to `dist/`.
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## 9. Integrated Testing & Quality Checklist

To perform an end-to-end audit of web portal workflows:

1. **Authentication Flow**:
   - Log in at `/login` with seeded administrator credentials (`TEST/ADMIN/001`).
   - Verify that first-time login forces redirection to `/password-reset`.
   - Update password and confirm redirect to `/dashboard`.
2. **Hierarchy & Venue Setup**:
   - Navigate to `/hierarchy` and create a School, Faculty, Department, and Academic Program.
   - Navigate to `/venues` and create a Venue with both Lecture Capacity (100) and Exam Capacity (60).
3. **Course & Student Headcount Setup**:
   - Navigate to `/courses` and create a Course (`CSC301`, 300L).
   - Navigate to `/students` and enter an official enrollment headcount of 85 students.
4. **Lecture Timetable Matrix**:
   - Navigate to `/schedules`. Click an empty slot in `TimetableAcademicGrid`.
   - Create a recurring entry and verify the 4-check conflict detection response (`PROCEED`).
   - Verify that `LectureSession` cards appear in the grid with room names and lecturer avatars.
5. **GA Timetable Generator Run**:
   - Navigate to `/schedules/generator`. Select department scope and click "Run Generator".
   - Watch the animated SSE progress bar and verify that the run completes.
   - Inspect diagnostics in `RunTimetableAcademicGrid.tsx` and click "Publish Timetable".
   - Return to `/schedules` and verify the live published timetable.
6. **Exam Timetable Optimizer Run**:
   - Navigate to `/exams/generator`. Set exam period dates and click "Run Exam Optimizer".
   - Inspect multi-room allocations and candidate counts.
   - Confirm publication and view the master exam schedule at `/exams`.
