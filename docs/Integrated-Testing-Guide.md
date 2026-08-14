# TimeMapper Web Portal Integrated Testing Guide

## Purpose
This guide is for junior developers and manual testers who are not deeply familiar with TimeMapper yet. It explains what each portal page is for, what data should load, what each important interactive control should do, which routes should be reachable, and how to report issues clearly.

Focus on integrated behavior: UI state, API calls, authentication, authorization redirects, list refreshes, modal behavior, and visible outcomes after create/update/approval actions.

## Test Environment
- Backend API should be running at `http://localhost:8000/api`, unless `VITE_API_BASE_URL` points somewhere else.
- Frontend should be running with `yarn dev`, usually at `http://localhost:5173`.
- Use the browser Network tab and Console tab while testing.
- Test with a fresh database first, then repeat important flows with seeded or real-like data.

## Starter Data Checklist
Many pages depend on hierarchy, venue, course, and user records. If the database is empty, create this order of data before deeper testing:

1. Create or obtain an admin/superuser account from the backend.
2. Log in to the web portal at `/login`.
3. Create a school from `/hierarchy`.
4. Create a faculty under that school.
5. Create a department under that faculty.
6. Create at least one venue from `/venues`.
7. Create at least one lecturer, student, and admin from `/users`.
8. Create at least one course from `/courses`.
9. Create at least one timetable entry from `/schedules`.
10. Materialize at least one dated lecture session from `/schedules`.

Use simple names that are easy to search later, for example:
- School: `Test School`
- Faculty: `Test Faculty`
- Department: `Computer Science Test`
- Venue: `Test Hall 1`
- Course: `CSC 101 - Intro to Computing`
- Admin staff ID: `TEST/ADMIN/001`
- Lecturer staff ID: `TEST/LEC/001`
- Student matric number: `TEST/STU/001`

## Global Route And Access Rules

### Public routes
- `/` should redirect to `/login`.
- `/login` should show the admin login form.
- `/forgot-password` should show the forgot password form.
- `/reset-password` should only be useful after an authenticated user is required to reset their password. If the user is not authenticated, it should redirect to `/login`.

### Protected admin routes
These routes should only be accessible by authenticated users whose role is `admin`:
- `/dashboard`
- `/hierarchy`
- `/venues`
- `/courses`
- `/users`
- `/schedules`
- `/requests`
- `/reports`
- `/notifications`
- `/audit-logs`
- `/settings`

Expected access behavior:
- If no token is present, opening any protected route should redirect to `/login`.
- If the logged-in account is not an admin, login should fail for portal purposes with an `Invalid admin credentials` toast and local storage should be cleared.
- If the logged-in admin requires a password reset, protected routes should redirect to `/reset-password`.
- Unknown routes should show the `LostPage`/not found page.
- When an access token expires, the API client should try `/auth/token/refresh/`. If refresh fails, tokens should be cleared and the user should be logged out.

## Global UI Behavior To Check Everywhere
- Loading states: skeletons, spinners, or disabled buttons should appear while data is fetching or a mutation is running.
- Toasts: successful create/update/delete/approval actions should show success/info toasts; failed calls should show error toasts.
- Tables: search, filters, tabs, and pagination are mostly frontend state. They should update visible rows without a full page reload.
- Modal behavior: submit success should close the modal where the container code closes it; failed submit should keep the user on the modal/page and show an error.
- Refresh buttons: should refetch the relevant React Query data and show a spinner while refetching.
- Scope: data returned by APIs should match the current admin's permitted scope. If a department admin sees unrelated school-wide records, report it.

## Authentication Pages

### `/login` - Admin sign in
Purpose: authenticate admin users and route them into the protected dashboard.

Data/API involved:
- `POST /auth/login/`
- `GET /auth/profile/` during auth state restoration

Test interactions:
- Submit empty form.
  - Expected: identifier and password validation messages are shown. No login request should be sent.
- Toggle password visibility.
  - Expected: password field switches between hidden and visible text without changing the value.
- Submit invalid credentials.
  - Expected: error toast from API detail or generic invalid credentials message. User stays on `/login`.
- Submit valid non-admin credentials.
  - Expected: `Invalid admin credentials` toast, local storage cleared, user remains outside the portal.
- Submit valid admin credentials.
  - Expected: access and refresh tokens are saved in local storage. If password reset is not required, user navigates to `/dashboard`. If reset is required, user navigates to `/reset-password`.
- Click `Forgot password?`.
  - Expected: navigates to `/forgot-password`.

