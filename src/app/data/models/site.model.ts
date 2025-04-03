/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  SiteAllListOverviewHttpResponse,
  SiteCreateHttpRequest,
  SiteUpdateHttpRequest,
  SiteDetailInquiryHttpResponse,
  SiteInquiryHttpResponse,
  SiteStockHeadersResponse
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
  createdAt: string;
  changedOn: string;
}

// Site with overview data
export interface SiteWithOverview extends Site {
  typeOverviews?: {
    [type: string]: {
      totalPackage: number;
      totalStock: number;
      sizeDescription: string;
    }
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

/**
 * Request Models
 */

export interface SiteCreateRequest {
  siteName: string;
  address: string;
  picUserId: string;
}

export interface SiteUpdateRequest {
  siteId: string;
  siteName: string;
  address: string;
  picUserId: string;
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
    data: response.data.map(site => ({
      siteId: site.site_id,
      siteName: site.site_name,
      address: site.address,
      picUserId: site.pic_user_id,
      picUsername: site.pic_username,
      picFullName: site.pic_full_name,
      createdAt: site.created_at,
      changedOn: site.changed_on
    }))
  };
}

export function transformToSiteInquiryResponse(
  response: SiteInquiryHttpResponse
): SiteInquiryResponse {
  const sites = response.data.map(site => {
    const siteWithOverview: SiteWithOverview = {
      siteId: site.site_id,
      siteName: site.site_name,
      address: site.address,
      picUserId: site.pic_user_id,
      picUsername: site.pic_username,
      picFullName: site.pic_full_name,
      createdAt: site.created_at,
      changedOn: site.changed_on,
      typeOverviews: {}
    };

    // Add type overviews if available
    if (site.type_overviews) {
      Object.keys(site.type_overviews).forEach(key => {
        const typeOverview = site.type_overviews?.[key];
        if (siteWithOverview.typeOverviews && typeOverview) {
          siteWithOverview.typeOverviews[key] = {
            totalPackage: typeOverview.total_package,
            totalStock: typeOverview.total_stock,
            sizeDescription: typeOverview.size_description
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
    createdAt: response.data.created_at,
    changedOn: response.data.changed_on
  };

  return { site };
}

export function transformToSiteStockHeadersResponse(
  response: SiteStockHeadersResponse
): SiteStockHeadersResponseModel {
  return {
    siteId: response.data.site_id,
    siteName: response.data.site_name,
    stockItems: response.data.stock_items.map(item => ({
      stockId: item.stock_id,
      productId: item.product_id,
      productName: item.product_name,
      type: item.type,
      remainingTotalPackages: item.remaining_total_packages,
      remainingTotalStock: item.remaining_total_stock,
      sizeDescription: item.size_description,
      bigPackagesCount: item.big_packages_count
    }))
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
    pic_user_id: request.picUserId
  };
}

export function transformToSiteUpdateHttpRequest(
  request: SiteUpdateRequest
): SiteUpdateHttpRequest {
  return {
    site_id: request.siteId,
    site_name: request.siteName,
    address: request.address,
    pic_user_id: request.picUserId
  };
}
