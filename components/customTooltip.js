import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

export default function WorkflowCustomTooltip(props) {
  const LightTooltip = styled(({ className, ...props }) => (
    <>
      <Tooltip
        {...props}
        classes={{ popper: className }}
        placement={props.placement}
      />
    </>
  ))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
      //   backgroundColor: theme.palette.common.white,
      //   color: 'rgba(0, 0, 0, 0.87)',
      //   boxShadow: theme.shadows[1],
      fontSize: 16,
      backgroundColor: "#5D5D5D",
      fontWeight: 400,
    },
  }));

  const truncateText = (text, wordLimit = 3) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit
      ? `${words.slice(0, wordLimit).join(" ")}...`
      : text;
  };

  const displayText = props.isPatientDetails
    ? truncateText(props.valueFormatted || props.value)
    : props.valueFormatted || props.value;

  return (
    <LightTooltip
      title={props.valueFormatted || props.value}
      placement={
        props.valueFormatted?.length > 25 || props.value?.length > 25
          ? "left"
          : "top"
      }
      arrow
    >
      <span>{displayText}</span>
    </LightTooltip>
  );
}
