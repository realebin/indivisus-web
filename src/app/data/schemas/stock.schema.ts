/**
 * ? Response Section
 */
export interface StockInquiryHttpResponse {
  epoch: number;
  items?: {
    description?: string; //? tali / kain
    total_big_packages?: number; //? 10
    total_small_packages?: number; //? 100
    total_sizes?:{
      size_description?: string; //? yard/meter
      size_amount?: number;
    }[],
    stocks?: {
      id_product: string;
      product_name?: string;
      remaining_big_packages: number;
      sizes?: {
        size_description?: string;
        size_amount?: number;
      }[];
      big_packages?: {
        id_location: string;
        location_name: string;
        id_big_packages?: string;
        sizes?: {
          size_description?: string;
          size_amount?: number;
        }[];
        small_packages: {
          id_small_packages: string;
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

export interface StockFilterPrepareHttpResponse {
  epoch: number;
  sites: {
    id: number;
    address: string;
    city: string;
    name: string;
  }[];
  items: {
    id: number;
    item_name: string;
    products: {
      id: number;
      name: string;
    }[];
  }[];
}

/**
 * ? Request Section
 */
// export interface StockInquiryHttpRequest { // filter local aja deh
//   id?: number;
//   address: string;
//   city: string;
//   name: string;
//   pic: string;
//   phone: string;
// }

// export interface SiteDeleteHttpRequest {
//   id: number;
// }
