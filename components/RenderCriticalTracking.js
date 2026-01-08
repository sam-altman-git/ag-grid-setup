import moment from "moment";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { CRITICAL_FINDING_STATUS } from "../utils/businessConstants";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "50vw",
    fontSize: 16,
    lineHeight: "24px",
    bacgroundColor: "#5D5D5D",
    padding: "0.5rem",
  },
});

function RenderCriticalTracking(props) {
  function calculateTimeDifference(startDateStr, endDateStr) {
    // Create Date objects from the provided strings
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Calculate the difference in milliseconds
    const diffMs = Math.abs(endDate - startDate);

    // Calculate hours, minutes, and seconds
    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    // Format as HH:MM:SS
    const formattedTime = [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");

    return formattedTime === "NaN:NaN:NaN" ? "00:00:00" : formattedTime;
  }

  function formatTimeToLocal(dateString) {
    // Create a new Date object using the provided date string
    const date = new Date(dateString);

    // Extract hours, minutes, and seconds
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    // Format as HH:MM:SS
    return `${hours}:${minutes}:${seconds}`;
  }

  const obj = {
    "Critical Finding": props?.data?.reportCriticalFindings?.criticalFindings,
    Level: props?.data?.reportCriticalFindings?.criticalFindingLevel,
    "Critical Finding Event Log":
      props?.data?.reportCriticalFindings?.statusAction,
    "Critical TAT": calculateTimeDifference(
      props?.data?.reportCriticalFindings?.criticalFindingReportedTime,
      props?.data?.reportCriticalFindings?.createdAt,
    ),
    "Critical Finding Status":
      CRITICAL_FINDING_STATUS[
        props?.data?.reportCriticalFindings?.status.toLowerCase()
      ],
  };
  return (
    <div>
      {props?.data?.reportCriticalFindings && (
        <>
          {props.colDef.headerName === "Critical TAT" ? (
            <CustomTooltip
              placement="top"
              arrow
              title={
                <React.Fragment>
                  <h6>
                    Start Time:{" "}
                    {formatTimeToLocal(
                      props?.data?.reportCriticalFindings
                        ?.criticalFindingReportedTime ||
                        props?.data?.reportCriticalFindings?.createdAt,
                    )}
                  </h6>
                  <h6>
                    End Time:{" "}
                    {formatTimeToLocal(
                      props?.data?.reportCriticalFindings?.createdAt,
                    )}
                  </h6>
                  <h6>
                    Date:{" "}
                    {moment(
                      props?.data?.reportCriticalFindings?.createdAt,
                    ).format("YYYY-MM-DD")}
                  </h6>
                </React.Fragment>
              }
            >
              {props?.data?.reportCriticalFindings &&
                props.data.reportCriticalFindings.status.toLowerCase() ===
                  CRITICAL_FINDING_STATUS["close"].toLowerCase() &&
                obj["Critical TAT"]}
            </CustomTooltip>
          ) : (
            obj[props.colDef.headerName]
          )}
        </>
      )}
    </div>
  );
}

export default RenderCriticalTracking;
