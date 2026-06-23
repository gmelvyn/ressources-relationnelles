export const roles = {
  citizen: "citizen",
  moderator: "moderator",
  catalogAdmin: "catalog_admin",
  superAdmin: "super_admin",
} as const;

export type AppRole = (typeof roles)[keyof typeof roles];

export function normalizeRole(role?: string | null): AppRole {
  if (role === roles.moderator || role === roles.catalogAdmin || role === roles.superAdmin) {
    return role;
  }

  return roles.citizen;
}

export function canModerate(role?: string | null) {
  const normalized = normalizeRole(role);
  return normalized === roles.moderator || normalized === roles.catalogAdmin || normalized === roles.superAdmin;
}

export function isSensitiveRole(role?: string | null) {
  return canModerate(role);
}

export function hasRequiredSensitiveAuth(role?: string | null, twoFactorEnabled?: boolean | null) {
  return !isSensitiveRole(role) || Boolean(twoFactorEnabled);
}

export function canAdminCatalog(role?: string | null) {
  const normalized = normalizeRole(role);
  return normalized === roles.catalogAdmin || normalized === roles.superAdmin;
}

export function canAdminUsers(role?: string | null) {
  return normalizeRole(role) === roles.superAdmin;
}

export function roleLabel(role?: string | null) {
  switch (normalizeRole(role)) {
    case roles.moderator:
      return "Modérateur";
    case roles.catalogAdmin:
      return "Administrateur catalogue";
    case roles.superAdmin:
      return "Super-administrateur";
    default:
      return "Citoyen";
  }
}
