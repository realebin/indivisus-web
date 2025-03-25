/**
 * ? Response Section
 */
export interface SiteInquiryHttpResponse {
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
        size_description?: string;
        size_amount?: number;
      }[];
    }[];
    packages?: {
      description?: string;
      amount?: number;
    }[];
  }[];
}

export interface SiteDetailInquiryHttpResponse {
  epoch: number;
  site_name: string;
  id_site: number;
  items?: {
    description?: string;
    stocks?: {
      id_product: string;
      product_name?: string;
      remaining_big_packages: number;
      sizes?: {
        size_description?: string;
        size_amount?: number;
      }[];
      big_packages?: {
        id_big_packages?: string;
        sizes?: {
          size_description?: string;
          size_amount?: number;
        }[];
        smaller_packages: {
          id_smaller_packages: string;
          // quantity: number;
          size_description?: string;
          size_amount?: number;
          // the_smallest_packages: {
          //   id_the_smallest_packages : string;
          //   size_description?: string;
          //   size_amount?: number;
          // }[]
        }[];
      }[];
    }[];
  }[];
}

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

/**
 * ? Request Section
 */
export interface SiteCreateEditHttpRequest {
  id?: number;
  address: string;
  city: string;
  name: string;
  pic: string;
  phone: string;
}

export interface SiteDeleteHttpRequest {
  id: number;
}
