import _ from "lodash";
import CustomTextFloatingFilter from "../components/CustomTextFloatingFilter";
import CustomTooltip from "../components/customTooltip";
import PhysicianRenderer from "../components/PhysicianRenderer";
import TimeRenderer from "../components/TimeRender";
import { AgGridNumberFilterOptions } from "./gridConstants";
import { CategoryFilterCellRenderer } from "@/components/CategoryFilterCellRenderer";
import { BooleanMap, format, toDefaultUSDateFormat } from "./helper";
import {
  DEFAULT_REPORTING_STATUS,
  DEFAULT_VIEWING_STATUSES,
} from "./businessConstants";
import RenderCriticalTracking from "../components/RenderCriticalTracking";

const filterAllowedItems = (columns) => {
  return columns.filter((col) => {
    const toInclude = typeof col.isAllowed === "boolean" ? col.isAllowed : true;
    delete col.isAllowed;
    return toInclude;
  });
};

export default function getColumns(
  permissions,
  Prior,
  EditStudy,
  categoryRedux,
  Category,
  studyStatusRedux,
  priorityRedux,
  userDetails,
  readingPhysicianRedux,
  menuTabs,
  subSpecialityRedux,
  locationRedux,
  paymentTypeList,
  ViewAuditLogs,
) {
  const columns = [
    {
      headerName: "Prior",
      headerTooltip: "Prior Study",
      maxWidth: 40,
      field: "priorStudyIcon",
      resizable: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: Prior,
      isAllowed: permissions.canViewPriors,
    },
    {
      headerName: "Edit",
      headerTooltip: "Edit Study",
      maxWidth: 40,
      field: "edtiStudyIcon",
      resizable: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: EditStudy,
      isAllowed: permissions.canEditStudy,
    },
    {
      headerName: "Category",
      headerTooltip: "Category",
      maxWidth: 300,
      minWidth: 260,
      field: "categoryList",
      resizable: true,
      filter: true,
      valueGetter: (params) => {
        const data =
          params?.data?.categoryList?.split(",").map((e) => e.trim()) || [];
        return data?.length ? data : [""];
      },
      filterParams: {
        values: [null, ...categoryRedux.map((ob) => ob.uuid)],
        valueFormatter: ({ value }) =>
          categoryRedux.find(({ uuid }) => +uuid === +value)?.label,
        cellRenderer: CategoryFilterCellRenderer,
        cellRendererParams: { isFilterRenderer: true },
        suppressSorting: true,
        showTooltips: true,
      },
      floatingFilter: true,
      cellRenderer: Category,
      cellRendererParams: {
        prop1: "this is prop1",
      },
    },
    {
      headerName: "Study Status",
      headerTooltip: "Study Status",
      field: "studyStatus",
      filter: "agSetColumnFilter",
      sortable: true,
      filterParams: {
        values: studyStatusRedux.map((ob) => ob.uuid),
        valueFormatter: ({ value }) =>
          studyStatusRedux.find((ob) => +ob.uuid === +value)?.label,
        suppressSorting: true,
        showTooltips: true,
      },
      floatingFilter: true,
      resizable: true,
    },
    {
      headerName: "Priority",
      headerTooltip: "Priority",
      filter: "agSetColumnFilter",
      floatingFilter: true,
      field: "priorityName",
      filterParams: {
        values: [null, ...priorityRedux.map((ob) => ob.priorityName)], // store values internally
        suppressSorting: true,
        showTooltips: true,
        valueFormatter: (params) => {
          if (!params?.value) return params?.value;
          // to show label in filter dropdown instead of original value from db
          // because original values are not user friendly
          if (_.isArray(priorityRedux)) {
            const match = priorityRedux.find(
              (ob) => ob?.priorityName === params?.value,
            );
            return match ? match?.label : params?.value; //original values with clinic name
          }
          return params?.value;
        },
      },
      sortable: true,
      resizable: true,
    },
    {
      headerName: "Priority Level",
      headerTooltip: "Priority Level",
      field: "priorityLevel",
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
      sortable: true,
      resizable: true,
    },
    {
      headerName: "Time",
      headerTooltip: "Time",
      maxWidth: 120,
      sortable: true,
      field: "created",
      resizable: true,
      cellRenderer: TimeRenderer,
    },
    {
      headerName: "Reading Physician",
      headerTooltip: "Reading Physician",
      maxWidth: 220,
      field: "assignedReadingPhysician",
      resizable: true,
      sortable: false,
      filter: "agSetColumnFilter",
      filterValueGetter: (params) => {
        const uids =
          params.node?.data?.readingPhysicianUuid
            ?.split(",")
            .map((e) => e.trim()) || [];
        return uids?.length ? uids : [""];
      },
      valueGetter: (gridProps) => {
        const filterModel = gridProps.api?.getFilterModel();
        const readingPhy = (
          gridProps.node.data?.readingPhysicianName?.split(",") || []
        ).map((x) => x.trim());
        let displayValue = "";
        if (!_.isEmpty(filterModel?.assignedReadingPhysician)) {
          displayValue = _.get(readingPhy, "[0]", "");
        } else {
          const readingPhyUuidArrr =
            gridProps.node.data.readingPhysicianUuid
              ?.split(",")
              .map((e) => e?.trim()) || [];
          const valToChoose = readingPhyUuidArrr.indexOf(
            userDetails.readingPhyUuid,
          );
          displayValue = readingPhy[valToChoose === -1 ? 0 : valToChoose];
        }
        return `${displayValue?.toLowerCase()} ${(gridProps.node.data?.readingPhysicianName ?? "")?.toLowerCase()}`;
      },
      filterParams: {
        values: [null, ...readingPhysicianRedux.map((ob) => ob.uuid)],
        suppressSorting: true,
        valueFormatter: ({ value }) =>
          readingPhysicianRedux.find((ob) => ob.uuid === value)?.label,
      },
      cellRenderer: (props) =>
        PhysicianRenderer({
          gridProps: props,
        }),
      floatingFilter:
        permissions.canViewStudiesAssignedToOtherReadingPhysicians,
      menuTabs: menuTabs?.filter((tab) => {
        return tab === "filterMenuTab"
          ? permissions.canViewStudiesAssignedToOtherReadingPhysicians
          : true;
      }),
    },

    {
      headerName: "Patient Name",
      headerTooltip: "Patient Name",
      field: "patientsName",
      resizable: true,
      sortable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Patient ID",
      headerTooltip: "Patient ID",
      field: "patientMRN",
      resizable: true,
      sortable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Accession No",
      headerTooltip: "Accession No",
      field: "accessionNumber",
      resizable: true,
      sortable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },

    {
      headerName: "DOS",
      headerTooltip: "Date of Study",
      field: "dateOfStudy",
      resizable: true,
      sortable: true,
      // Not Relevant at moment
      // floatingFilterComponent: CustomFloatingFilter,
      // filter: DateRangeFilter,
      floatingFilter: true,
      cellRenderer: CustomTooltip,
      valueFormatter: ({ data }) => toDefaultUSDateFormat(data.dateOfStudy),
    },
    {
      headerName: "Sex",
      headerTooltip: "Sex",
      maxWidth: 140,
      minWidth: 90,
      field: "patientSex",
      resizable: true,
      sortable: true,
      filter: "agSetColumnFilter",
      filterParams: {
        values: [null, "F", "M"],
        valueFormatter: ({ value }) => {
          const genders = { M: "Male", F: "Female" };
          return value === null ? "Blanks" : genders[value];
        },
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "DOB",
      headerTooltip: "Date of Birth",
      field: "patientBirthDate",
      resizable: true,
      sortable: true,
      floatingFilter: true,
      cellRenderer: CustomTooltip,
      // Not Relevant at moment
      // filter: DateFilter,
      // floatingFilterComponent: CustomDateFloatingFilter,
      valueFormatter: ({ data }) =>
        toDefaultUSDateFormat(data.patientBirthDate),
    },
    {
      headerName: "Modality",
      headerTooltip: "Modality Name",
      maxWidth: 120,
      field: "modality",
      resizable: true,
      sortable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Study Description",
      headerTooltip: "Study Description",
      field: "studyDescription",
      resizable: true,
      sortable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },

    {
      headerName: "Subspecialty",
      headerTooltip: "Subspecialty",
      field: "subspecialityUuids",
      resizable: true,
      sortable: true,
      filter: "agSetColumnFilter",
      filterParams: {
        values: [null, ...subSpecialityRedux.map((ob) => ob.uuid)],
        valueFormatter: ({ value }) =>
          subSpecialityRedux.find((ob) => ob.uuid === value)?.label,
        suppressSorting: true,
        showTooltips: true,
      },
      floatingFilter: true,
      valueFormatter: ({ data }) => {
        return data?.subspecialityName || "";
      },
      filterValueGetter: ({ data }) => data?.subspecialityUuid || null,
    },

    {
      headerName: "Clinic",
      headerTooltip: "Clinic Name",
      field: "clinicUuids",
      resizable: true,
      sortable: true,
      filter: "agSetColumnFilter",
      // filterParams: {
      //   values: allowedClinics.map((ob) => ob.clinicUuid),
      //   suppressSorting: true,
      //   valueFormatter: ({ value }) =>
      //     allowedClinics.find((ob) => ob.clinicUuid === value)?.clinicName,
      // },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
      valueGetter: ({ data }) => data?.clinicUuid,
      valueFormatter: ({ data }) => data?.institutionName,
    },

    {
      headerName: "Location",
      headerTooltip: "Location",
      field: "studyLocationUuids",
      resizable: true,
      sortable: true,
      filter: "agSetColumnFilter",
      floatingFilter: true,

      // 👇 THIS aligns filtering with row data (same as subspecialty)
      filterValueGetter: ({ data }) => data?.studyLocationUuid || null,

      filterParams: {
        values: [null, ...locationRedux.map((ob) => ob.uuid)],
        suppressSorting: true,
        valueFormatter: ({ value }) =>
          locationRedux.find((ob) => ob.uuid === value)?.label || "",
      },

      // 👇 Cell display
      valueFormatter: ({ data }) => data?.studyLocation || "",

      // Optional (keep if you need tooltip rendering)
      cellRenderer: CustomTooltip,
    },

    {
      headerName: "Ordering Physician",
      headerTooltip: "Ordering Physician",
      field: "orderingPhysicianName",
      resizable: true,
      sortable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      floatingFilter: true,
      cellRenderer: (props) =>
        PhysicianRenderer({
          gridProps: props,
        }),
    },

    {
      headerName: "AI Detected problem",
      headerTooltip: "AI Detected problem - is report is not to the standard",
      field: "aiDetected",
      resizable: true,
      sortable: false,
      filter: "agSetColumnFilter",
      filterParams: {
        values: [true, false],
        valueFormatter: ({ value }) => BooleanMap(value),
      },
      valueFormatter: ({ value }) => BooleanMap(value),
      floatingFilter: true,
    },
    {
      headerName: "Locked",
      headerTooltip: "Is Study Locked",
      field: "isLocked",
      resizable: true,
      sortable: false,
      filter: "agSetColumnFilter",
      filterParams: {
        values: [true, false],
        valueFormatter: ({ value }) => BooleanMap(value),
      },
      valueFormatter: ({ value }) => BooleanMap(value),
      floatingFilter: true,
    },

    {
      headerName: "Locked By",
      headerTooltip: "Locked By",
      field: "lockedByName",
      resizable: true,
      sortable: false,
      floatingFilter: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
    },
    {
      headerName: "Payment Type",
      headerTooltip: "Payment Type",
      field: "paymentTypeUuid",
      resizable: true,
      sortable: true,
      filter: "agSetColumnFilter",
      filterParams: {
        values: [null, ...paymentTypeList.map((ob) => ob.uuid)],
        valueFormatter: ({ value }) =>
          paymentTypeList.find((ob) => ob.uuid === value)?.label,
        suppressSorting: true,
        showTooltips: true,
      },
      floatingFilter: true,
      valueFormatter: ({ data }) => data?.paymentTypeName,
    },
    {
      headerName: "Series",
      headerTooltip: "Total Series count",
      maxWidth: 120,
      field: "seriesCount",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Image Count",
      headerTooltip: "Images Count",
      maxWidth: 150,
      field: "imageCount",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },

    {
      headerName: "Draft",
      headerTooltip: "Draft",
      maxWidth: 150,
      field: "draft",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Doc",
      headerTooltip: "Total Document Count",
      maxWidth: 120,
      field: "documentCount",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Prelim",
      headerTooltip: "Preliminary Reports",
      maxWidth: 120,
      field: "preliminaryReportCount",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Fin",
      headerTooltip: "Final Report",
      maxWidth: 120,
      field: "finalReportCount",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Expected",
      headerTooltip: "Expected",
      maxWidth: 150,
      field: "expected",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Rej",
      headerTooltip: "Rejected Report",
      maxWidth: 120,
      field: "rejectedReportCount",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Dic",
      headerTooltip: "Total Dictation Count",
      maxWidth: 120,
      field: "dictationCount",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "ER",
      headerTooltip: "Expected Peer Review",
      maxWidth: 120,
      field: "expectedPeerReview",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "EA",
      headerTooltip: "Expected Addendums",
      maxWidth: 120,
      field: "expectedAddendums",
      resizable: true,
      sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
      floatingFilter: true,
      cellRenderer: CustomTooltip,
    },
    {
      headerName: "Suspended",
      field: "isAutoSuspended",
      resizable: true,
      sortable: false,
      // filter: "agSetColumnFilter",
      filterParams: {
        values: [true, false],
        valueFormatter: ({ value }) => BooleanMap(value),
      },
      filter: "agSetColumnFilter",
      valueFormatter: ({ value }) => BooleanMap(value),
      floatingFilter: true,
    },
    {
      headerName: "Suspended By",
      headerTooltip: "Suspended By",
      field: "suspendedByName",
      resizable: true,
      sortable: false,
      floatingFilter: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
    },
    {
      headerName: "Problem",
      field: "isProblem",
      resizable: true,
      sortable: false,
      filterParams: {
        values: [true, false],
        valueFormatter: ({ value }) => BooleanMap(value),
      },
      valueFormatter: ({ value }) => BooleanMap(value),
      floatingFilter: true,
      filter: "agSetColumnFilter",
    },
    {
      headerName: "Problem Marked By",
      headerTooltip: "Problem Marked By",
      field: "markedProblemByName",
      resizable: true,
      sortable: false,
      floatingFilter: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
    },

    {
      headerName: "Reporting Status",
      headerTooltip: "Reporting Status",
      field: "reportingStatus",
      filter: "agSetColumnFilter",
      sortable: true,
      filterParams: {
        values: DEFAULT_REPORTING_STATUS.map((ob) => ob.id),
        suppressSorting: true,
        valueFormatter: ({ value }) =>
          DEFAULT_REPORTING_STATUS.find((ob) => +ob?.id === +value)
            ?.reportingStatus,
      },
      valueFormatter: (params) => params?.data?.reportingStatusName,
      floatingFilter: true,
      resizable: true,
    },

    {
      headerName: "Viewing Status",
      headerTooltip: "Viewing Status",
      field: "viewingStatus",
      filter: "agSetColumnFilter",
      sortable: true,
      filterParams: {
        values: DEFAULT_VIEWING_STATUSES.map((ob) => ob.id),
        suppressSorting: true,
        valueFormatter: ({ value }) =>
          DEFAULT_VIEWING_STATUSES.find((ob) => +ob?.id === +value)
            ?.viewingStatus,
      },
      valueFormatter: (params) => params?.data?.viewingStatusName,
      floatingFilter: true,
      resizable: true,
    },
    {
      headerName: "Critical findings in the report",
      headerTooltip: "Critical findings in the report",
      field: "isCriticalFindings",
      resizable: true,
      sortable: false,
      filterParams: {
        values: [true, false],
        valueFormatter: ({ value }) => BooleanMap(value),
      },
      valueFormatter: ({ value }) => BooleanMap(value),

      floatingFilter: true,
      filter: "agSetColumnFilter",
    },
    {
      headerName: "Finalized By",
      headerTooltip: "Finalized By",
      field: "finalizedByUuid",
      resizable: true,
      sortable: true,
      filter: "agSetColumnFilter",
      filterValueGetter: ({ data }) => data.finalizedByUuid,
      valueGetter: ({ data }) => data.finalizedBy?.toLowerCase(),
      valueFormatter: ({ data }) => data.finalizedBy,
      filterParams: {
        values: [null, ...readingPhysicianRedux.map((ob) => ob.uuid)],
        suppressSorting: true,
        valueFormatter: ({ value }) =>
          readingPhysicianRedux.find((ob) => ob.uuid === value)?.label,
      },
      floatingFilter:
        permissions.canViewStudiesAssignedToOtherReadingPhysicians,
      menuTabs: menuTabs?.filter((tab) => {
        return tab === "filterMenuTab"
          ? permissions.canViewStudiesAssignedToOtherReadingPhysicians
          : true;
      }),
    },

    {
      headerName: "Finalized At",
      headerTooltip: "Finalized At",
      field: "finalizedAt",
      sortable: true,
      floatingFilter: true,
      resizable: true,
      cellRenderer: CustomTooltip,
      valueFormatter: ({ data }) => {
        return data?.finalizedAt
          ? format(data?.finalizedAt, {
              format: "MM-DD-YYYY hh:mm A",
              utc: false,
            })
          : null;
      },
      filter: false,
      // filter: RISDateFilter,
      // floatingFilterComponent: CustomFloatingFilter,
      // filterParams: {
      //   rangeOverride,
      //   comparator: function (filterLocalDateAtMidnight, cellValue) {
      //     // convert cell value to local date
      //     const cellDate = new Date(cellValue);
      //     cellDate.setHours(0, 0, 0, 0);

      //     // compare the two dates
      //     if (cellDate.getTime() === filterLocalDateAtMidnight.getTime()) {
      //       return 0;
      //     }
      //     if (cellDate < filterLocalDateAtMidnight) {
      //       return -1;
      //     }
      //     if (cellDate > filterLocalDateAtMidnight) {
      //       return 1;
      //     }
      //   },
      // },
    },

    {
      headerName: "Audit",
      headerTooltip: "Audit Logs",
      field: "audit",
      resizable: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
      isAllowed: permissions.canGetAllAuditlogByStudyUids,
      cellRenderer: ViewAuditLogs,
    },
    {
      headerName: "Time remaining",
      headerTooltip: "Time remaining",
      field: "criticalFindingReportedTime",
      resizable: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
      // cellRenderer: ({ data }) => {
      //   if (data?.reportCriticalFindings) {
      //     if (
      //       data?.reportCriticalFindings?.status?.toLowerCase() ===
      //       CRITICAL_FINDING_STATUS["close"].toLowerCase()
      //     ) {
      //       return "";
      //     }

      //     return <TimeRemaining data={data} />;
      //   }
      // },
    },

    {
      headerName: "Critical Finding",
      headerTooltip: "Critical Finding",
      field: "criticalFindings",
      floatingFilter: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      resizable: true,
      sortable: false,
      cellRenderer: RenderCriticalTracking,
    },
    {
      headerName: "Critical Finding Event Log",
      headerTooltip: "Critical Finding Event Log",
      field: "statusAction",
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      floatingFilter: true,
      resizable: true,
      sortable: false,
      cellRenderer: RenderCriticalTracking,
    },
    {
      headerName: "Critical Finding Status",
      headerTooltip: "Critical Finding Status",
      field: "status",
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
      floatingFilter: true,
      resizable: true,
      sortable: false,
      cellRenderer: RenderCriticalTracking,
    },
    {
      headerName: "Critical TAT",
      headerTooltip: "Critical TAT",
      field: "criticalTat",
      resizable: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: RenderCriticalTracking,
    },
    {
      headerName: "Level",
      headerTooltip: "Level",
      field: "criticalFindingLevel",
      resizable: true,
      sortable: true,
      floatingFilter: true,
      filter: "agNumberColumnFilter",
      valueFormatter: ({ data }) => data?.criticalFindingLevel,
      filterParams: {
        filterOptions: AgGridNumberFilterOptions,
        maxNumConditions: 1,
      },
    },
    {
      headerName: "Current Action",
      headerTooltip: "Current Action",
      field: "currentAction",
      resizable: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
    },

    {
      headerName: "Prelim By",
      headerTooltip: "Prelim By",
      field: "prelimBy",
      resizable: true,
      sortable: true,
      floatingFilter: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
    },
    {
      headerName: "Prelim At",
      headerTooltip: "Prelim At",
      field: "prelimAt",
      sortable: true,
      resizable: true,
      cellRenderer: CustomTooltip,
      valueFormatter: ({ data }) => {
        return data?.prelimAt
          ? format(data?.prelimAt, {
              format: "MM-DD-YYYY hh:mm A",
              utc: false,
            })
          : null;
      },
      floatingFilter: true,
      // filter: RISDateFilter,
      // floatingFilterComponent: CustomFloatingFilter,
      // filterParams: {
      //   rangeOverride,
      //   comparator: function (filterLocalDateAtMidnight, cellValue) {
      //     // convert cell value to local date
      //     const cellDate = new Date(cellValue);
      //     cellDate.setHours(0, 0, 0, 0);

      //     // compare the two dates
      //     if (cellDate.getTime() === filterLocalDateAtMidnight.getTime()) {
      //       return 0;
      //     }
      //     if (cellDate < filterLocalDateAtMidnight) {
      //       return -1;
      //     }
      //     if (cellDate > filterLocalDateAtMidnight) {
      //       return 1;
      //     }
      //   },
      // },
    },
    {
      headerName: "Created By",
      headerTooltip: "Created By",
      field: "createdBy",
      resizable: true,
      sortable: true,
      floatingFilter: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
    },
    {
      headerName: "Created At",
      headerTooltip: "Created At",
      field: "createdAt",
      sortable: true,
      resizable: true,
      cellRenderer: CustomTooltip,
      valueFormatter: ({ data }) => {
        return data?.createdAt
          ? format(data?.createdAt, {
              format: "MM-DD-YYYY hh:mm A",
              utc: false,
            })
          : null;
      },
      floatingFilter: true,
      // filter: RISDateFilter,
      // floatingFilterComponent: CustomFloatingFilter,
      // filterParams: {
      //   rangeOverride,
      //   comparator: function (filterLocalDateAtMidnight, cellValue) {
      //     // convert cell value to local date
      //     const cellDate = new Date(cellValue);
      //     cellDate.setHours(0, 0, 0, 0);

      //     // compare the two dates
      //     if (cellDate.getTime() === filterLocalDateAtMidnight.getTime()) {
      //       return 0;
      //     }
      //     if (cellDate < filterLocalDateAtMidnight) {
      //       return -1;
      //     }
      //     if (cellDate > filterLocalDateAtMidnight) {
      //       return 1;
      //     }
      //   },
      // },
    },
    {
      headerName: "Addendum By",
      headerTooltip: "Addendum By",
      field: "addendumBy",
      resizable: true,
      sortable: true,
      floatingFilter: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply"],
        filterOptions: ["contains"],
        maxNumConditions: 1,
      },
      floatingFilterComponent: CustomTextFloatingFilter,
    },
    {
      headerName: "Addendum At",
      headerTooltip: "Addendum At",
      field: "addendumAt",
      sortable: true,
      resizable: true,
      cellRenderer: CustomTooltip,
      valueFormatter: ({ data }) => {
        return data?.addendumAt
          ? format(data?.addendumAt, {
              format: "MM-DD-YYYY hh:mm A",
              utc: false,
            })
          : null;
      },
      floatingFilter: true,
      filter: true,
      // filter: RISDateFilter,
      // floatingFilterComponent: CustomFloatingFilter,
      // filterParams: {
      //   rangeOverride,
      //   comparator: function (filterLocalDateAtMidnight, cellValue) {
      //     // convert cell value to local date
      //     const cellDate = new Date(cellValue);
      //     cellDate.setHours(0, 0, 0, 0);

      //     // compare the two dates
      //     if (cellDate.getTime() === filterLocalDateAtMidnight.getTime()) {
      //       return 0;
      //     }
      //     if (cellDate < filterLocalDateAtMidnight) {
      //       return -1;
      //     }
      //     if (cellDate > filterLocalDateAtMidnight) {
      //       return 1;
      //     }
      //   },
      // },
    },
  ];

  return filterAllowedItems(columns);
}
