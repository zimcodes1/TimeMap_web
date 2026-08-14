# TimeMapper Admin Web Portal — Comprehensive Integrated Manual Testing Guide

## Purpose & Scope
This document is a highly detailed, non-abstract, step-by-step manual testing guide for the **TimeMapper Admin Web Portal**. It is designed for manual QA testers, junior developers, or security auditors to verify every interactive control, data table, preloader state, backend API integration, and edge case flag across the portal. 

**CRITICAL ASSUMPTION**: This guide assumes a completely **unseeded, fresh database**. The tester must manually bootstrap the organizational structure from scratch before testing user-scoped features.

---

## 1. Global Setup & Environment Verification

### 1.1 Prerequisites
Ensure both the backend server and web client are running locally on a fresh database:
*   **Backend Django API**: Running on `http://localhost:8000` (`python manage.py runserver`)
*   **Frontend Web Portal**: Running on `http://localhost:5173` or `http://localhost:3000` (`yarn dev`)

### 1.2 Superuser Bootstrapping
Since the database is unseeded, you must first create a Django Superuser account via the backend terminal to gain initial access to the portal.
1.  Open your terminal in the backend directory (`TimeMap_backend`).
2.  Run: `python manage.py createsuperuser`
3.  Provide the credentials manually:
    *   **Username / Identifier**: `admin`
    *   **Email**: `admin@timemap.edu`
    *   **Password**: `AdminPassword123!` (or your preferred secure password)
4.  You will use this Superuser account to bypass standard scope constraints and bootstrap the entire university hierarchy.

---

## 2. Bootstrapping Phase: Creating the Organizational Structure

Before regular users can operate the system, the superuser must build the basic hierarchy. Follow these exact steps.

### Step 2.1: Login as Superuser
*   **Page**: `/auth/login`
*   **Action**: Enter the Superuser credentials created above. Click **Sign In**.
*   **Expected**: Redirected to `/dashboard`.

### Step 2.2: Create the School (University Level)
*   **Page**: Navigate to `/hierarchy` via the SideNav.
*   **Action**: 
    1. Click the **Schools** tab.
    2. Click the **Create School** button to open the `CreateSchoolModal.tsx`.
    3. Input Name (e.g., "Nasarawa State University").
    4. Click **Submit**.
*   **Expected**: A new School record appears in the table. Note the ID or name for the next step.

### Step 2.3: Create a Faculty
*   **Page**: `/hierarchy`
*   **Action**:
    1. Switch to the **Faculties** tab.
    2. Click **Create Faculty** to open the `CreateFacultyModal.tsx`.
    3. Select the previously created School from the dropdown.
    4. Input Name (e.g., "Faculty of Natural and Applied Sciences").
    5. Click **Submit**.
*   **Expected**: A new Faculty record appears.

### Step 2.4: Create a Department
*   **Page**: `/hierarchy`
*   **Action**:
    1. Switch to the **Departments** tab.
    2. Click **Create Department** to open the `CreateDepartmentModal.tsx`.
    3. Select the newly created Faculty from the dropdown.
    4. Input Name (e.g., "Department of Computer Science").
    5. Click **Submit**.
*   **Expected**: A new Department record appears. The hierarchical tree is now seeded.

### Step 2.5: Create Venues
*   **Page**: Navigate to `/venues` via the SideNav.
*   **Action**:
    1. Click **Create Venue** to open the `CreateVenueModal.tsx`.
    2. Input Name (e.g., "LT1"), Capacity (e.g., 200).
    3. Set "Owning Level" to `Department` and select your created Department.
    4. Click **Submit**.
*   **Expected**: The venue is listed in the `VenuesView.tsx` data table.

### Step 2.6: Create Courses
*   **Page**: Navigate to `/courses` via the SideNav.
*   **Action**:
    1. Click **Create Course** to open the `CreateCourseModal.tsx`.
    2. Input Code (e.g., "CSC 101"), Title (e.g., "Intro to Computing"), Credit Load (e.g., 3).
    3. Select the created Department.
    4. Click **Submit**.
*   **Expected**: The course appears in the `CoursesView.tsx` table.

