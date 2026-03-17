export type CmsRole = "admin" | "doctor" | "patient" | "receptionist";

export function isCmsRole(role: string): role is CmsRole {
  return role === "admin" || role === "doctor" || role === "patient" || role === "receptionist";
}

export function getDashboardHref(role: string) {
  if (!isCmsRole(role)) return "/";
  switch (role) {
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor";
    case "patient":
      return "/patient";
    case "receptionist":
      return "/receptionist";
  }
}

export function getRoleLabel(role: string) {
  return isCmsRole(role) ? role[0]!.toUpperCase() + role.slice(1) : role;
}