### `/reset-password` - Forced password reset
Purpose: let authenticated users with `requires_password_reset` choose a new password before using the portal.

Data/API involved:
- `POST /auth/password-reset/`
- `GET /auth/profile/` after reset

Test interactions:
- Open `/reset-password` without being logged in.
  - Expected: redirect to `/login`.
- Submit password shorter than 6 characters.
  - Expected: frontend validation error.
- Submit mismatched password confirmation.
  - Expected: frontend validation error on confirm field.
- Submit matching valid passwords.
  - Expected: success toast, profile refetch, `requiresPasswordReset` becomes false, user navigates to `/dashboard`.
- Click `Back to login`.
  - Expected: navigates to `/login`.

### `/forgot-password` - Reset request placeholder
Purpose: collect email or staff ID for a future password reset flow.

Current expected behavior:
- The form validates that `Email or Staff ID` is present.
- Submit currently logs payload in the console and does not call a backend reset API yet.
- Report this only if product expectation says forgot password must already be functional.

## Main Layout And Navigation

Purpose: provide the protected shell around all admin pages.

Components to test:
- Sidebar navigation
- Sidebar collapse/expand
- Topbar
- Profile dropdown
- Notifications entry point
- Logout controls

Expected behavior:
- Sidebar links should navigate to the matching protected routes.
- Sidebar collapse should switch to compact icon view and expand again when toggled.
- Active page should be visually clear.
- Topbar/profile information should reflect the logged-in admin.
- Logout should clear auth state and return the user to `/login`.
- Refreshing the browser on a protected route with valid tokens should keep the user authenticated.

## `/dashboard` - Analytics Overview

Purpose: show scoped operational metrics for venues, courses, pending discrepancies, unreported flags, lecture hold rate, venue utilization, and discrepancy status.

Data/API involved:
- `GET /reporting/analytics/lecture-hold-rate/`
- `GET /reporting/analytics/venue-utilization/`
- `GET /reporting/analytics/discrepancy-frequency/`
- Summary count calls to venues, courses, pending discrepancies, and unreported flags
- `GET /hierarchy/departments/` for filter options

Test interactions:
- Initial load.
  - Expected: four summary cards load, charts either render data or show empty-state text. Loading indicator appears while analytics are fetching.
- Change start date, end date, department, or group-by.
  - Expected: analytics queries refetch with the selected parameters. Charts and summary chart text update to match returned data.
- Reset filters.
  - Expected: date fields clear, department clears, group-by returns to `week`, analytics refetch for the default view.
- Empty database.
  - Expected: counts show `0` where appropriate and charts show empty-state messages instead of crashing.

## `/hierarchy` - School, Faculty, Department Management

Purpose: build and manage the institutional structure that scopes users, courses, venues, and schedules.

Data/API involved:
- `GET/POST/PATCH/DELETE /hierarchy/schools/`
- `GET/POST/PATCH/DELETE /hierarchy/faculties/`
- `GET/POST/PATCH/DELETE /hierarchy/departments/`

Tabs:
- `Departments`
- `Faculties`
- `Schools`
- `Organizational Tree View`

Test interactions:
- Switch tabs.
  - Expected: table changes to the selected data type and page resets to page 1.
- Search table.
  - Expected: filters visible rows by name, code, or parent name. No API call is required for search.
- Click `Refresh`.
  - Expected: schools, faculties, and departments refetch; success toast says hierarchy data refreshed.
- Add School.
  - Expected: modal opens; submit valid name/code; `POST /hierarchy/schools/`; modal closes; success toast; school appears in Schools tab and tree view.
- Edit School.
  - Expected: edit modal pre-fills existing data; submit calls `PATCH /hierarchy/schools/{id}/`; modal closes; row updates.
- Delete School.
  - Expected: confirmation modal opens; confirm calls `DELETE /hierarchy/schools/{id}/`; row disappears if backend allows deletion. If dependencies block deletion, error toast should appear.
- Add/Edit/Delete Faculty.
  - Expected: same pattern as school, but faculty requires a parent school and uses `/hierarchy/faculties/`.
- Add/Edit/Delete Department.
  - Expected: same pattern as school, but department requires a parent faculty and uses `/hierarchy/departments/`.
- Tree view on desktop.
  - Expected: visual hierarchy shows schools, faculties, and departments in parent-child structure.
- Tree view on mobile.
  - Expected: mobile fallback message asks user to use a PC.

