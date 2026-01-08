import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const CheckboxHeader = ({ api }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [currenPage, setCurrentPage] = useState(0);
  const pacsLastResponse = useSelector((state) => state.grid.pacsLastResponse);
  const checkIfAllRowsSelected = () => {
    const allRows = api.getDisplayedRowCount();
    const rowNodes = [];
    for (let i = 0; i < allRows; i++) {
      rowNodes.push(api.getDisplayedRowAtIndex(i)?.selected);
    }
    const allTrue = rowNodes.every((element) => element === true);
    return allTrue;
  };

  const handleCheckboxChange = (selected) => {
    setIsChecked(selected);
    const allRows = api.getDisplayedRowCount();
    const rowNodes = [];
    for (let i = 0; i < allRows; i++) {
      rowNodes.push(api.getDisplayedRowAtIndex(i));
    }
    rowNodes.forEach((node) => node.setSelected(selected));
  };

  // Effect to update checkbox based on row selection or pagination changes
  useEffect(() => {
    setCurrentPage(pacsLastResponse.pageNumber);
    if (currenPage === pacsLastResponse) return;
    if (checkIfAllRowsSelected()) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [pacsLastResponse, currenPage]);

  return (
    <div className="ag-checkbox-header grid place-items-center">
      <input
        className="w-[15px] h-[15px] accent-[#2196f3]"
        type="checkbox"
        checked={isChecked}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
        aria-label="Select All"
      />
    </div>
  );
};

export default CheckboxHeader;
