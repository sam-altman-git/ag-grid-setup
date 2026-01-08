
export const COLUMN_ID_NAME_SORTING_MAPPER = {
  clinicUuids: "institutionName",
  subspecialityUuids: "subspecialityName",
  studyLocationUuids: "studyLocation",
  paymentTypeUuid: "paymentTypeName",
};

export const DEFAULT_VIEWING_STATUSES = [
  { viewingStatus: "AUTO SUSPENDED", id: 2 },
  { viewingStatus: "MANUALLY SUSPENDED", id: 3 },
  { viewingStatus: "OPENED/ LOCKED", id: 1 },
  { viewingStatus: "NOT OPENED", id: 0 },
];

export const DEFAULT_REPORTING_STATUS = [
  { reportingStatus: "ADDENDUM PENDING", id: 7 },
  { reportingStatus: "CANCELLED", id: 6 },
  { reportingStatus: "READ FINAL", id: 4 },
  { reportingStatus: "READ FINAL WITH ADDENDUM", id: 5 },
  { reportingStatus: "READ IN PROGRESS", id: 1 },
  { reportingStatus: "READ PARTIAL", id: 2 },
  { reportingStatus: "READ PRELIMINARY", id: 3 },
  { reportingStatus: "UNREAD", id: 0 },
];

export const CRITICAL_FINDING_STATUS = {
  closed: "Closed",
  open: "Open",
  close: "Closed",
};

export const CUSTOM_FILTERS_COLUMNS_ID = [
  "dateOfStudy",
  "finalizedAt",
  "createdAt",
  "prelimAt",
  "addendumAt",
];

export const UTC_DATE_COLUMNS = [
  "finalizedAt",
  "createdAt",
  "prelimAt",
  "addendumAt",
];
