import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { gridActions } from "../redux/slices/grid";

const CustomTextFloatingFilter = (props, ref) => {
  const inputRef = useRef(null);

  const dispatch = useDispatch();
  const wfView = useSelector((state) => state.grid);
  const { modifiedFilterState } = wfView;

  const modifiedFilter = useMemo(() => {
    return modifiedFilterState[props.column.colId];
  }, [modifiedFilterState, props.column.colId]);

  //   expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      onParentModelChanged(parentModel) {
        // When the filter is empty we will receive a null value here
        if (!parentModel) {
          inputRef.current.value = "";
        } else {
          inputRef.current.value = parentModel.filter;
        }
      },
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      if (modifiedFilter?.modified) {
        inputRef.current.value = modifiedFilter.value || "";
      } else if (props.model?.filterType === "text") {
        inputRef.current.value = props.model?.filter || "";
      }
    }
  }, [modifiedFilter, props.model]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      if (inputRef.current.value === "") {
        // clear the filter
        props.parentFilterInstance((instance) => {
          instance.onFloatingFilterChanged(null, null);
        });
        return;
      }

      props.parentFilterInstance((instance) => {
        instance.onFloatingFilterChanged("contains", inputRef.current.value);
      });
    }
  };

  const onInputBoxChanged = (e) => {
    dispatch(
      gridActions.setModifiedFilterState({
        [props.column.colId]: e.target.value,
      }),
    );
  };

  return (
    <div className="ag-input-wrapper">
      <input
        className="ag-input-field-input ag-text-field-input"
        ref={inputRef}
        onKeyDown={onKeyDown}
        onInput={onInputBoxChanged}
      />
    </div>
  );
};

export default React.forwardRef(CustomTextFloatingFilter);
