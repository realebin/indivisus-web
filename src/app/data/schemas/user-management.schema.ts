/**
 * ? Response Section
 */
export interface UserManagementInquiryAppUserHttpResponse {
  epoch: number;
  data: {
    id: number;
    role: string;
    first_name: string;
    last_name: string;
    username: string;
    password?: string;
    full_name: string;
    site_id: string;
    site_name: string;
  }[];
}

export interface UserManagementInquiryCustomerHttpResponse {
  epoch: number;
  data: {
    customer_id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    address: string;
    phone_number: string;
    city: string;
    postal_code: string;
    notes: string;
  }[];
}

export interface UserManagementInquirySupplierHttpResponse {
  epoch: number;
  data: {
    supplier_id: number;
    full_name: string;
    address: string;
    phone_number: string;
    city: string;
    country: string;
    postal_code: string;
    notes: string
  }[];
}

/**
 * ? Request Section
 */
export interface UserManagementCreateAppUserHttpRequest {
  user_id?: number;
  role: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  full_name: string; // gaperlu kirim
  site_id: string;
}

export interface UserManagementCreateCustomerHttpRequest {
  customer_id?: number;
  first_name: string;
  last_name: string;
  full_name: string;
  address: string;
  phone_number: string;
  city: string;
  postal_code: string;
  notes?: string;
}

export interface UserManagementCreateSupplierHttpRequest {
  supplier_id?: number;
  first_name: string;
  address: string;
  phone_number: string;
  city: string;
  postal_code: string;
  notes: string;
  country: string;
}

export interface UserManagementDeleteHttpRequest {
  type: string;
  id: number;
}

export interface UpdatePasswordUserHttpRequest {
  user_id?: number;
  password: string;
}