Important failure cases:
- Creating a faculty when there is no school should not silently create invalid data.
- Creating a department when there is no faculty should not silently create invalid data.
- Deleting a parent record with child records should either be blocked with a clear backend/UI error or intentionally cascade according to backend rules.

## `/venues` - Venue Registry And Facility Tags

Purpose: manage physical venues, capacity, availability, scope ownership, and reusable facility tags.

Data/API involved:
- `GET/POST/PATCH/DELETE /venues/venues/`
- `POST /venues/venues/{id}/activate/`
- `POST /venues/venues/{id}/deactivate/`
- `GET/POST/DELETE /venues/facilities/`
- hierarchy option calls for school/faculty/department ownership

Tabs:
- `Venues Registry`
- `Facility Tags`

Test interactions:
- Initial load.
  - Expected: venue and facility lists load. Empty lists should show empty state or first-create prompt.
- Search/filter venues.
  - Expected: visible venue rows filter by search text, venue type, owning level, and facility. This is local UI filtering.
- Click `Refresh`.
  - Expected: venues and facilities refetch; refresh icon spins while loading.
- Create Facility.
  - Expected: modal opens; submit name; `POST /venues/facilities/`; modal closes; facility tag appears in Facility Tags tab and in venue facility options.
- Create Venue.
  - Expected: modal opens; choose type/capacity/owning level/scope/facilities; submit calls `POST /venues/venues/`; success toast includes venue name; modal closes; venue appears in registry.
- Edit Venue.
  - Expected: edit modal opens with current values; submit calls `PATCH /venues/venues/{id}/`; success toast; row updates.
- Activate/Deactivate Venue.
  - Expected: confirmation modal opens; confirm calls activate or deactivate endpoint based on current `isAvailable`; success toast; availability badge/action changes.

Important failure cases:
- Capacity should not accept invalid values such as empty, negative, or non-number values if backend rejects them.
- Scope selector should map correctly: school-owned venue sends school scope, faculty-owned sends faculty scope, department-owned sends department scope.
- Facility tags should not duplicate unexpectedly unless backend intentionally allows duplicate names.

## `/courses` - Courses, Access Grants, And Registrations

Purpose: manage course catalog records, lecturer assignments, cross-scope access grants, and student course registrations.

Data/API involved:
- `GET/POST/PATCH/DELETE /courses/courses/`
- `GET/POST /courses/grants/`
- `POST /courses/grants/{id}/approve/`
- `POST /courses/grants/{id}/reject/`
- `GET/POST /courses/registrations/`
- users/hierarchy option calls for lecturers, students, departments, faculties, and schools

Tabs:
- `Course Catalog`
- `Access Grants Queue`
- `Student Registrations`

Test interactions:
- Initial load.
  - Expected: courses, grants, lecturers, students, and hierarchy options load. Empty states should be understandable.
- Search/filter catalog.
  - Expected: local filtering by course code, title, department, and level.
- Create Course.
  - Expected: modal opens; fill course code/title/level/credit units/owning scope/lecturers; submit calls `POST /courses/courses/`; modal closes; success toast; new course appears.
- Edit Course.
  - Expected: modal pre-fills course; submit calls `PATCH /courses/courses/{id}/`; row updates after cache invalidation.
- Delete Course.
  - Expected: browser confirmation appears; confirm calls `DELETE /courses/courses/{id}/`; success toast; course disappears. Cancel should make no API call.
- Offer Grant.
  - Expected: modal opens; choose course and target scope; submit calls `POST /courses/grants/` with direction `offered`; grant appears in queue.
- Request Access.
  - Expected: modal opens; choose course; submit calls `POST /courses/grants/` with direction `requested`; request appears in queue.
- Approve Grant.
  - Expected: calls `POST /courses/grants/{id}/approve/`; grant status becomes approved; course list may refresh if access changes available courses.
- Reject Grant.
  - Expected: calls `POST /courses/grants/{id}/reject/`; grant status becomes rejected.
- Register Student.
  - Expected: registration modal opens from the registrations workflow; submit calls `POST /courses/registrations/`; success toast; course registration count may update.

Important failure cases:
- Creating duplicate course codes should return a clear backend validation error.
- If lecturer or student dropdowns are empty after users were created, report option-fetching or mapping issue.
- Access grant approval should not approve an already rejected grant unless backend intentionally permits it.

## `/users` - Admins, Lecturers, Students, And Class Reps

Purpose: manage accounts that interact with schedules, reporting, and admin workflows.

