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
  }
