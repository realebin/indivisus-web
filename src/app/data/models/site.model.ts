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

// Site with overview data
export interface SiteWithOverview extends Site {
  packageOverview?: {
    type: string;
    totalPackages: number | null;
    totalSize: number | null;
  }[];
  sizeOverview?: {
    type: string;
    totalPackages: number | null;
    totalSize: number | null;
  }[];
}

// Site detail model
export interface SiteDetail extends Site {
  items?: {
    description: string;
    stocks?: {
      productId: string;
      productName: string;
      remainingBigPackages: number;
      sizes?: {
        sizeDescription: string;
        sizeAmount: number;
      }[];
      bigPackages?: {
        bigPackageId: string;
        sizes?: {
          sizeDescription: string;
          sizeAmount: number;
        }[];
        smallerPackages: {
          smallerPackageId: string;
          quantity?: number;
          sizeDescription: string;
          sizeAmount: number;
        }[];
      }[];
    }[];
  }[];
}

// Stock header for sites
export interface SiteStockHeader {
  stockId: string;
  productId: string;
  productName: string;
  type: string;
  remainingStock: number;
  siteId: string;
  createdAt: string;
  changedOn: string;
}

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

export interface SiteAllListOverviewModelResponse {
  epoch: number;
  data: SiteOverviewList[]
}

/**
 * Request models
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
 * Response models
 */
export interface SiteAllListResponse {
  epoch: number;
  sites: Site[];
}

export interface SiteInquiryResponse {
  epoch: number;
  sites: SiteWithOverview[];
}

export interface SiteDetailResponse {
  epoch: number;
  site: SiteDetail;
}

export interface SiteStockHeadersResponseModel {
  epoch: number;
  stockHeaders: SiteStockHeader[];
}

/**
 * Transform HTTP Response to Model
 */

export function transformToSiteAllListResponse(
  response: SiteAllListOverviewHttpResponse
): SiteAllListResponse {
  return {
    epoch: response.epoch,
    sites: response.data.map(site => ({
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
  return {
    epoch: response.epoch,
    sites: response.data.map(site => ({
      siteId: site.site_id,
      siteName: site.site_name,
      address: site.address,
      picUserId: site.pic_user_id,
      picUsername: site.pic_username,
      picFullName: site.pic_full_name,
      createdAt: site.created_at,
      changedOn: site.changed_on,
      packageOverview: site.package_overview?.map(pkg => ({
        type: pkg.type,
        totalPackages: pkg.total_packages,
        totalSize: pkg.total_size
      })),
      sizeOverview: site.size_overview?.map(size => ({
        type: size.type,
        totalPackages: size.total_packages,
        totalSize: size.total_size
      }))
    }))
  };
}

export function transformToSiteDetailResponse(
  response: SiteDetailInquiryHttpResponse
): SiteDetailResponse {
  return {
    epoch: response.epoch,
    site: {
      siteId: response.data.site_id,
      siteName: response.data.site_name,
      address: response.data.address,
      picUserId: response.data.pic_user_id,
      picUsername: response.data.pic_username,
      picFullName: response.data.pic_full_name,
      createdAt: response.data.created_at,
      changedOn: response.data.changed_on,
      items: response.data.items?.map(item => ({
        description: item.description,
        stocks: item.stocks?.map(stock => ({
          productId: stock.id_product,
          productName: stock.product_name,
          remainingBigPackages: stock.remaining_big_packages,
          sizes: stock.sizes?.map(size => ({
            sizeDescription: size.size_description,
            sizeAmount: size.size_amount
          })),
          bigPackages: stock.big_packages?.map(bigPkg => ({
            bigPackageId: bigPkg.id_big_packages,
            sizes: bigPkg.sizes?.map(size => ({
              sizeDescription: size.size_description,
              sizeAmount: size.size_amount
            })),
            smallerPackages: bigPkg.smaller_packages.map(smallPkg => ({
              smallerPackageId: smallPkg.id_smaller_packages,
              quantity: smallPkg.quantity,
              sizeDescription: smallPkg.size_description,
              sizeAmount: smallPkg.size_amount
            }))
          }))
        }))
      }))
    }
  };
}

export function transformSiteAllListOverviewModelResponse(
  response: SiteAllListOverviewHttpResponse
): SiteAllListOverviewModelResponse {
  const result: SiteAllListOverviewModelResponse = {
    epoch: response.epoch,
    data: response.data.map((d) => {
      return {
        address: d.address,
        changedOn: d.changed_on,
        createdAt: d.created_at,
        picFullName: d.pic_full_name,
        picUserId: d.pic_user_id,
        picUsername: d.pic_username,
        siteId: d.site_id,
        siteName: d.site_name,
      };
    }),
  };
  return result;
}

export function transformToSiteStockHeadersResponse(
  response: SiteStockHeadersResponse
): SiteStockHeadersResponseModel {
  return {
    epoch: response.epoch,
    stockHeaders: response.data.map(header => ({
      stockId: header.stock_id,
      productId: header.product_id,
      productName: header.product_name,
      type: header.type,
      remainingStock: header.remaining_stock,
      siteId: header.site_id,
      createdAt: header.created_at,
      changedOn: header.changed_on
    }))
  };
}



/**
 * Transform Model to HTTP Request
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