Data/API involved:
- `GET/POST/PATCH /auth/admins/`
- `GET/POST/PATCH /auth/lecturers/`
- `GET/POST/PATCH /auth/students/`
- `POST /auth/{role}/{id}/toggle-active/`
- `POST /auth/{role}/{id}/reset-password/`
- hierarchy option calls for scope and department assignment

Tabs:
- `Admin Officers`
- `Lecturers`
- `Students & Reps`

Test interactions:
- Switch tabs.
  - Expected: table changes to the selected role and page resets.
- Search/filter users.
  - Expected: local filtering by name, email, identifier, account status, and admin scope level where relevant.
- Current logged-in user visibility.
  - Expected: current user is hidden from the table to reduce accidental self-edit/deactivate actions.
- Create User Account.
  - Expected: modal opens; role-specific fields appear; submit creates admin, lecturer, or student using the correct endpoint; modal closes; success toast mentions default password `12345678`.
- Edit User.
  - Expected: role-specific edit modal opens; submit calls the correct role endpoint; row updates.
- Reset Password.
  - Expected: confirmation modal opens; confirm calls role-specific reset endpoint; success toast says password reset to `12345678`; user may show reset-required badge after refetch.
- Activate/Deactivate.
  - Expected: confirmation modal opens; confirm calls role-specific toggle endpoint; status badge changes between Active and Inactive.
- Refresh.
  - Expected: admins, lecturers, and students refetch; success toast says user directory refreshed.

Important failure cases:
- Creating an admin without a valid scope should fail clearly.
- Creating a student or lecturer without department should fail clearly.
- Reset button should be disabled if the user already requires password reset.

## `/schedules` - Timetables, Sessions, And Exams

Purpose: create recurring timetable entries, materialize dated lecture sessions, shift individual sessions, and create exam sittings.

Data/API involved:
- `GET/POST /scheduling/entries/`
- `POST /scheduling/entries/{id}/materialize/`
- `GET/PATCH /scheduling/sessions/`
- `GET/POST /scheduling/exam-sittings/`
- course, venue, and lecturer option calls

Tabs:
- `All Schedule Patterns`
- `Dated Sessions`
- `Exam Sittings`

Test interactions:
- Switch between list/grid view.
  - Expected: only the visual presentation changes for schedule entries. Data should remain the same.
- Search/filter entries.
  - Expected: local filtering by course, title, venue, lecturer, and entry type.
- Create Schedule Entry.
  - Expected for normal valid entry: `POST /scheduling/entries/`; outcome `PROCEED`; success toast; modal closes; entries and sessions invalidate/refetch.
  - Expected for cross-scope entry: outcome `ROUTE_APPROVAL`; schedule modal closes; conflict feedback modal opens explaining approval routing.
  - Expected for hard conflict: outcome `HARD_REJECT`; conflict feedback modal opens with conflict details; schedule modal stays available or can be retried; conflicting booking should not be created.
- Materialize.
  - Expected: clicking Materialize on an entry calls materialize endpoint; success toast shows the created dated session date; Dated Sessions tab updates after refetch.
- Shift Instance.
  - Expected: from Dated Sessions tab, click Shift Instance; modal opens; choose new venue/time; submit calls `PATCH /scheduling/sessions/{id}/` with status `shifted`; modal closes; session row updates.
- Create Exam Sitting.
  - Expected: modal opens; choose timetable entry and invigilators; submit calls `POST /scheduling/exam-sittings/`; modal closes; exam appears in Exam Sittings tab.
- Refresh.
  - Expected: entries, sessions, and exams refetch; success toast appears.

Important failure cases:
- Course and venue dropdowns should contain records created within the admin's scope.
- Creating a duplicate venue/time booking should not silently create conflicting entries.
- Materializing the same entry multiple times should follow backend rules. If duplicates are created unexpectedly, report it.
- Exam sitting should not be created without a valid timetable entry.

## `/requests` - Discrepancy Requests Queue

Purpose: submit and resolve schedule change requests such as venue shifts, time shifts, postponements, cancellations, and routed approvals.

Data/API involved:
- `GET/POST /discrepancies/requests/`
- `POST /discrepancies/requests/{id}/approve/`
- `POST /discrepancies/requests/{id}/reject/`
- `POST /discrepancies/requests/{id}/withdraw/`
- venue, timetable entry, and lecture session option calls

Tabs:
- `Pending Approvals (Routed to Me)`
- `All Scope Requests`
- `Historical Log`

Test interactions:
- Submit Discrepancy Request.
  - Expected: modal opens; choose request type and related entry/session/venue/time as needed; submit calls `POST /discrepancies/requests/`; modal closes; success toast includes request ID; request appears with pending status.