### Step 2.7: Create Scoped Admin Users
*   **Page**: Navigate to `/users` via the SideNav.
*   **Action**:
    1. Click **Create User** to open `CreateUserModal.tsx`.
    2. Select Role = `Admin Officer`, Level = `Department`.
    3. Select your created Department.
    4. Input Identifier (e.g., `NSUK/ADM/DEP/001`) and Name.
    5. Click **Submit**.
*   **Expected**: User is created with default password `12345678`.

**Bootstrapping Complete.** You can now log out of the Superuser account and log in as the newly created Department Admin to test the rest of the application scoped to that department.

---

## 3. Detailed Module Testing

### Module 1: Authentication & Forced Password Reset
*   **Page**: `/auth/login`
*   **Components**: `LoginForm.tsx`, `ResetPasswordModal.tsx`
*   **Non-Interactive Features**: Logo, Welcome Text, Footer links.
*   **Interactive Features**: Identifier field, Password field, Show/Hide password toggle, Sign In button.

**Test Procedure:**
1.  Navigate to `/auth/login`.
2.  Input an invalid ID and Password. Click Sign In.
    *   *Expected Data/Result*: Error toast displays "Invalid credentials". Network returns `401 Unauthorized`.
3.  Input the newly created Admin user (`NSUK/ADM/DEP/001`) and default password (`12345678`).
4.  Click Sign In.
    *   *Expected Data/Result*: Because it's the first login, the `ResetPasswordModal.tsx` should automatically intercept the flow.
5.  In the Reset Password Modal, input a new secure password and confirm it. Click Submit.
    *   *Expected Data/Result*: Password is updated, session tokens are stored, and user is redirected to `/dashboard`.

**Possible Flags/Edge Cases**:
*   *Flag*: Bypassing Reset. If you manually change the URL to `/dashboard` before resetting the password, the system MUST kick you back to the login/reset state (`403 Forbidden` from API).

---

### Module 2: Dashboard Analytics
*   **Page**: `/dashboard`
*   **Components**: `DashboardView.tsx`, `StatCard.tsx`, Recharts Components.
*   **Non-Interactive Features**: Summary Cards (Total Venues, Active Entries, Pending Discrepancies, Unreported Flags). Analytics Charts (Hold Rate, Utilization).
*   **Interactive Features**: Top-right Refresh button.

**Test Procedure:**
1.  Observe the Stat Cards.
    *   *Expected Data*: Because the database is mostly empty, "Active Timetable Entries" should be `0`, but "Total Venues" should be `1` (from bootstrapping).
2.  Click the top-right **Refresh** button.
    *   *Expected Data*: A spinning loader appears briefly on the button while API calls re-fetch data. No errors in the console.

---

### Module 3: Navigation & Profile Controls
*   **Page**: Global Shell layout.
*   **Components**: `SideNav.tsx`, `Topbar.tsx`, `NotificationsDropdown.tsx`, `ProfileDropdown.tsx`.

**Test Procedure:**
1.  **SideNav**: Click the collapse toggle button at the top of the SideNav.
    *   *Expected*: The sidebar shrinks to an icon-only view. Hovering over icons shows tooltips. Click again to expand.
2.  **User Profile Card**: Look at the bottom of the SideNav.
    *   *Expected Data*: It should display the logged-in admin's actual Name, Email, and a logout button.
3.  **Topbar Profile Dropdown**: Click the avatar in the top right.
    *   *Expected*: A dropdown opens displaying the role (e.g., "Department Admin") and links to Settings and Logout.
4.  **Notifications**: Click the Bell icon in the Topbar.
    *   *Expected*: A dropdown (`NotificationsDropdown.tsx`) opens. It should display "No new notifications" if empty.

---

### Module 4: Timetable & Session Schedules
*   **Page**: `/schedules`
*   **Components**: `SchedulesView.tsx`, `CreateTimetableEntryModal.tsx`, `ConflictResolutionModal.tsx`, Data Tables.

