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

## 2. Semester-Block Columns (Repeating Pattern x 8 Semesters)

Following the 12 basic columns, there are 32 semester-specific academic columns (4 fields × 8 semesters).
For incomplete semesters (e.g. Sem 6-8 for a 3rd year student), these cells are left empty/blank.

For each semester $n \in \{1, 2, 3, 4, 5, 6, 7, 8\}$:

| Header Name | Data Type | Required | Description / Rules | Range / Format |
| :--- | :--- | :--- | :--- | :--- |
| `SEM{n}_SGPA` | Decimal (2 dec. places) | If sem completed | Semester Grade Point Average | `0.00` to `10.00` |
| `SEM{n}_CREDITS` | Integer / Decimal | If sem completed | Earned or total credits for semester $n$ | `0` to `35` |
| `SEM{n}_NEW_BACKLOGS` | Integer | If sem completed | Number of newly failed subjects in sem $n$ | $\ge 0$ (Default `0`) |
| `SEM{n}_CLEARED_BACKLOGS` | Integer | If sem completed | Number of prior backlogs cleared in sem $n$ | $\ge 0$ (Default `0`) |

### Complete List of 44 Excel Headers (12 Basic + 32 Academic)
```
1.  PRN
2.  Name
3.  Email
4.  Phone
5.  DOB
6.  Gender
7.  Category
8.  Branch
9.  Division
10. AdmissionYear
11. CurrentSemester
12. Address
13. SEM1_SGPA
14. SEM1_CREDITS
15. SEM1_NEW_BACKLOGS
16. SEM1_CLEARED_BACKLOGS
17. SEM2_SGPA
18. SEM2_CREDITS
19. SEM2_NEW_BACKLOGS
20. SEM2_CLEARED_BACKLOGS
21. SEM3_SGPA
22. SEM3_CREDITS
23. SEM3_NEW_BACKLOGS
24. SEM3_CLEARED_BACKLOGS
25. SEM4_SGPA
26. SEM4_CREDITS
27. SEM4_NEW_BACKLOGS
28. SEM4_CLEARED_BACKLOGS
29. SEM5_SGPA
30. SEM5_CREDITS
31. SEM5_NEW_BACKLOGS
32. SEM5_CLEARED_BACKLOGS
33. SEM6_SGPA
34. SEM6_CREDITS
35. SEM6_NEW_BACKLOGS
36. SEM6_CLEARED_BACKLOGS
37. SEM7_SGPA
38. SEM7_CREDITS
39. SEM7_NEW_BACKLOGS
40. SEM7_CLEARED_BACKLOGS
41. SEM8_SGPA
42. SEM8_CREDITS
43. SEM8_NEW_BACKLOGS
44. SEM8_CLEARED_BACKLOGS
```

---

