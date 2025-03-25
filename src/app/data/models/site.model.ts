import {
  SiteAllListOverviewHttpResponse,
  SiteCreateEditHttpRequest,
  SiteDeleteHttpRequest,
  SiteDetailInquiryHttpResponse,
  SiteInquiryHttpResponse,
} from '@schemas/site.schema';

/**
 * ? Response Section
 */
export interface SiteInquiryModelResponse {
  epoch: number;
  sites: {
    id: number;
    address: string;
    city: string;
    name: string;
    pic: string;
    phone: string;
    stocks?: {
      description?: string;
      sizes?: {
        sizeDesc?: string;
        sizeAmount?: number;
      }[];
    }[];
    packages?: {
      description?: string;
      amount?: number;
    }[];
  }[];
}

export interface SiteDetailInquiryModelResponse {
  epoch: number;
  siteName: string;
  idSite: number;
  items?: {
    description?: string;
    stocks?: {
      idProduct: string;
      productName?: string;
      remainingBigPackages: number;
      sizes?: {
        sizeDescription?: string;
        sizeAmount?: number;
      }[];
      bigPackages?: {
        idBigPackages?: string;
        sizes?: {
          sizeDescription?: string;
          sizeAmount?: number;
        }[];
        smallerPackages: {
          idSmallerPackages: string;
          // quantity: number;
          sizeDescription?: string;
          sizeAmount?: number;
          // theSmallestPackages: {
          //   idTheSmallestPackages: string;
          //   sizeDescription?: string;
          //   sizeAmount?: number;
          // }[];
        }[];
      }[];
    }[];
  }[];
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
 * ? Request Section
 */
export interface SiteCreateEditModelRequest {
  siteName: string;
  address: string;
  picUserId: string;
}

export interface SiteDeleteModelRequest {
  id: number;
}

/**
 * ? Transform Response Section
 */

export function transformToSiteInquiryModelResponse(
  response: SiteInquiryHttpResponse
): SiteInquiryModelResponse {
  const result: SiteInquiryModelResponse = {
    epoch: response.epoch,
    sites: response.sites.map((d) => {
      return {
        address: d.address,
        city: d.city,
        id: d.id,
        name: d.name,
        phone: d.phone,
        pic: d.pic,
        stocks: d?.stocks?.map((s) => {
          return {
            description: s.description,
            sizes: s?.sizes?.map((sz) => {
              return {
                sizeDesc: sz.size_description,
                sizeAmount: sz.size_amount,
              };
            }),
          };
        }),
        packages: d?.packages?.map((p) => {
          return {
            description: p.description,
            amount: p.amount,
          };
        }),
      };
    }),
  };
  return result;
}

export function transformToSiteDetailInquiryModelResponse(
  response: SiteDetailInquiryHttpResponse
): SiteDetailInquiryModelResponse {
  const result: SiteDetailInquiryModelResponse = {
    epoch: response.epoch,
    idSite: response.id_site,
    siteName: response.site_name,
    items: response?.items?.map((i) => {
      return {
        description: i.description,
        stocks: i.stocks?.map((s) => {
          return {
            idProduct: s.id_product,
            productName: s.product_name,
            remainingBigPackages: s.remaining_big_packages,
            sizes: s.sizes?.map((sizes) => {
              return {
                sizeDescription: sizes.size_description,
                sizeAmount: sizes.size_amount,
              };
            }),
            bigPackages: s.big_packages?.map((big) => {
              return {
                idBigPackages: big.id_big_packages,
                sizes: big.sizes?.map((sizes) => {
                  return {
                    sizeDescription: sizes.size_description,
                    sizeAmount: sizes.size_amount,
                  };
                }),
                smallerPackages: big.smaller_packages.map((small) => {
                  return {
                    idSmallerPackages: small.id_smaller_packages,
                    // quantity: small.quantity,
                    sizeDescription: small.size_description,
                    sizeAmount: small.size_amount,
                    // theSmallestPackages: small.the_smallest_packages.map(
                    //   (smallest) => {
                    //     return {
                    //       idTheSmallestPackages:
                    //         smallest.id_the_smallest_packages,
                    //       sizeDescription: smallest.size_description,
                    //       sizeAmount: smallest.size_amount,
                    //     };
                    //   }
                    // ),
                  };
                }),
              };
            }),
          };
        }),
      };
    }),
  };
  return result;
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

/**
 * ? Transform Request Section
 */

export function transformToSiteCreateEditHttpRequest(
  request: SiteCreateEditModelRequest
): SiteCreateEditHttpRequest {
  const result: SiteCreateEditHttpRequest = {
    site_name: request.siteName,
    address: request.address,
    pic_user_id: request.picUserId
  };
  return result;
}

export function transformToSiteDeleteHttpRequest(
  request: SiteDeleteModelRequest
): SiteDeleteHttpRequest {
  const result: SiteDeleteHttpRequest = {
    id: request?.id,
  };

  return result;
}


