import { getForegroundColor } from "@/utils/ForegroundColorsCalc";
import CheckboxHeader from "@/components/CheckboxHeader";

export const AgGridNumberFilterOptions = [
  "equals",
  "lessThan",
  "lessThanOrEqual",
  "greaterThan",
  "greaterThanOrEqual",
];

export const SelectionColumnDef = {
  filter: "agMultiColumnFilter",
  sortable: false,
  floatingFilter: true,
  floatingFilterComponentParams: { suppressFilterButton: true },
  filterParams: {
    filters: [
      {
        filter: false,
        floatingFilterComponent: CheckboxHeader,
      },
    ],
  },
};

export const RowSelection = {
  mode: "multiRow",
  selectAll: "filtered",
  headerCheckbox: false,
  checkboxes: true,
};

export const GetRowId = (params) => params?.data?.studyUuid;

export const GetRowStyle = (params) => ({
  backgroundColor: params?.data?.priorityColor,
  color: getForegroundColor(params?.data?.priorityColor),
  borderRadius: "5px",
  margin: "2px",
});

export const getInputFromGui = (guiElement) => {
  if (!guiElement) return null;
  const input = guiElement.querySelector(
    "input.ag-input-field-input.ag-text-field-input",
  );
  if (!input) return null;
  return input;
};
