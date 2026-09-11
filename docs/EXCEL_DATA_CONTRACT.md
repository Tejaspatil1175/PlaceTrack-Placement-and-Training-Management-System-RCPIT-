# PlaceTrack Excel Data Contract Specification

This document defines the frozen Excel data ingestion contract for PlaceTrack (Placement and Training Management System, RCPIT).
All bulk data uploads adhere strictly to these column header definitions.

---

## 1. Basic Information Columns (Per Student Row)

Each row in the Excel template begins with 12 basic student information fields:

| Header Name | Data Type | Required | Description / Format / Allowed Values | Example |
| :--- | :--- | :--- | :--- | :--- |
| `PRN` | String | Yes (Unique) | Permanent Registration Number (alphanumeric, e.g. 10-12 chars) | `2021012345` |
| `Name` | String | Yes | Full name of the student (First Middle Last) | `Rahul Ramesh Sharma` |
| `Email` | String | Yes (Unique) | Valid institutional or personal email address | `rahul.sharma@rcpit.ac.in` |
| `Phone` | String | Yes | 10-digit primary mobile contact number | `9876543210` |
| `DOB` | Date (YYYY-MM-DD) | Yes | Date of Birth | `2003-05-15` |
| `Gender` | String (Enum) | Yes | Gender (`Male`, `Female`, `Other`) | `Male` |
| `Category` | String | Yes | Admission Category (`OPEN`, `OBC`, `SC`, `ST`, `EWS`, `NT`, etc.) | `OPEN` |
| `Branch` | String (Enum) | Yes | Engineering Department / Discipline (`Computer`, `IT`, `AI&DS`, `ENTC`, `Mechanical`, `Civil`, `Electrical`) | `Computer` |
| `Division` | String | Yes | Class Division (e.g. `A`, `B`, `C`) | `A` |
| `AdmissionYear`| Integer | Yes | Year of enrollment / admission (4 digits) | `2021` |
| `CurrentSemester`| Integer | Yes | Current active semester (1 to 8) | `7` |
| `Address` | String | No | Residential / Permanent postal address | `Shirpur, Dhule, Maharashtra 425405` |

---
