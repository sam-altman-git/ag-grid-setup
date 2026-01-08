// Package Imports
import HistoryIcon from "@mui/icons-material/History";
import BorderColorSharpIcon from "@mui/icons-material/BorderColorSharp";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import { toast } from "aws-amplify";
import PeopleAltSharpIcon from "@mui/icons-material/PeopleAltSharp";
import axios from "axios";

// LOCAL FILE IMPORTS
// STYLES
import radinAgGridTheme from "@/styles/agGridTheme";
// HOOKS
import useProfile from "@/hooks/useProfile";
import useSmartRef from "@/hooks/useSmartRef";
// REDUX
import { gridActions } from "@/redux/slices/grid";
// COMPONENTS
import AddLsDataButton from "@/components/AddLsDataButton";
import { AgGridWrapper } from "@/components/AgGridWrapper";
import CustomLoadingComponent from "@/components/CustomLoadingComponent";
import CategoryIcon from "@/components/CategoryIcon";
import CategoryAutoComplete from "@/components/CategoryAutoComplete";
// UTILS
import { GROUPS } from "@/utils/constants";
import {
  getDateRangeFilters,
  getRISDateRangeFiltersString,
  format,
  getGridRowCount,
  toWorkflowSearchFilterPayload,
  toWorkflowStudy,
} from "@/utils/helper";
import callApi from "@/utils/api";
import {
  getInputFromGui,
  GetRowId,
  GetRowStyle,
  RowSelection,
  SelectionColumnDef,
} from "@/utils/gridConstants";
import {
  COLUMN_ID_NAME_SORTING_MAPPER,
  CUSTOM_FILTERS_COLUMNS_ID,
  UTC_DATE_COLUMNS,
} from "@/utils/businessConstants";
import getColumns from "@/utils/gridUtils";
// END OF IMPORTS

