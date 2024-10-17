export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  phone_number: string;
  password: string;
  profile: string;
  tenant_id: string;
  roles: string[];
  password_changed: boolean;
  status: number;
  is_master: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleDetail {
  id: string;
  role_name: string;
  role_description: string;
  permissions: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TenantSubscription {
  id: string;
  name: string;
  project_limit: number;
  user_limit: number;
  response_limit: number;
  price: number;
  is_active: boolean;
  is_free: boolean;
}

export interface TenantType {
  id: string;
  name: string;
  logo: string;
  sub: TenantSubscription;
  sub_exp: string;
}

export interface UserPermissions {
  [key: string]: boolean;
}

export interface UserData {
  permissions: UserPermissions;
  roles_detail: RoleDetail[];
  tenant: TenantType;
  user: UserProfile;
}
