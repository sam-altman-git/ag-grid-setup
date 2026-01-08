import moment from "moment";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import arraySupport from "dayjs/plugin/arraySupport";
import objectSupport from "dayjs/plugin/objectSupport";
import _ from "lodash";

dayjs.extend(utc);
dayjs.extend(arraySupport);
dayjs.extend(objectSupport);

export function format(date, { utc = false, format = "YYYY-MM-DD" } = {}) {
  const dateObject = utc ? dayjs.utc(date) : dayjs(date);
  return dateObject.format(format);
}

export const formatDateToString = format;

export const getRISDateRangeFiltersString = (
  rangeValue,
  dateRange,
  returnUTC = false,
) => {
  let startDate, endDate;

  switch (rangeValue) {
    case "0": // Today
      startDate = moment().startOf("day");
      endDate = moment().endOf("day");
      break;
    case "1": // Yesterday
      startDate = moment().subtract(1, "days").startOf("day");
      endDate = moment().subtract(1, "days").endOf("day");
      break;
    case "N3": // Next 3 days
      startDate = moment().startOf("day");
      endDate = moment().add(2, "days").endOf("day");
      break;
    case "N7": // Next 7 days
      startDate = moment().startOf("day");
      endDate = moment().add(6, "days").endOf("day");
      // .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
      break;
    case "custom":
      startDate = moment(dateRange.startDate).startOf("day");
      endDate = moment(dateRange.endDate).endOf("day");
      break;
    default: // Treat as number of days to subtract
      startDate = moment().subtract(Number(rangeValue) - 1, "days");
      // .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
      endDate = moment().endOf("day");
      break;
  }

  if (returnUTC) {
    return {
      startDate: startDate.utc().toISOString(),
      endDate: endDate.utc().toISOString(),
      key: rangeValue,
    };
  }
  const startTo =
    format(startDate, { format: "YYYY-MM-DDT00:00:00.000" }) + "Z";
  const endTo = format(endDate, { format: "YYYY-MM-DDT23:59:59.999" }) + "Z";
  return {
    startDate: startTo,
    endDate: endTo,
    key: rangeValue,
  };
};

/**
 * Returns a filters object with startDate and endDate based on the rangeValue
 * @param {number|string} rangeValue - The range value (0: today, 1: yesterday, 2: tomorrow, >2: days ago, "custom": custom date range)
 * @param {object} dateRange - The custom date range object with startDate and endDate properties
 * @returns {object} filters - An object with startDate, endDate, and key properties
 */

export const getDateRangeFilters = (rangeValue, dateRange) => {
  const today = new Date();
  let startDate, endDate;

  if (rangeValue === 0) {
    // Today
    startDate = endDate = format(today, {});
  } else if (rangeValue === 1) {
    // Yesterday
    startDate = endDate = format(
      new Date(today.setDate(today.getDate() - 1)),
      {},
    );
  } else if (rangeValue === 2) {
    // Tomorrow
    startDate = endDate = format(
      new Date(today.setDate(today.getDate() + 1)),
      {},
    );
  } else if (rangeValue > 2) {
    startDate = format(
      new Date(today.setDate(today.getDate() - rangeValue + 1)),
      {},
    );
    endDate = format(new Date(), {});
  } else if (rangeValue === "custom") {
    startDate = new Date(dateRange.startDate);
    endDate = new Date(dateRange.endDate);
  }
  const startTo =
    format(startDate, { format: "YYYY-MM-DDT00:00:00.000" }) + "Z";
  const endTo = format(endDate, { format: "YYYY-MM-DDT23:59:59.999" }) + "Z";
  return { startDate: startTo, endDate: endTo, key: rangeValue };
};

export const toDefaultUSDateFormat = (dateString) => {
  if (!dateString) {
    return null;
  }
  const [yyyy, mm, dd] = dateString.split("T")[0].split("-");
  return [mm, dd, yyyy].join("-");
};

export const BooleanMap = (value) => {
  if (value === "true" || value === true) {
    return "YES";
  } else if (value === "false" || value === false) {
    return "NO";
  } else {
    return null;
  }
};

