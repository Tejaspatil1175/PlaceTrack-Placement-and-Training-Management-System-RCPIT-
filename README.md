# PlaceTrack

Placement and Training Management System for R.C. Patel Institute of Technology (RCPIT), Shirpur.

PlaceTrack digitizes the end-to-end campus placement workflow across three roles — Main T&P Officer, Department Coordinators, and Students — replacing manual Excel-based eligibility checks, shortlisting, and communication with an automated, auditable system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MySQL |
| ORM | Sequelize |
| Authentication | JWT, bcrypt |
| File Storage | Cloudinary (resumes) |
| Email Service | Nodemailer (Gmail SMTP) |
| Bulk Data Import | ExcelJS / xlsx (multi-field academic sheets) |
| Report Generation | pdf-lib / Puppeteer |
| Hosting | Railway (backend + database) |
| Testing | Jest, Supertest |
| Logging | Winston |
| Security | Helmet, express-rate-limit |

---

## Problem Statement

RCPIT's placement process is currently managed through spreadsheets maintained independently by the Main T&P Officer and department-wise coordinators. When a company visits campus, coordinators manually cross-check CGPA, backlog status, and branch eligibility for every student against the company's criteria. This process is time-consuming, error-prone, and does not scale as student intake and the number of recruiting drives increase each year.

PlaceTrack addresses this by centralizing student academic and placement data, automating eligibility filtering, and standardizing communication for drive announcements, results, and training events.

---

## Roles and Responsibilities

### Main T&P Officer (Super Admin)
- Creates and manages department coordinator accounts
- Bulk uploads and manages student data across all departments
- Creates placement drives with eligibility criteria (CGPA, active backlogs, branch, minimum semester)
- Views college-wide analytics and placement reports
- Sends notifications and event announcements college-wide or targeted

### Department Coordinator
- Manages student data within their own department
- Bulk uploads department-specific student data
- Views auto-shortlisted eligible students for each drive, scoped to their department
- Updates application status for their department's students
- Sends department-specific notifications and event announcements
- Views department-wise analytics

### Student
- Logs in using PRN-based credentials issued by the college
- Views personal academic record, including semester-wise SGPA and backlog history
- Maintains profile: skills, certifications, resume upload
- Views and applies to eligible placement drives
- Tracks application status across drive rounds
- Receives notifications for results, drive updates, and industry/training events

---

## Core Modules

### Authentication and Access Control
Role-based JWT authentication with three access levels. Students and coordinators are provisioned by the tier above them; no public self-registration.

### Student Data Management
Student records include basic information (PRN, name, contact, branch, admission year) and complete academic history across eight semesters (SGPA, credits, new backlogs, cleared backlogs per semester). Academic aggregates (CGPA, active backlog count) are computed from semester records rather than entered manually, ensuring consistency with source data.

### Bulk Excel Import
Student and academic data is imported via a fixed-schema Excel template covering basic information and semester-wise academic fields. The import pipeline validates column headers against the frozen template, validates each row independently, and creates records within a database transaction per student. Partial semester updates (for example, uploading only newly released semester results) are supported without requiring a full re-upload of existing data.

### Eligibility Matching
Placement drives define eligibility criteria (minimum CGPA, maximum active backlogs, allowed branches, minimum semester). The system automatically filters and returns the list of eligible students for a drive, replacing manual spreadsheet cross-referencing.

### Application Tracking
Students apply to eligible drives. Applications move through a defined status pipeline (Applied, Shortlisted, Interview, Selected, Rejected), visible to both the student and the relevant coordinator or T&P Officer.

### Notifications
Automated email notifications are triggered on application status changes (selection, rejection) and on manual announcements (drive updates, industry talks, training sessions), targeted at the entire college, a specific department, or individual students.

### Training and Events
Coordinators and the T&P Officer can schedule and announce industry sessions, workshops, and mock interview programs, visible to students college-wide or by department.

### Analytics and Reporting
Dashboards present placement statistics by branch, package, and academic year for the T&P Officer, and department-scoped statistics for coordinators. Placement summary reports are exportable as PDF.

---

## Data Model Overview

| Entity | Purpose |
|---|---|
| Department | Department master data, linked coordinator |
| User | Authentication record for all roles (PRN, credentials, role, department link) |
| StudentProfile | Student-specific profile data and cached academic aggregates (CGPA, active backlogs) |
| SemesterRecord | One record per student per semester: SGPA, credits, new and cleared backlogs |
| Drive | Company placement drive with eligibility criteria |
| Application | Student-to-drive application with status tracking |
| Notification | Targeted announcements and alerts |
| Event | Training sessions, workshops, industry talks |
| ExcelUploadLog | Audit trail of bulk uploads, including row-level success and error counts |

Academic data is intentionally normalized into a separate `SemesterRecord` table rather than stored as flat per-semester columns on the student record. This accommodates students at different stages of their academic program, avoids sparse/unused columns, and keeps CGPA and backlog status as computed values derived from a single source of truth rather than independently maintained fields.

---

## Project Structure

```
src/
  config/       Environment, database, and third-party service configuration
  models/       Sequelize model definitions
  controllers/  Request handlers
  routes/       API route definitions
  middleware/   Auth, role-based access, validation, error handling
  services/     Business logic (eligibility matching, academic computation, email)
  utils/        Shared helpers (JWT, hashing, response formatting)
  validators/   Request payload validation schemas
server.js       Application entry point
```

---

## Environment Variables

```
PORT=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST=
EMAIL_USER=
EMAIL_APP_PASSWORD=
```

Refer to `.env.example` for the complete list.

---

## Setup Instructions

1. Clone the repository and install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in database, JWT, Cloudinary, and email credentials.
3. Run database migrations:
   ```
   npx sequelize-cli db:migrate
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. The API is available at `http://localhost:<PORT>/api`. Health check: `GET /api/health`.

---

## Deployment

Backend and MySQL database are hosted on Railway. Resume files are stored on Cloudinary. Environment variables are configured directly in the Railway project settings for the deployed environment, separate from local `.env` values.

---

## Author

Tejas — BTech IT, R.C. Patel Institute of Technology (RCPIT), Shirpur.
