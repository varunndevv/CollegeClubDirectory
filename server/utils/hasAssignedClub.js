/**
 * Check whether a user has a valid assigned club ID.
 * Extracts the repeated 5-line check used across multiple routes.
 */
export function hasAssignedClub(assignedClubId) {
  return (
    assignedClubId !== undefined &&
    assignedClubId !== null &&
    String(assignedClubId).trim() !== "" &&
    String(assignedClubId).trim().toLowerCase() !== "null" &&
    String(assignedClubId).trim().toLowerCase() !== "undefined"
  );
}
