import { UserPermissions } from '../types/user';

export function hasRequiredPermissions(userPermissions: UserPermissions, requiredPermissions: number): boolean {
  return userPermissions[requiredPermissions] === true;
}
