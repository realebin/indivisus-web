/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  SiteAllListOverviewHttpResponse,
  SiteCreateHttpRequest,
  SiteUpdateHttpRequest,
  SiteDetailInquiryHttpResponse,
  SiteInquiryHttpResponse,
  SiteStockHeadersHttpResponse,
  SiteStockHeadersWithSpecificProductHttpResponse,
} from '@schemas/site.schema';

/**
 * Model Interfaces
 */

// Base site model
export interface Site {
  siteId: string;
  siteName: string;
  address: string;
  picUserId: string;
  picUsername: string;
  picFullName: string;
  phone?: string;
  createdAt: string;
  changedOn: string;
}

// Site overview list item for basic lists
export interface SiteOverviewList {
  siteId: string;
  siteName: string;
  address: string;
  picUserId: string;
  picUsername: string;
  picFullName: string;
  phone?: string;
  createdAt: string;
  changedOn: string;
}

// Stock overview structure that matches API
export interface StockOverview {
  type: string;
  totalPackages: number;
  totalStock: number;
  sizeDescription: string;
}

// Updated SiteWithOverview to match API structure
export interface SiteWithOverview extends Site {
  stockOverview?: StockOverview[];
  // Legacy property for backward compatibility
  typeOverviews?: {
    [type: string]: {
      totalPackage: number;
      totalStock: number;
      sizeDescription: string;
    };
  };
}

// Site detail model
export interface SiteDetail extends Site {
  // Additional properties for detailed view if needed
}

// Stock header within a site
export interface SiteStockHeader {
  stockId: string;
  productId: string;
  productName: string;
  type: string;
  remainingTotalPackages: number;
  remainingTotalStock: number;
  sizeDescription: string;
  bigPackagesCount: number;
}

export interface SiteSpecificProduct {
  changedBy: string;
  changedOn: string;
  createdAt: string;
  createdBy: string;
  price: number;
  productId: string;
  productName: string;
  remainingStock: number;
  sizeDescription: string;
  specs: string;
  stockId: string;
  totalSizeAmount: number;
  type: string;
}

export interface SiteStockHeadersWithSpecificProductModelResponse {
  data: SiteSpecificProduct[];
}

/**
 * Request Models
 */

export interface SiteCreateRequest {
  siteName: string;
  address: string;
  picUserId: string;
  phone?: string;
}

export interface SiteUpdateRequest {
  siteId: string;
  siteName: string;
  address: string;
  picUserId: string;
  phone?: string;
}

/**
 * Response Models
 */

export interface SiteAllListResponse {
  data: SiteOverviewList[];
}

export interface SiteInquiryResponse {
  sites: SiteWithOverview[];
}

export interface SiteDetailResponse {
  site: SiteDetail;
}

export interface SiteStockHeadersResponseModel {
  siteId: string;
  siteName: string;
  stockItems: SiteStockHeader[];
}

/**
 * Transform functions for HTTP responses to models
 */

export function transformToSiteAllListResponse(
  response: SiteAllListOverviewHttpResponse
): SiteAllListResponse {
  return {
    data: response.data.map((site) => ({
      siteId: site.site_id,
      siteName: site.site_name,
      address: site.address,
      picUserId: site.pic_user_id,
      picUsername: site.pic_username,
      picFullName: site.pic_full_name,
      phone: site.phone,
      createdAt: site.created_at,
      changedOn: site.changed_on,
    })),
  };
}

export function transformToSiteInquiryResponse(
  response: SiteInquiryHttpResponse
): SiteInquiryResponse {
  const sites = response.data.map((site) => {
    const siteWithOverview: SiteWithOverview = {
      siteId: site.site_id,
      siteName: site.site_name,
      address: site.address,
      picUserId: site.pic_user_id,
      picUsername: site.pic_username,
      picFullName: site.pic_full_name,
      phone: site.phone,
      createdAt: site.created_at,
      changedOn: site.changed_on,
    };

    // Transform stock_overview from API to stockOverview
    if (site.stock_overview && site.stock_overview.length > 0) {
      siteWithOverview.stockOverview = site.stock_overview.map(overview => ({
        type: overview.type,
        totalPackages: overview.total_packages,
        totalStock: overview.total_size,
        sizeDescription: overview.size_description,
      }));

      // Also create typeOverviews for backward compatibility
      siteWithOverview.typeOverviews = {};
      site.stock_overview.forEach(overview => {
        if (siteWithOverview.typeOverviews) {
          siteWithOverview.typeOverviews[overview.type] = {
            totalPackage: overview.total_packages,
            totalStock: overview.total_size,
            sizeDescription: overview.size_description,
          };
        }
      });
    }

    return siteWithOverview;
  });

  return { sites };
}

export function transformToSiteDetailResponse(
  response: SiteDetailInquiryHttpResponse
): SiteDetailResponse {
  const site: SiteDetail = {
    siteId: response.data.site_id,
    siteName: response.data.site_name,
    address: response.data.address,
    picUserId: response.data.pic_user_id,
    picUsername: response.data.pic_username,
    picFullName: response.data.pic_full_name,
    phone: response.data.phone,
    createdAt: response.data.created_at,
    changedOn: response.data.changed_on,
  };

  return { site };
}

export function transformToSiteStockHeadersResponse(
  response: SiteStockHeadersHttpResponse
): SiteStockHeadersResponseModel {
  return {
    siteId: response.data.site_id,
    siteName: response.data.site_name,
    stockItems: response.data.stock_items.map((item) => ({
      stockId: item.stock_id,
      productId: item.product_id,
      productName: item.product_name,
      type: item.type,
      remainingTotalPackages: item.remaining_total_packages,
      remainingTotalStock: item.remaining_total_stock,
      sizeDescription: item.size_description,
      bigPackagesCount: item.big_packages_count,
    })),
  };
}

export function transformToSiteStockHeadersWithSpecificProductModelResponse(
  response: SiteStockHeadersWithSpecificProductHttpResponse
): SiteStockHeadersWithSpecificProductModelResponse {
  return {
    data: response.data.map((item) => ({
      changedBy: item.changed_by,
      changedOn: item.changed_on,
      createdAt: item.created_at,
      createdBy: item.created_by,
      price: item.price,
      productId: item.product_id,
      productName: item.product_name,
      remainingStock: item.remaining_stock,
      sizeDescription: item.size_description,
      specs: item.specs,
      stockId: item.stock_id,
      totalSizeAmount: item.total_size_amount,
      type: item.type,
    })),
  };
}

/**
 * Transform functions for models to HTTP requests
 */

export function transformToSiteCreateHttpRequest(
  request: SiteCreateRequest
): SiteCreateHttpRequest {
  return {
    site_name: request.siteName,
    address: request.address,
    pic_user_id: request.picUserId,
    phone: request.phone,
  };
}

export function transformToSiteUpdateHttpRequest(
  request: SiteUpdateRequest
): SiteUpdateHttpRequest {
  return {
    site_id: request.siteId,
    site_name: request.siteName,
    address: request.address,
    pic_user_id: request.picUserId,
    phone: request.phone,
  };
}