import { Injectable } from "@nestjs/common";
import { ROLE_HIERARCHY } from "../interfaces/role.interface.js";
import { ROLE_PERMISSIONS } from "../permissions.js";

@Injectable()
export class AuthorizationService {
  public checkPermission(role: string, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    return permissions.includes(permission);
  }

  public requireRole(userRole: string, requiredRole: string): boolean {
    const userLevel = ROLE_HIERARCHY[userRole];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];
    if (userLevel === undefined || requiredLevel === undefined) return false;
    return userLevel >= requiredLevel;
  }

  public getEffectivePermissions(role: string): readonly string[] {
    return ROLE_PERMISSIONS[role] ?? [];
  }
}
