import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { appendStringsWithSpecialChar } from "../utils/helper";
// import CustomToolTip from "./CustomToolTip/CustomToolTip.tsx";
const CustomToolTip = ({ children }) => <div>{children}</div>;
library.add(fas, fab);

export default function CategoryIcon(props) {
  // requires category object
  const icon = props.category;
  const getContainerSize = () => {
    switch (props.size) {
      case "petite":
        return {
          height: "0.9rem",
          width: "0.9rem",
        };
      case "tiny":
        return {
          height: "1.2rem",
          width: "1.2rem",
        };
      case "small":
        return {
          height: "1.5rem",
          width: "1.5rem",
        };
      case "large":
        return {
          height: "2.5rem",
          width: "2.5rem",
        };
      default:
        return {
          height: "2rem",
          width: "2rem",
        };
    }
  };
  const getIconSize = () => {
    switch (props.size) {
      case "tiny":
        return {
          height: "80%",
          width: "80%",
        };
      default:
        return {
          height: "60%",
          width: "60%",
        };
    }
  };
  const title =
    typeof icon.category === "string"
      ? appendStringsWithSpecialChar([icon.category, icon.clinicName], " - ")
      : "";
  return (
    <div
      style={{
        backgroundColor: icon?.color ? icon.color : "#778899",
        borderRadius: "50%",
        lineHeight: "3px",
        margin: "1px",
        display: "grid",
        placeItems: "center",
        ...getContainerSize(),
        ...(props.containerStyle || {}),
      }}
    >
      <CustomToolTip title={title} placement="top" sx={{ fontSize: "15px" }}>
        <FontAwesomeIcon
          style={{
            overflow: "hidden",
            color: "black",
            display: "flex",
            margin: "auto",
            ...getIconSize(),
          }}
          icon={icon?.categoryIcon ? getIcon(icon.categoryIcon) : "bullseye"}
        />
      </CustomToolTip>
    </div>
  );
}

const SPLITTER = "<<SPLITTER>>";
export const getIconName = (icon) => icon?.prefix + SPLITTER + icon?.iconName;
export const getIcon = (iconName) =>
  iconName.includes(SPLITTER) ? iconName.split(SPLITTER) : iconName;
