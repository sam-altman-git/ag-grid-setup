import "ag-grid-enterprise";
import { LicenseManager } from "ag-grid-enterprise";
import { AG_GRID_LICENSE_KEY } from "@/utils/config.js";

LicenseManager.setLicenseKey(AG_GRID_LICENSE_KEY);

export const AgGridWrapper = ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        height: `calc(100vh - 5rem)`,
      }}
    >
      {children}
    </div>
  );
};
