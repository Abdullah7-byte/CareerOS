export type PortalRole = "candidate" | "employer";

export function getPortalPath(role: unknown) {
  return role === "employer" ? "/dashboard/employer" : "/dashboard/candidate";
}