export const defaultAgGridFilters = {
  priorityLevel: null,
  patientsName: null,
  patientMRN: null,
  accessionNumber: null,
  studyDescription: null,
  institutionName: null,
  modality: null,
  subspecialityName: null,
  studyLocation: null,
  orderingPhysicianName: null,
  paymentTypeName: null,
  seriesCount: null,
  imageCount: null,
  documentCount: null,
  preliminaryReportCount: null,
  finalReportCount: null,
  rejectedReportCount: null,
  dictationCount: null,
  categoryList: null,
  studyStatus: null,
  priorityName: null,
  assignedReadingPhysician: null,
  patientSex: null,
  draft: null,
  expected: null,
  aiDetected: null,
  isLocked: null,
  expectedPeerReview: null,
  expectedAddendums: null,
  isSuspended: null,
  suspendedByName: null,
  isProblem: null,
  markedProblemByName: null,
  viewingStatusName: null,
  reportingStatusName: null,
  patientBirthDate: null,
  viewingStatus: null,
  reportingStatus: null,
  markedRead: null,
  studyLocationUuids: null,
  paymentTypeUuid: null,
  subspecialityUuids: null,
  clinicUuids: null,
  lockedByName: null,
  finalizedBy: null,
  finalizedByUuid: null,
  isCriticalFindings: null,
  criticalFindings: null,
  statusAction: null,
  criticalFindingLevel: null,
  prelimBy: null,
  prelimAt: null,
  addendumBy: null,
  addendumAt: null,
  createdAt: null,
  createdBy: null,
  status: null,
};

export const toWorkflowSearchFilterPayload = (model) => {
  const filterModel = { ...defaultAgGridFilters };
  for (const key in filterModel) {
    const data = model[key];
    if (data === null) continue;

    if (!filterModel[key]) {
      if (typeof data === "undefined") {
        filterModel[key] = null;
      } else if (data.filterType === "set") {
        filterModel[key] = data.values.length
          ? data.values.map((el) => (el === null ? "null" : el)).join(",") // mapping null to "null" because null gets omitted in join
          : "Show nothing";
      } else if (data.filterType === "text") {
        filterModel[key] = data.filter;
      } else if (data.filterType === "date") {
        const date = data.dateFrom.split(" ")[0];
        const payload = {
          startDate: `${date}T00:00:00.000`,
          endDate: `${date}T23:59:59.999`,
        };
        filterModel[key] = payload;
      } else if (data.filterType === "number") {
        filterModel[key] = data.filter;
        filterModel[key + "Condition"] = data.type;
      } else if (
        [
          "dateOfStudy",
          "patientBirthDate",
          "finalizedAt",
          "prelimAt",
          "createdAt",
          "addendumAt",
        ].includes(key)
      ) {
        filterModel[key] = data === null ? null : JSON.stringify(data);
      } else {
        filterModel[key] = null;
      }
      if (key === "isLocked" && filterModel[key] !== null) {
        filterModel.isLocked = filterModel.isLocked === "true" ? true : false;
      }

      if (key === "aiDetected" && filterModel[key] !== null) {
        filterModel.aiDetected =
          filterModel.aiDetected === "true" ? true : false;
      }

      if (
        getFilterKeyName[key] &&
        filterModel[getFilterKeyName[key]] !== null
      ) {
        filterModel[key] = filterModel[getFilterKeyName[key]];
      }
      if (key === "isCriticalFindings" && filterModel[key] !== null) {
        filterModel.isCriticalFindings =
          filterModel.isCriticalFindings === "true" ? true : false;
      }
      if (key === "isProblem" && filterModel[key] !== null) {
        filterModel.isProblem = filterModel.isProblem === "true" ? true : false;
      }
    }
  }

  return filterModel;
};

const getFilterKeyName = {
  criticalFindingLevelCount: "criticalFindingLevel",
};

export const toWorkflowStudy = (ob) => {
  if (ob.created) {
    ob.created = ob.created + "Z";
  }

  return {
    ...ob,
    ...ob.workflowStudyPatientDto,
    ...ob.reportCriticalFindings,
  };
};

export const getGridRowCount = ({ currPage, pageSize, totalRecords }) => {
  const elapsedRecords = (currPage - 1) * pageSize;
  const totalRecordsOnThisPage = totalRecords - elapsedRecords;
  const rowCount = Math.min(pageSize, totalRecordsOnThisPage);
  return rowCount;
};

export function isEmptyValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "String" ||
    value === "string" ||
    value === "NULL" ||
    value === "null" ||
    value === "Null" ||
    value === "undefined" ||
    value === "UNDEFINED" ||
    value === "yyyy-MM-dd'T'HH:mm:ss.SSSz"
  ) {
    return true;
  }
  return false;
}

export const appendStringsWithSpecialChar = (strArr, specialChar = "") => {
  if (!_.isArray(strArr)) {
    console.error("Expecting an array of strings!");
    return "";
  }
  const nonEmptyStringsArray = [];
  strArr?.map((str) => {
    if (!isEmptyValue(str)) {
      nonEmptyStringsArray.push(str);
    }
  });
  if (nonEmptyStringsArray?.length > 0) {
    return nonEmptyStringsArray.join(specialChar);
  }
  return "";
};