**Test Procedure:**
1.  Navigate to `/schedules`. Verify the tables are initially empty.
2.  Click **Create Booking**. The `CreateTimetableEntryModal` opens.
3.  Select the Course and Venue created during bootstrapping. Set a Start Time (e.g., 09:00 AM) and End Time (11:00 AM) for today. Click Submit.
    *   *Expected Result*: A success toast appears. The booking appears in the "Timetable Entries" table. Network returns `201 Created` (PROCEED).
4.  **Triggering a Conflict**: Click **Create Booking** again. Use the *exact same* Venue, Start Time, and End Time. Click Submit.
    *   *Expected Result*: The backend conflict engine detects a clash and returns `400 Bad Request` (HARD_REJECT). The UI must automatically open the `ConflictResolutionModal.tsx`, displaying the details of the clashing session to the user.

**Possible Flags/Edge Cases**:
*   *Flag*: Missing options. If the Venues or Courses dropdown in the modal is empty, ensure the backend endpoints are returning data scoped correctly to the user's department.

---

### Module 5: Discrepancy Requests
*   **Page**: `/requests`
*   **Components**: `RequestsView.tsx`, `DiscrepancyDetailSlideOver.tsx`, `SubmitDiscrepancyModal.tsx`.

**Test Procedure:**
1.  Navigate to `/requests`.
2.  Click **Submit Request** to open the `SubmitDiscrepancyModal.tsx`.
3.  Fill out a request (e.g., Request Type: "Venue Change", Reason: "AC broken"). Click Submit.
    *   *Expected*: The request appears in the table with a "Pending" badge.
4.  Click on the row in the table.
    *   *Expected*: The `DiscrepancyDetailSlideOver.tsx` slides in from the right edge of the screen, showing full details, timestamps, and action buttons (Approve/Reject) if the user has permission.

---

### Module 6: System Audit Trail Logs
*   **Page**: `/audit-logs`
*   **Components**: `AuditLogsView.tsx`, `AuditSnapshotDiffModal.tsx`.

**Test Procedure:**
1.  Navigate to `/audit-logs`. Since you've created venues, courses, and schedules, there should be several rows here tracking those `CREATE` actions.
2.  Find an action in the table and click the **View Diff** button.
    *   *Expected*: The `AuditSnapshotDiffModal.tsx` opens. It displays a JSON tree viewer or side-by-side comparison of the `before_snapshot` (which may be null for creations) and `after_snapshot`.

---

### Module 7: Settings & Integrations
*   **Page**: `/settings`
*   **Components**: `SettingsView.tsx`.
*   **Non-Interactive Features**: Displays the logged-in user's Profile Info (Name, Identifier, Email, Scope Level) and an "Administrative Privileges Breakdown" card explaining what they can do.
*   **Interactive Features**: Web Push Notifications Toggle, Logout Button.

**Test Procedure:**
1.  Navigate to `/settings`.
2.  Toggle the **Web Push Notifications** switch.
    *   *Expected*: Depending on browser support, it may ask for notification permissions. If granted, it sends the FCM token to the backend (`POST /api/notifications/devices/`).
3.  Click the **Logout** button.
    *   *Expected*: Session is cleared from local storage/cookies, and the user is redirected to `/auth/login`.

---

## 4. Standardized Bug Documentation Format

If you encounter an issue, API mismatch, or UI bug during manual testing, document it exactly using this format. Do not use abstract descriptions.

```markdown
### Bug Report #[Number]: [Exact specific issue]
* **Module / Page**: e.g., `/venues` (`CreateVenueModal.tsx`)
* **User Scope Tested**: e.g., Department Admin (`NSUK/ADM/DEP/001`)
* **Steps to Reproduce**:
  1. Click Create Venue.
  2. Input Name: "Lab 1", Capacity: 50.
  3. Leave "Facilities" blank.
  4. Click Submit.
* **Expected Result**: Backend returns 201 Created, UI shows success toast and closes modal.
* **Actual Result**: Backend returns 500 Internal Server Error, modal stays open with no error message shown to user.
* **Console Logs / Error Stack**: `AxiosError: Request failed with status code 500. Message: column "facilities" cannot be null`
* **Severity**: [Critical (Blocks core feature) / High / Medium / Low (UI cosmetic)]
```
