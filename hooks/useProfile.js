import { useCallback, useMemo } from "react";
import _ from "lodash";
export default function useProfile() {
  const userDetails = useMemo(() => {
    let user = {};
    if (typeof window !== "undefined") {
      const userInfo = localStorage.getItem("userInfo");
      user = userInfo ? JSON.parse(userInfo) : {};
    }
    return user;
  }, []);

  const checkUserGroup = useCallback(
    (input) => {
      const userGroups =
        userDetails?.userGroups?.map((g) => g?.toLowerCase()) || [];

      if (input instanceof Array) {
        // if any group is available returns true
        return input.some((group) => userGroups.includes(group?.toLowerCase()));
      } else if (typeof input === "string") {
        return userGroups.includes(input.toLowerCase());
      } else {
        throw new Error("Invalid Argument");
      }
    },
    [userDetails],
  );
  const permissions = useMemo(() => {
    const permissions = {};
    permissions.canViewStudiesAssignedToOtherReadingPhysicians = true;
    permissions.canChangeColumnSettings = true;
    permissions.canPinPacsColumns = true;
    permissions.canChangePacsColumnFilters = true;
    permissions.canHideUnhidePacsColumns = true;
    permissions.canUpdateCategory = true;
    permissions.canViewPriors = true;
    permissions.canEditStudy = true;
    permissions.canViewStudiesAssignedToOtherReadingPhysicians = true;
    permissions.canViewStudiesAssignedToOtherReadingPhysicians = true;
    permissions.canViewStudiesAssignedToOtherReadingPhysicians = true;
    permissions.canViewStudiesAssignedToOtherReadingPhysicians = true;
    permissions.canGetAllAuditlogByStudyUids = true;
    return permissions;
  }, []);

  return {
    userDetails,
    permissions,
    checkUserGroup,
  };
}


// readingPhyUuid
// userGroups
// clinicId