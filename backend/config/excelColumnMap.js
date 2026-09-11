/**
 * Excel Column to Database Field Mapping Configuration
 * Frozen contract for PlaceTrack Excel bulk ingestion
 */

const BASIC_COLUMN_MAP = {
  PRN: { field: 'prn', target: 'user', required: true, type: 'string' },
  Name: { field: 'name', target: 'user', required: true, type: 'string' },
  Email: { field: 'email', target: 'user', required: true, type: 'email' },
  Phone: { field: 'phone', target: 'user', required: true, type: 'string' },
  DOB: { field: 'dob', target: 'user', required: true, type: 'date' },
  Gender: { field: 'gender', target: 'user', required: true, type: 'enum', allowed: ['Male', 'Female', 'Other'] },
  Category: { field: 'category', target: 'user', required: true, type: 'string' },
  Branch: { field: 'branch', target: 'profile', required: true, type: 'string' },
  Division: { field: 'division', target: 'profile', required: true, type: 'string' },
  AdmissionYear: { field: 'admissionYear', target: 'profile', required: true, type: 'number' },
  CurrentSemester: { field: 'currentSemester', target: 'profile', required: true, type: 'number' },
  Address: { field: 'address', target: 'profile', required: false, type: 'string' }
};

const SEMESTER_COLUMN_MAP = {};

for (let sem = 1; sem <= 8; sem++) {
  SEMESTER_COLUMN_MAP[`SEM${sem}_SGPA`] = {
    field: 'sgpa',
    target: 'semester',
    semNumber: sem,
    required: false,
    type: 'decimal'
  };
  SEMESTER_COLUMN_MAP[`SEM${sem}_CREDITS`] = {
    field: 'credits',
    target: 'semester',
    semNumber: sem,
    required: false,
    type: 'number'
  };
  SEMESTER_COLUMN_MAP[`SEM${sem}_NEW_BACKLOGS`] = {
    field: 'newBacklogs',
    target: 'semester',
    semNumber: sem,
    required: false,
    type: 'number'
  };
  SEMESTER_COLUMN_MAP[`SEM${sem}_CLEARED_BACKLOGS`] = {
    field: 'clearedBacklogs',
    target: 'semester',
    semNumber: sem,
    required: false,
    type: 'number'
  };
}

const EXCEL_COLUMN_MAP = {
  ...BASIC_COLUMN_MAP,
  ...SEMESTER_COLUMN_MAP
};

const ALL_EXPECTED_HEADERS = Object.keys(EXCEL_COLUMN_MAP);
const BASIC_HEADERS = Object.keys(BASIC_COLUMN_MAP);

module.exports = {
  EXCEL_COLUMN_MAP,
  BASIC_COLUMN_MAP,
  SEMESTER_COLUMN_MAP,
  ALL_EXPECTED_HEADERS,
  BASIC_HEADERS
};