const stylescategory = {
  main: {
    height: "81%",
    marginTop: "3px",
    width: "210px",
    minWidth: "80px",
    background: "#00000040",
    borderRadius: "16px",
    display: "flex",
    padding: "2px",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  category: {
    maxHeight: "auto",
    borderRadius: "50%",
    padding: "2.5px",
    lineHeight: "3px",
    margin: "1px",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
};

const PAGESIZE = 25;

export default function Layout() {
  // const { setLoading: setLoader } = useLoading();
  const {
    darkTheme,
    modifiedFilterState,
    readingPhysician: readingPhysicianRedux,
    location: locationRedux,
  } = useSelector((store) => store.grid);
  const wfView = useSelector((store) => store.grid);
  const wfStoreV2 = useSelector((store) => store.grid);

  const [columnMenuOpened, setColumnMenuOpened] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gridQueryParams, setGridQueryParams] = useState(0);

  const gridRef = useRef();
  const pacCustomFilter = useRef(null);
  const dispatch = useDispatch();

  const { checkUserGroup, userDetails, permissions } = useProfile();

  const loadingCellRendererParams = {
    loadingMessage: "Loading...",
    darkTheme,
  };

  const menuTabs = useMemo(() => {
    if (!permissions.canChangeColumnSettings) {
      return [];
    }
    let tabs = [
      {
        tabId: "generalMenuTab",
        permCheck: () => {
          return permissions.canPinPacsColumns;
        },
      },
      {
        tabId: "filterMenuTab",
        permCheck: () => {
          return permissions.canChangePacsColumnFilters;
        },
      },
      {
        tabId: "columnsMenuTab",
        permCheck: () => {
          return (
            permissions.canHideUnhidePacsColumns || checkUserGroup(GROUPS.ADMIN)
          );
        },
      },
    ];
    tabs = tabs.filter((ob) => ob.permCheck());
    tabs = tabs.map(({ tabId }) => tabId);
    return tabs;
  }, [permissions, checkUserGroup]);

  const defaultColDef = useMemo(() => {
    return {
      menuTabs,
      suppressMenu: !checkUserGroup(GROUPS.ADMIN),
    };
  }, [menuTabs, checkUserGroup]);

  const setUnappliedFilter = useCallback(
    (updatedFilter) => {
      dispatch(gridActions.setModifiedFilterState(updatedFilter));
    },
    [dispatch],
  );

  const handleFilterModification = useCallback(
    (params) => {
      if (
        params.type === "filterModified" &&
        params.filterInstance.filterType === "text"
      ) {
        const colId = params.column.colId;

        const input = getInputFromGui(params.filterInstance.eGui);
        if (!input) return;
        setUnappliedFilter({ [colId]: input.value });
      }
    },
    [getInputFromGui, setUnappliedFilter],
  );
  const handleFilterOpen = useCallback(
    (params) => {
      const filterType = params.column.colDef.filter;
      if (
        params.type === "filterOpened" &&
        filterType === "agTextColumnFilter"
      ) {
        const colId = params.column.colId;
        const filterInput = getInputFromGui(params.eGui);
        if (!filterInput || !_.isString(filterInput.value)) return;
        const unappliedFilter = modifiedFilterState[colId];
        filterInput.value = unappliedFilter?.modified
          ? unappliedFilter?.value
          : filterInput.value;
      }
    },
    [getInputFromGui, modifiedFilterState],
  );

  const handleDragStopped = () => {
    const columnsData = JSON.stringify(gridRef.current.api.getColumnState());
    setColumnMenuOpened(false);

    wfView.views.length &&
      dispatch(gridActions.setViewColumnData({ columnsData }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cancelToken, setCancelToken] = useState(null);
  const finalizedByOthersView = false;
  const { simplifiedRef: socketDataRef } = useSmartRef(
    [cancelToken, finalizedByOthersView, wfView],
    ["cancelTokenRef", "finalizedByOthersView", "wfViewInRef"],
  );

  const getViewSettings = (idx) => {
    const { wfViewInRef: wfView } = socketDataRef;
    const index = idx || idx === 0 ? idx : wfView.activeViewIdx;
    const activeView = wfView.views[index];
    if (!activeView) {
      return {};
    }
    const activeViewSettings = JSON.parse(activeView.userworklistviewsettings);
    const dbSettings = JSON.parse(activeView.dbSettings);

    const filterData = JSON.parse(activeViewSettings.filterData) || {};
    const columnsData = JSON.parse(activeViewSettings.columnsData);
    let categoryFilter = activeViewSettings?.categoryFilter;
    const agGridFilters = JSON.parse(activeViewSettings?.agGridFilters);
    const customFilters = JSON.parse(activeViewSettings?.customFilters);
    categoryFilter = categoryFilter
      ? JSON.parse(activeViewSettings.categoryFilter)
      : [];
    let dateFilter = activeViewSettings?.dateFilter;
    dateFilter = dateFilter
      ? JSON.parse(activeViewSettings.dateFilter)
      : {
          filterBy: "",
          filterValue: "",
        };

    // Fields to process in customFilters
    CUSTOM_FILTERS_COLUMNS_ID.forEach((field) => {
      const filter = customFilters?.[field];
      if (filter && filter?.key !== undefined) {
        const rangeValue = filter?.key;
        if (rangeValue !== undefined) {
          if (UTC_DATE_COLUMNS.includes(field)) {
            customFilters[field] = getRISDateRangeFiltersString(
              rangeValue,
              filter,
              UTC_DATE_COLUMNS.includes(field),
            );
          } else {
            customFilters[field] = getDateRangeFilters(
              rangeValue,
              filter,
              UTC_DATE_COLUMNS.includes(field),
            );
          }
        }
      }
    });
    const readByUserTimestamp = customFilters?.readByUserTimestamp;
    if (readByUserTimestamp && readByUserTimestamp?.key !== undefined) {
      const rangeValue = readByUserTimestamp?.key;
      if (rangeValue !== undefined) {
        const filters = getDateRangeFilters(rangeValue, readByUserTimestamp);
        customFilters.readByUserTimestamp = filters;
      }
    }

    return {
      columnsData,
      filterData,
      dbSettings,
      activeViewUuid: activeView.userworklistviewidUuid,
      activeView,
      categoryFilter,
      dateFilter,
      agGridFilters,
      customFilters,
    };
  };

  const handleDisplayColumnsChanged = useCallback(
    (params) => {
      const currColState = params.api.getColumnState();
      const reduxColState = getViewSettings().columnsData;
      if (currColState?.length !== reduxColState?.length) {
        // toast.error("Invalid column state encountered")
        return;
      }
      if (columnMenuOpened) {
        for (let i = 0; i < currColState?.length; i++) {
          if (currColState[i].hide !== reduxColState[i].hide) {
            // close if any row is expanded
            // setNodeToExpand((prev) => {
            //   prev && prev.setExpanded(false);
            //   return null;
            // });
            dispatch(
              gridActions.setViewColumnData({
                columnsData: JSON.stringify(currColState),
              }),
            );
            return;
          }
        }
      }
    },
    [getViewSettings, columnMenuOpened],
  );

  const handleSortChanged = useCallback(
    (params) => {
      setGridQueryParams((prev) => prev + 1);
      handleDragStopped(params);
    },
    [handleDragStopped],
  );

  const newFilterChanged = (params) => {
    // setGridQueryParams((prev) => prev + 1);
    const filterModel = params.api.getFilterModel();

    Object.entries(modifiedFilterState).forEach(([colId, filter]) => {
      const { value, modified } = filter || {};
      if (!modified) {
        return;
      }
      let existingFilter = filterModel[colId];

      if (!existingFilter) {
        existingFilter = {
          filterType: "text",
          type: "contains",
          filter: "",
        };
      }

      if (existingFilter.filterType !== "text") return;

      if (existingFilter.filter !== value) {
        existingFilter.filter = value;
      }

      if (existingFilter.filter === null || existingFilter.filter === "") {
        delete filterModel[colId];
        return;
      }
      filterModel[colId] = existingFilter;
    });

    setUnappliedFilter(null);
    dispatch(gridActions.setAgGridFilters(filterModel));
  };

  /* Grid CellRenderers */
  function Prior(props) {
    const { isPrior } = props.data;
    return (
      <PeopleAltSharpIcon
        onClick={() => {
          if (!isPrior) {
            return;
          }
          if (!props.data.studyDescription) {
            toast.error("Invalid Study Description");
          } else {
            // just log
            console.log(props.node?.data?.studyUuid);
            // setNodeToExpand((prev) => {
            //   // if prev node available
            //   if (prev) {
            //     // if clicked on prev node again, toggle expansion
            //     if (props.node?.data?.studyUuid === prev?.data?.studyUuid) {
            //       prev.setExpanded(!prev.expanded);
            //     } else {
            //       // if clicked on new node, set expansion false for prev node & true for new node
            //       prev.setExpanded(false);
            //       props.node.setExpanded(true);
            //     }
            //   } else {
            //     props.node.setExpanded(true);
            //   }
            //   // ultimately save new node
            //   return props.node;
            // });
          }
        }}
        style={{
          height: "15px",
          opacity: isPrior ? 0.92 : 0.45,
          cursor: isPrior ? "pointer" : "not-allowed",
        }}
      />
    );
  }
  function EditStudy(props) {
    return (
      <Tooltip
        title={
          <h6 className="text-base bg-[#5D5D5D] font-normal mb-0">
            {props.data.isLocked
              ? `Locked By ${props?.data?.lockedByName}`
              : `Edit`}
          </h6>
        }
      >
        <BorderColorSharpIcon
          onClick={() => {
            const { studyUuid, lockedByName, isLocked } =
              props?.node?.data || {};
            console.log(props.node);
            console.log(props.node.data);
            console.log(studyUuid, lockedByName, isLocked);
            if (isLocked) {
              toast.error(`This study is currently locked by ${lockedByName}`);
              return;
            }
          }}
          style={{ height: "20px", cursor: "pointer" }}
        />
      </Tooltip>
    );
  }
  function CategoryList(props) {
    const category = useSelector((state) => state.workflowStoreV2.categoryList);
    const [assign, setAssign] = useState(
      props.cat ||
        category?.filter(({ categoryId }) =>
          props.studydetails.categoryList
            ?.split(",")
            ?.map((id) => Number(id))
            ?.includes(categoryId),
        ),
    );
    const [apicall, setApiCall] = useState(false);

  
    useEffect(() => {
      if (apicall) {
        props?.onClose && props.onClose();
      }
    }, [assign]);
    const onChangeHandler = (newValue) => {
      setAssign(newValue);
      setApiCall(true);
    };

    return (
      <CategoryAutoComplete
        options={category}
        sx={{ margin: "10px", width: "450px" }}
        size="small"
        value={assign}
        onChange={(event, newValue) => onChangeHandler(newValue)}
        placeholder="Select Category"
      />
    );
  }
  function Category(props) {
    const darkTheme = false;
    const wfStoreV2 = useSelector((state) => state.grid);

    const category = useMemo(() => {
      return wfStoreV2.categoryList;
    }, [wfStoreV2.categories, props.data?.clinicUuid]);

    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      event.preventDefault();
      if (!permissions.canUpdateCategory) {
        return;
      }
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    const cat = category?.filter(({ categoryId }) =>
      props.data.categoryList
        ?.split(",")
        .map((id) => Number(id))
        .includes(categoryId),
    );
    return (
      <>
        <div style={stylescategory.main} onContextMenu={handleClick}>
          {cat?.slice(0, 7)?.map((icon, index) => {
            return (
              <div
                key={index}
                style={{
                  ...stylescategory.category,
                  backgroundColor: icon.color ? icon.color : "#778899",
                }}
              >
                <CategoryIcon category={icon} size="tiny" />
              </div>
            );
          })}
          <ClickAwayListener onClickAway={() => handleClose()}>
            <Popper
              id={open ? "transition-popper" : undefined}
              open={open}
              anchorEl={anchorEl}
              placement={"bottom-start"}
              transition
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: darkTheme ? "#222628" : "background.paper",
                    }}
                  >
                    <CategoryList
                      cat={cat}
                      nodeToEdit={props.node}
                      studydetails={props.data}
                      handleClose={handleClose}
                    />
                  </Box>
                </Fade>
              )}
            </Popper>
          </ClickAwayListener>
        </div>
      </>
    );
  }
  function ViewAuditLogs(props) {
    return (
      <HistoryIcon
        onClick={() => console.log(props)}
        style={{ height: "20px", cursor: "pointer" }}
      />
    );
  }

  /* Grid CellRenderers */
  const columnDefs = useMemo(() => {
    const {
      subSpecialtyList: subSpecialityRedux,
      categoryList: categoryRedux,
      studyStatusList: studyStatusRedux,
      paymentTypeList: paymentTypeList,
      priorityList: priorityRedux,
    } = wfStoreV2;

    console.warn("WF STORE V2", {
      subSpecialityRedux,
      categoryRedux,
      studyStatusRedux,
      paymentTypeList,
      priorityRedux,
    });

    const columns = getColumns(
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
    );

    return columns;
  }, [wfStoreV2]);

  const renderViewSettings = (idx) => {
    const { columnsData, agGridFilters: filterData } = getViewSettings(idx);
    gridRef.current?.api?.applyColumnState({
      state: columnsData,
      applyOrder: true,
    });

    if (!filterData?.clinicUuids) {
      filterData["clinicUuids"] = {
        values: allowedClinics.map((ob) => ob.clinicUuid),
        filterType: "set",
      };
    }

    //@INFO: IF USER IS RAD ASSIST AND HAVING ASSOCIATED
    //PHYISICIAN THEN THEY JUST NEED TO SEE THIER ASSIGNED PHYSICIAN DATA ONLY
    let associatedPhyUuids = [];
    const isRadAssist = false;
    if (isRadAssist) {
      const associatedPhydata = userDetails.associateReadingPhysician;
      if (associatedPhydata && associatedPhydata.length > 0) {
        associatedPhyUuids = associatedPhydata.map((val) => val.id);
      }
    }

    if (!checkCanViewStudiesAssignedToOtherReadingPhysicians()) {
      const filterValues = isRadAssist
        ? associatedPhyUuids
        : [userDetails?.readingPhyUuid];

      const commonFilter = {
        filterType: "or",
        filters: [
          {
            filterType: "set",
            values: filterValues,
          },
          {
            filterType: "notSet",
          },
        ],
      };
      filterData.assignedReadingPhysician = commonFilter;
      if (!isRadAssist) {
        filterData.readByUserUuid = commonFilter;
      }
    }

    gridRef.current?.api?.setFilterModel(filterData);
  };

  const getDataSource = useCallback(
    (pageNumber) => ({
      getRows: (params) => {
        console.log("GETTING ROWS");
        // get data for request from our fake server
        const { sortModel } = params.request;
        let sortData = sortModel[0];

        if (sortData) {
          sortData = { ...sortData, colId: "priorityLevel", sort: "desc" };
        }
        // const pageSize = endRow - startRow || 100;
        // const pageNumberDetect = parseInt(endRow / pageSize) || 1;
        const { customFilters, agGridFilters: filterModel } = getViewSettings();
        const agGridFiltersPayload = toWorkflowSearchFilterPayload(filterModel);
        const subspeciality = agGridFiltersPayload.subspecialityName;
        delete agGridFiltersPayload.subspecialityName;

        const filterPayload = {
          pageNumber: pageNumber,
          pageSize: PAGESIZE,
          subspeciality,
          ...agGridFiltersPayload,
          ...customFilters,
          sortModel: sortData
            ? {
                colId:
                  COLUMN_ID_NAME_SORTING_MAPPER[sortData.colId] ||
                  sortData.colId,
                sort: sortData.sort,
              }
            : null,
          // clinicUuids: userDetails?.clinicId, // Changed in [NWA-3779]
          // commented as it's working needs to verified by the backend team // Apurva
          // readingPhysicianUuid: checkUserGroup(GROUPS.ADMIN)
          //   ? null
          //   : userDetails?.readingPhyUuid || "INVALID READING PHYSICIAN",
        };
        // changing date filter to have localtime as per backend requirements
        [
          // "dateOfStudy", // commented as it's currently under observation
          // "readByUserTimestamp",
          // "transcribedAt",
        ].forEach((fieldName) => {
          if (filterPayload?.[fieldName]?.startDate) {
            filterPayload[fieldName].startDate = format(
              filterPayload[fieldName].startDate,
              { format: "YYYY-MM-DDTHH:mm:ss", utc: true },
            );
          }
          if (filterPayload?.[fieldName]?.endDate) {
            filterPayload[fieldName].endDate = format(
              filterPayload[fieldName].endDate,
              { format: "YYYY-MM-DDTHH:mm:ss", utc: true },
            );
          }
        });
        const isRadAssist = false;
        // new changes
        filterPayload.readingPhysicianUuid = null;
        filterPayload.canViewStudiesAssignedToOtherReadingPhysicians =
          checkCanViewStudiesAssignedToOtherReadingPhysicians();
        if (
          !checkCanViewStudiesAssignedToOtherReadingPhysicians() ||
          isRadAssist
        ) {
          const readingPhyUuid =
            userDetails?.readingPhyUuid || "INVALID READING PHYSICIAN";
          // overwrite the filter
          filterPayload.assignedReadingPhysician = readingPhyUuid;
          filterPayload.finalizedByUuid = readingPhyUuid;
        }

        if (!filterPayload?.clinicUuids) {
          filterPayload.clinicUuids = allowedClinics
            .map((ob) => ob.clinicUuid)
            .join(",");
        } else if (typeof filterPayload.clinicUuids === "string") {
          filterPayload.clinicUuids = filterPayload.clinicUuids
            .split(",")
            .filter((c) => allowedClinics.some((ac) => ac.clinicUuid === c))
            .join(",");
        }
        filterPayload.paymentTypeUuids = filterPayload.paymentTypeUuid;
        delete filterPayload.paymentTypeUuid;
        filterPayload.patientId = filterPayload.patientMRN;
        delete filterPayload.patientMRN;

        if (
          _.isEqual(_.get(filterPayload, "sortModel.colId"), "finalizedByUuid")
        ) {
          _.set(filterPayload, "sortModel.colId", "finalizedBy");
        }
        pacCustomFilter.current = customFilters;
        const source = axios.CancelToken.source();
        params.api.flushAsyncTransactions();
        setCancelToken((prev) => {
          if (prev && _.isFunction(prev.cancel)) {
            prev.cancel("Old request cancelled due to new reuest");
          }
          return source;
        });
        callApi
          .post("api/getRowData", filterPayload, {
            cancelToken: source.token,
          })
          .then((response) => {
            console.log({response})
            if (response.totalRecords === 0) {
              toast.warn("NO MATCHING DATA FOUND");
            }
            const studies = response.data.map(toWorkflowStudy);

            const totalRecords = _.get(response, "totalRecords", 0);

            params.success({
              rowData: studies,
              rowCount: getGridRowCount({
                currPage: response.pageNumber,
                pageSize: PAGESIZE,
                totalRecords: totalRecords,
              }),
            });
            // Not Relevant at moment
            // const pageSize = PAGESIZE;
            // updateLatestResponse({
            //   ...response,
            //   totalRecords,
            //   totalPages: Math.ceil(totalRecords / pageSize),
            // });
            setCancelToken(null);
            // setLsStudyListUpdater((prev) => prev + 1);
          })
          .catch((err) => {
            console.log(err);
            params.fail();
          });
      },
    }),
    [
      wfView,
      userDetails,
      allowedClinics,
      checkCanViewStudiesAssignedToOtherReadingPhysicians,
    ],
  );

  const onGridReadyServer = useCallback(
    (params, pageNumber) => {
      renderViewSettings();
      const datasource = getDataSource(pageNumber);
      params?.api?.setGridOption("serverSideDatasource", datasource);
    },
    [wfView, getDataSource],
  );

  // Rendering Logic
  useEffect(() => {
    if (gridRef?.current && wfView.views.length) {
      onGridReadyServer(gridRef.current, 1);
    }
  }, [wfView.activeViewIdx, gridQueryParams]);
  // Rendering Logic

  return (
    <AgGridWrapper>
      <AddLsDataButton />
      <AgGridReact
        columnMenu="legacy"
        suppressColumnVirtualisation={true}
        maintainColumnOrder={true}
        rowSelection={RowSelection}
        selectionColumnDef={SelectionColumnDef}
        theme={radinAgGridTheme.default}
        getRowId={GetRowId}
        tooltipShowDelay={0}
        tooltipHideDelay={2000}
        asyncTransactionWaitMillis={1000}
        allowContextMenuWithControlKey={true}
        cellSelection={true}
        masterDetail={true}
        detailRowAutoHeight={true}
        rowModelType={"serverSide"}
        cacheBlockSize={PAGESIZE}
        getRowStyle={GetRowStyle}
        blockLoadDebounceMillis={500}
        suppressDragLeaveHidesColumns={true} // stop columns getting removed from the grid if they are dragged outside of the grid
        //
        // Not relevant
        // onRowDoubleClicked={handleRowDoubleClicked}
        // getContextMenuItems={getContextMenuItems}
        // getMainMenuItems={getMainMenuItems}
        // detailCellRendererParams={detailCellRendererParams}
        // onCellClicked={handleCellClicked}
        // onRowSelected={(params) => {
        //   console.log(params.api.getSelectedNodes());
        // }}
        //
        // Dynamic Props
        ref={gridRef}
        loadingCellRendererParams={loadingCellRendererParams}
        loadingCellRenderer={CustomLoadingComponent}
        // onRowSelected={(params) => {
        //   console.log(params.api.getSelectedNodes());
        // }}
        defaultColDef={defaultColDef}
        //
        onFilterModified={handleFilterModification}
        onFilterOpened={handleFilterOpen}
        onDragStopped={handleDragStopped}
        onDisplayedColumnsChanged={handleDisplayColumnsChanged}
        onSortChanged={handleSortChanged} //removed
        onFilterChanged={newFilterChanged}
        columnDefs={columnDefs}
        onGridReady={onGridReadyServer}
      />
    </AgGridWrapper>
  );
}

const allowedClinics = [];
const checkCanViewStudiesAssignedToOtherReadingPhysicians = () => true;

