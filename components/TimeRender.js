import { styled } from "@mui/material/styles";

import React from "react";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import moment from "moment";

const TimeRenderer = (props) => {
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
    <LightTooltip title={props.value} placement="right" arrow>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: " 25px",
        }}
      >
        <div>{moment(props.value).fromNow()}</div>
      </div>
    </LightTooltip>
  );
};

export default TimeRenderer;
