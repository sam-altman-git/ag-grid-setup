import React from "react";

export default function CustomLoadingComponent(props) {
  return (
    <div
      className="ag-custom-loading-cell"
      style={{
        paddingLeft: "10px",
        lineHeight: "25px",
        color: props.darkTheme ? "white" : "black",
      }}
    >
      <i className="fas fa-spinner fa-pulse"></i>{" "}
      <span
        style={{
          color: props.darkTheme ? "white" : "black",
        }}
      >
        {" " + props.loadingMessage}
      </span>
    </div>
  );
}
