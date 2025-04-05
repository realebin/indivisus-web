import {
  UserManagementInquiryAppUserHttpResponse,
  UserManagementInquiryCustomerHttpResponse,
  UserManagementInquirySupplierHttpResponse,
  UserManagementCreateAppUserHttpRequest,
  UserManagementCreateCustomerHttpRequest,
  UserManagementCreateSupplierHttpRequest,
  UserManagementDeleteHttpRequest,
} from '@schemas/user-management.schema';

/**
 * ? Basic Model Section
 */

export interface AppUser {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  password?: string;
  site: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  city: string;
  postalCode: string;
  notes: string;
}

export interface Supplier {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  city: string;
  country: string;
  postalCode: string;
  description: string;
}

/**
 * ? Response Section
 */
export interface UserManagementInquiryAppUserModelResponse {
  epoch: number;
  appUsers: AppUser[];
}

export interface UserManagementInquiryCustomerModelResponse {
  epoch: number;
  customers: Customer[];
}

export interface UserManagementInquirySupplierModelResponse {
  epoch: number;
  suppliers: Supplier[];
}

/**
 * ? Request Section
 */

export interface UserManagementCreateAppUserModelRequest {
  id?: number;
  role: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  fullName: string;
  site: string;
}

export interface UserManagementCreateCustomerModelRequest {
  id?: number;
  firstName: string;
  lastName: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  city: string;
  postalCode: string;
  notes: string;
}

export interface UserManagementCreateSupplierModelRequest {
  id?: number;
  name: string;
  address: string;
  phoneNumber: string;
  city: string;
  postalCode: string;
  description: string;
  country: string;
}

export interface UserManagementDeleteModelRequest {
  type: string;
  id: number;
}

/**
 * ? Transform Response Section
 */

export function transformToUserManagementInquiryAppUserModelResponse(
  response: UserManagementInquiryAppUserHttpResponse
): UserManagementInquiryAppUserModelResponse {
  const result: UserManagementInquiryAppUserModelResponse = {
    epoch: response.epoch,
    appUsers: response.data.map((d) => {
      return {
        fullName: d.full_name,
        role: d.role,
        firstName: d.first_name,
        id: d.id,
        lastName: d.last_name,
        password: d?.password,
        username: d.username,
        site: d.site
      };
    }),
  };

  return result;
}

export function transformToUserManagementInquiryCustomerModelResponse(
  response: UserManagementInquiryCustomerHttpResponse
): UserManagementInquiryCustomerModelResponse {
  const result: UserManagementInquiryCustomerModelResponse = {
    epoch: response.epoch,
    customers: response.data.map((d) => {
      return {
        fullName: d.full_name,
        firstName: d.first_name,
        id: d.customer_id,
        lastName: d.last_name,
        address: d.address,
        city: d.city,
        phoneNumber: d.phone_number,
        postalCode: d.postal_code,
        notes: d.notes
      };
    }),
  };

  return result;
}

export function transformToUserManagementInquirySupplierModelResponse(
  response: UserManagementInquirySupplierHttpResponse
): UserManagementInquirySupplierModelResponse {
  const result: UserManagementInquirySupplierModelResponse = {
    epoch: response.epoch,
    suppliers: response.data.map((d) => {
      return {
        name: d.full_name,
        id: d.supplier_id,
        address: d.address,
        city: d.city,
        phoneNumber: d.phone_number,
        postalCode: d.postal_code,
        country: d.country,
        description: d.description,
      };
    }),
  };

  return result;
}

/**
 * ? Transform Request Section
 */

export function transformToUserManagementCreateAppUserHttpRequest(
  request: UserManagementCreateAppUserModelRequest
): UserManagementCreateAppUserHttpRequest {
  const result: UserManagementCreateAppUserHttpRequest = {
    user_id: request?.id,
    full_name: request.fullName,
    role: request.role,
    first_name: request.firstName,
    last_name: request.lastName,
    password: request.password,
    username: request.username,
    site: request.site
  };

  return result;
}

export function transformToUserManagementCreateCustomerHttpRequest(
  request: UserManagementCreateCustomerModelRequest
): UserManagementCreateCustomerHttpRequest {
  const result: UserManagementCreateCustomerHttpRequest = {
    customer_id: request?.id,
    full_name: request.fullName,
    first_name: request.firstName,
    last_name: request.lastName,
    address: request.address,
    city: request.city,
    phone_number: request.phoneNumber,
    postal_code: request.postalCode,
  };

  return result;
}

export function transformToUserManagementCreateSupplierHttpRequest(
  request: UserManagementCreateSupplierModelRequest
): UserManagementCreateSupplierHttpRequest {
  const result: UserManagementCreateSupplierHttpRequest = {
    supplier_id: request?.id,
    name: request.name,
    address: request.address,
    city: request.city,
    phone_number: request.phoneNumber,
    postal_code: request.postalCode,
    country: request.country,
    description: request.description,
  };

  return result;
}

export function transformToUserManagementDeleteHttpRequest(
  request: UserManagementDeleteModelRequest
): UserManagementDeleteHttpRequest {
  const result: UserManagementDeleteHttpRequest = {
    id: request.id,
    type: request.type,
  };

  return result;
}