- Inspect.
  - Expected: slide-over opens with full request details, timestamps, status, reason, and action buttons relevant to the request status.
- Approve from detail slide-over.
  - Expected: calls approve endpoint; success toast; slide-over closes; request status changes to approved or applied depending on backend response.
- Reject from detail slide-over.
  - Expected: rejection modal opens; reason is required; submit calls reject endpoint with reason; toast appears; slide-over and reject modal close; request moves to history.
- Withdraw.
  - Expected: confirmation modal opens; confirm calls withdraw endpoint; info toast; request status changes to withdrawn and no longer appears in pending.
- Search/filter.
  - Expected: local filtering by request ID, course, requester, request type, and history status where shown.
- Refresh.
  - Expected: requests refetch.

Important failure cases:
- Pending tab should only show pending requests.
- History tab should exclude pending requests.
- Users should not be able to approve/reject/withdraw requests outside their permitted scope.

## `/reports` - Class Rep Reports And Session Flags

Purpose: review submitted class representative lecture reports, respond to disputes, detect expired unreported sessions, and acknowledge flags.

Data/API involved:
- `GET /reporting/reports/`
- `POST /reporting/reports/{id}/respond/`
- `GET /reporting/flags/`
- `POST /reporting/flags/{id}/acknowledge/`
- `POST /reporting/flags/trigger_sweep/`

Tabs:
- `Submitted Reports`
- `Unreported Flags Queue`

Test interactions:
- View Thread.
  - Expected: report detail modal opens with report context and any lecturer response.
- Respond.
  - Expected: dispute response modal opens; submit text; calls report respond endpoint; modal closes; success toast; report row shows lecturer response after refetch.
- Trigger Flag Sweep.
  - Expected: calls sweep endpoint; success toast shows backend message; reports and flags refetch.
- Acknowledge Flag.
  - Expected: confirmation modal opens; confirm calls acknowledge endpoint; success toast; flag changes to acknowledged and action area shows acknowledgement info.
- Search/filter reports.
  - Expected: local filtering by course, reporter, reason, and held/not-held state.
- Search/filter flags.
  - Expected: local filtering by course, timetable entry title, and acknowledged/unresolved state.
- Refresh.
  - Expected: reports and flags refetch.

Important failure cases:
- Acknowledged flags should not still show the active Acknowledge button.
- Responding with empty text should be blocked by the modal or rejected clearly by backend.
- Sweep should not duplicate existing flags if run repeatedly.

## `/notifications` - Notifications Inbox

Purpose: show administrative notifications and let users mark them read.

Data/API involved:
- `GET /notifications/inbox/`
- `POST /notifications/inbox/{id}/read/`
- `POST /notifications/inbox/mark-all-read/`
- Polling refetch every 10 seconds

Tabs:
- `All Notifications`
- `Unread Only`

Test interactions:
- Initial load.
  - Expected: notifications load or empty state appears. Unread count badge appears only when unread notifications exist.
- Switch tabs.
  - Expected: unread tab only shows unread items.
- Mark Read.
  - Expected: calls read endpoint for that notification; item loses unread styling or disappears from Unread tab after refetch.
- Mark All Read.
  - Expected: button appears only when unread count is greater than zero; call marks all read; success toast; unread badge disappears.
- Refresh.
  - Expected: inbox refetches.
- Wait 10 seconds.
  - Expected: background polling should refetch without manual action.

## `/audit-logs` - System Audit Trail

Purpose: review backend mutation logs and inspect before/after snapshots for sensitive actions.

Data/API involved:
- `GET /discrepancies/audit-logs/`

Test interactions:
- Initial load.
  - Expected: logs load after creating, updating, approving, rejecting, or deleting records. Empty state appears if no logs exist.
- Search/filter.
  - Expected: local filtering by actor identifier, target model, target ID, action type, and model type.
- Date inputs.
  - Current behavior to verify: start and end date fields update UI state, but the current view code does not apply them to `filteredLogs`. If dates do not filter results, report as a functional bug or incomplete feature.
- View Diff.
  - Expected: snapshot diff modal opens. Create actions may have empty/null before snapshot and populated after snapshot. Update actions should show before and after. Delete actions should show according to backend audit design.
- Refresh.
  - Expected: audit logs refetch.

Important failure cases:
- Actions performed on other pages should produce audit logs if backend audit is enabled for that model.
- Snapshot modal should not crash when before or after snapshot is null.

## `/settings` - Admin Profile And System Settings

