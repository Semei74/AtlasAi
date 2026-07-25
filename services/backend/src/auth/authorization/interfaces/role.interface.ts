export enum Role {
  Owner = "owner",
  Admin = "admin",
  Manager = "manager",
  User = "user",
  Viewer = "viewer",
}

export const ROLE_HIERARCHY: Record<string, number> = {
  [Role.Owner]: 5,
  [Role.Admin]: 4,
  [Role.Manager]: 3,
  [Role.User]: 2,
  [Role.Viewer]: 1,
};
