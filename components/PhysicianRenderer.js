// currently in use
import React from "react";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import _ from "lodash";
import useProfile from "@/hooks/useProfile";

export default function PhysicianRenderer({
  gridProps,
}) {
  const { permissions, userDetails } = useProfile();
  const name = gridProps.colDef.field;
  const filterModel = gridProps.api.getFilterModel();
  let displayValue = null;
  let tooltipValues = null;
  if (name === "orderingPhysicianName") {
    const orderPhyArr =
      gridProps.node.data.orderingPhysicianName?.split("@splitter@") || [];
    displayValue = orderPhyArr[0]?.trim();
    if (orderPhyArr.length > 1) {
      displayValue = displayValue + " +".concat(orderPhyArr.length - 1);
    }
    tooltipValues = orderPhyArr;
  } else if (name === "assignedReadingPhysician") {
    const readingPhy = (
      gridProps.node.data.readingPhysicianName?.split(",") || []
    ).map((x) => x.trim());
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

    const IsRadAssistant = false
    if (
      !permissions.canViewStudiesAssignedToOtherReadingPhysicians &&
      !IsRadAssistant
    ) {
      tooltipValues = null;
    } else {
      if (readingPhy?.length !== 0) {
        displayValue +=
          readingPhy.length > 1 ? " +".concat(readingPhy.length - 1) : "";
      }
      tooltipValues = gridProps.node.data.readingPhysicianName?.split(",");
    }
  }

  // const tooltipValue = tooltipValues && tooltipValues.split(',').join('\n');

  const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
      fontSize: 16,
      backgroundColor: "#5D5D5D",
      fontWeight: 400,
    },
  }));


  return (
    <div
      style={{ width: "100%", height: "100%" }}
    >
      <LightTooltip
        title={
          tooltipValues === null ? (
            ""
          ) : (
            <span>
              {tooltipValues?.length &&
                tooltipValues.map((name, idx) => (
                  <p
                    style={{
                      margin: 0,
                      marginBottom: "0.5rem",
                    }}
                    key={idx}
                  >
                    {name}
                    {idx < tooltipValues.length - 1 ? "," : ""}
                  </p>
                ))}
            </span>
          )
        }
        placement="right"
        arrow
      >
        <span>{displayValue}</span>
      </LightTooltip>
    </div>
  );
}
