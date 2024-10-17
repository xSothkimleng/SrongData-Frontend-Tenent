export interface Permission {
  id: string;
  permission_name: string;
  action: string;
  permission_code: number;
  group_num: number;
  permission_description: string;
}

export interface Role {
  id: string;
  role_name: string;
  role_description: string;
  permissions: Permission[] | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RoleDetail {
  permissions: Permission[];
  role: Role;
}
