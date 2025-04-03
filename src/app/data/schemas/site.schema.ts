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
    created_at: string;
    changed_on: string;
    type_overviews?: {
      [type: string]: {
        total_package: number;
        total_stock: number;
        size_description: string;
      };
    };
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
    created_at: string;
    changed_on: string;
  };
}

// Response for stock headers by site endpoint
export interface SiteStockHeadersResponse {
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

/**
 * Request Schemas
 */

// Request for create site endpoint
export interface SiteCreateHttpRequest {
  site_name: string;
  address: string;
  pic_user_id: string;
}

// Request for update site endpoint
export interface SiteUpdateHttpRequest {
  site_id: string;
  site_name: string;
  address: string;
  pic_user_id: string;
}
