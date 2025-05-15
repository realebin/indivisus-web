/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
// src/app/data/schemas/site.schema.ts

/**
 * Site Management Schemas
 */

/**
 * Response Schemas
 */

// Response for list-all endpoint
export interface SiteAllListOverviewHttpResponse {
  epoch: number;
  data: {
    site_id: string;
    site_name: string;
    address: string;
    pic_user_id: string;
    pic_username: string;
    pic_full_name: string;
    phone?: string;
    created_at: string;
    changed_on: string;
  }[];
}

// Response for list-all-with-stock endpoint
export interface SiteInquiryHttpResponse {
  epoch: number;
  data: {
    site_id: string;
    site_name: string;
    address: string;
    pic_user_id: string;
    pic_username: string;
    pic_full_name: string;
    phone?: string;
    created_at: string;
    changed_on: string;
    // Updated to match API response structure
    stock_overview: {
      type: string;
      total_packages: number;
      total_size: number;
      size_description: string;
    }[];
  }[];
}

// Response for site detail endpoint
export interface SiteDetailInquiryHttpResponse {
  epoch: number;
  data: {
    site_id: string;
    site_name: string;
    address: string;
    pic_user_id: string;
    pic_username: string;
    pic_full_name: string;
    phone?: string;
    created_at: string;
    changed_on: string;
  };
}

// Response for stock headers by site endpoint
export interface SiteStockHeadersHttpResponse {
  epoch: number;
  data: {
    site_id: string;
    site_name: string;
    stock_items: {
      stock_id: string;
      product_id: string;
      product_name: string;
      type: string;
      remaining_total_packages: number;
      remaining_total_stock: number;
      size_description: string;
      big_packages_count: number;
    }[];
  };
}

export interface SiteStockHeadersWithSpecificProductHttpResponse {
  data: {
    changed_by: string;
    changed_on: string;
    created_at: string;
    created_by: string;
    price: number;
    product_id: string;
    product_name: string;
    remaining_stock: number;
    size_description: string;
    specs: string;
    stock_id: string;
    total_size_amount: number;
    type: string;
  }[]
}

/**
 * Request Schemas
 */

// Request for create site endpoint
export interface SiteCreateHttpRequest {
  site_name: string;
  address: string;
  pic_user_id: string;
  phone?: string;
}

// Request for update site endpoint
export interface SiteUpdateHttpRequest {
  site_id: string;
  site_name: string;
  address: string;
  pic_user_id: string;
  phone?: string;
}