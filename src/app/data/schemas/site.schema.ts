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

// Response for list-with-overview endpoint
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
    package_overview?: {
      type: string;
      total_packages: number | null;
      total_size: number | null;
    }[];
    size_overview?: {
      type: string;
      total_packages: number | null;
      total_size: number | null;
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
    created_at: string;
    changed_on: string;
    items?: {
      description: string;
      stocks?: {
        id_product: string;
        product_name: string;
        remaining_big_packages: number;
        sizes?: {
          size_description: string;
          size_amount: number;
        }[];
        big_packages?: {
          id_big_packages: string;
          sizes?: {
            size_description: string;
            size_amount: number;
          }[];
          smaller_packages: {
            id_smaller_packages: string;
            quantity?: number;
            size_description: string;
            size_amount: number;
          }[];
        }[];
      }[];
    }[];
  };
}

// Response for stock headers by site endpoint
export interface SiteStockHeadersResponse {
  epoch: number;
  data: {
    stock_id: string;
    product_id: string;
    product_name: string;
    type: string;
    remaining_stock: number;
    site_id: string;
    created_at: string;
    changed_on: string;
  }[];
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
