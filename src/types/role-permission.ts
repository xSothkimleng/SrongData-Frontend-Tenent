export interface PermissionType {
  id: string;
  permission_name: string;
  action: string;
  permission_code: number;
  group_num: number;
  permission_description: string;
}

export interface GroupType {
  id: string;
  group_name: string;
  group_num: number;
  permissions: PermissionType[];
}

export interface RoleType {
  id: string;
  role_name: string;
  role_description: string;
  permissions: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}
