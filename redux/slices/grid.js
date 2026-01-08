import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import reduxJson from "../../data/reduxData.json";
const initialState = {
  // workflowStore.js
  pacsLastResponse: {},
  readingPhysician: [],
  location: [],
  // workflowView.js
  modifiedFilterState: {},
  views: [],
  activeViewIdx: 0,
  // workflowStoreV2.slice.js
  subSpecialtyList: [],
  categoryList: [],
  studyStatusList: [],
  paymentTypeList: [],
  priorityList: [],
};

const gridSlice = createSlice({
  name: "grid",
  initialState: reduxJson || initialState,
  reducers: {
    updateStore: (state, action) => {
      _.map(_.keys(action.payload), (key) => {
        _.update(state, key, () => action.payload[key]);
      });
    },
    // workflowView.js
    setModifiedFilterState: (state, action) => {
      if (!action.payload || _.isEmpty(action.payload)) {
        state.modifiedFilterState = {};
        return state;
      }
      Object.entries(action.payload).forEach(([colId, newValue]) => {
        let calculateVal;
        if (_.isFunction(newValue)) {
          const clonedValue = _.cloneDeep(state.modifiedFilterState);
          calculateVal = newValue(clonedValue[colId], clonedValue);
        } else {
          calculateVal = newValue;
        }

        state.modifiedFilterState[colId] = {
          value: calculateVal,
          modified: true,
        };
      });
    },
    setViewColumnData: (state, action) => {
      // column data needs to be a string
      let { columnsData } = action.payload;
      columnsData = JSON.parse(columnsData);
      columnsData = columnsData.filter(
        (x) => x.colId !== "ag-Grid-ControlsColumn",
      );
      columnsData = JSON.stringify(columnsData);
      const index = state.activeViewIdx;
      const newViews = [...state.views];
      let newView = { ...newViews[index] };
      const newViewSettings = JSON.parse(newView.userworklistviewsettings);
      newView = {
        ...newView,
        userworklistviewsettings: JSON.stringify({
          ...newViewSettings,
          columnsData,
        }),
      };
      newViews[index] = newView;
      const newState = { ...state, views: newViews };
      return newState;
    },
  },
});

const { reducer } = gridSlice;

export const gridActions = gridSlice.actions;
export default reducer;