Purpose: show the current admin profile, scope privileges, web push state, and logout control.

Data/API involved:
- Uses current auth context user.
- `POST /notifications/devices/` when enabling push.
- `POST /notifications/devices/deactivate/` when disabling push.

Test interactions:
- Profile display.
  - Expected: name, email, role, staff identifier, and scope display correctly for current admin.
- Toggle Web Push.
  - Expected when enabled: clicking disable calls deactivate endpoint with active token; button shows loading; success toast; badge changes to Push Disabled.
  - Expected when disabled: clicking enable creates a web token, calls register endpoint; success toast; badge changes to Push Registered & Active.
- Logout Session.
  - Expected: info toast; tokens removed; user redirected out of protected pages to `/login`.

Important notes:
- Current web push token is demo-like state in the frontend (`web_fcm_token_demo_123` or generated `web_token_{timestamp}`), not a real browser FCM permission flow. Report this only if production push registration is expected now.

## Cross-Page Integrated Scenarios

### Scenario 1: Bootstrap and verify dashboard
1. Create school, faculty, department.
2. Create venue.
3. Create lecturer, student, and admin.
4. Create course.
5. Visit `/dashboard`.
Expected: venue and course counts increase. Charts may still be empty until reports/sessions exist.

### Scenario 2: Schedule conflict detection
1. Create a valid schedule entry for a course, venue, day, and time.
2. Create another schedule entry with the same venue/day/time.
Expected: first entry should proceed; second should produce `HARD_REJECT` feedback and show conflict details.

### Scenario 3: Dated session workflow
1. Create a schedule entry.
2. Click Materialize.
3. Open Dated Sessions tab.
4. Shift the materialized session.
Expected: session appears after materialization and changes to shifted after editing.

### Scenario 4: Discrepancy lifecycle
1. Submit a discrepancy request.
2. Inspect the request.
3. Approve it, reject it with reason, or withdraw it depending on test case.
Expected: status changes, queue membership changes, and audit log should record the action if backend supports it.

### Scenario 5: Reporting lifecycle
1. Ensure a class rep report or unreported flag exists from backend/test data.
2. Open `/reports`.
3. Respond to a report or acknowledge a flag.
Expected: report/flag row updates and dashboard counts may change after refresh.

### Scenario 6: Account lifecycle
1. Create a new admin/lecturer/student.
2. Edit the account.
3. Reset password.
4. Deactivate and reactivate the account.
Expected: each action updates the correct role table and never affects the current logged-in user unexpectedly.

## Expected Status Codes
Use these as general expectations. Backend may return slightly different success codes, but behavior should still be clear.

- Login success: `200`
- Create success: usually `201`
- Update success: usually `200`
- Delete success: usually `204`
- Unauthorized/no token: `401`
- Authenticated but blocked by rule/scope/password reset: `403`
- Validation failure/conflict/hard reject: usually `400`
- Server error: `500`, should always be reported

## What To Capture For Every Bug
Keep reports short and specific. Include enough data for another developer to reproduce it.

```markdown
### Bug: [Short title]

Page/Route:
Example: `/venues`

Account Used:
Example: `TEST/ADMIN/001`, Department Admin, Computer Science Test scope

Environment:
Example: local frontend `http://localhost:5173`, backend `http://localhost:8000/api`

Steps:
1. Go to `/venues`.
2. Click Create Venue.
3. Enter name `Test Hall 1`, capacity `100`, owning level `department`.
4. Click Submit.

Expected:
Venue is created, modal closes, success toast appears, row is visible in table.

Actual:
API returns `500`; modal stays open; no useful error appears.

Evidence:
- Network request: `POST /venues/venues/`
- Status: `500`
- Console error: paste the important line only
- Screenshot/video: attach if useful

Severity:
Critical / High / Medium / Low
```

Severity guide:
- Critical: blocks login, protected route access, or core create/update flows.
- High: corrupts data, allows wrong-scope access, breaks approval/conflict workflows.
- Medium: important feature works incorrectly but has a workaround.
- Low: visual issue, wording issue, or minor empty/loading state problem.

## Final Tester Notes
- Always test with at least one fresh admin and one scoped department admin.
- After any create/update/delete action, verify both the toast and the table/list state.
- After any permission-sensitive action, verify the same route/action with a lower-scope admin if possible.
- If the UI says success but the table does not update, check whether the API actually changed data or whether React Query invalidation/refetch failed.
- If the API succeeds but the UI shows stale values after refresh, report it as a mapping or cache issue.
