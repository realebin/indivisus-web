import {
  StockFilterPrepareHttpResponse,
  StockInquiryHttpResponse,
} from '@schemas/stock.schema';

/**
 * ? Response Section
 */
export interface StockInquiryModelResponse {
  items?: StockItems[];
}

export interface StockItems {
  description?: string;
  totalBigPackages?: number;
  totalSmallPackages?: number;
  totalSizes?: {
    sizeDescription?: string;
    sizeAmount?: number;
  }[];
  stocks?: {
    idProduct: string;
    productName?: string;
    remainingBigPackages: number;
    sizes?: {
      sizeDescription?: string;
      sizeAmount?: number;
    }[];
    bigPackages?: {
      idLocation: string;
      locationName: string;
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
        //   idTheSmallestPackages : string;
        //   sizeDescription?: string;
        //   sizeAmount?: number;
        // }[]
      }[];
    }[];
  }[];
}

export interface StockFilterPrepareModelResponse {
  epoch: number;
  sites: {
    id: number;
    address: string;
    city: string;
    name: string;
  }[];

}

/**
 * ? Request Section
 */
// export interface StockInquiryModelRequest { // filter local aja deh
//   id?: number;
//   address: string;
//   city: string;
//   name: string;
//   pic: string;
//   phone: string;
// }

// export interface SiteDeleteModelRequest {
//   id: number;
// }

/**
 * ? Transform Response Section
 */

export function transformToStockInquiryModelResponse(
  response: StockInquiryHttpResponse
): StockInquiryModelResponse {
  const result: StockInquiryModelResponse = {
    items: response.items?.map((d) => {
      return {
        description: d.description,
        totalBigPackages: d.total_big_packages,
        totalSmallPackages: d.total_small_packages,
        totalSizes: d.total_sizes?.map((s) => {
          return {
            sizeDescription: s.size_description,
            sizeAmount: s.size_amount,
          };
        }),
        stocks: d.stocks?.map((s) => {
          return {
            idProduct: s.id_product,
            productName: s.product_name,
            remainingBigPackages: s.remaining_big_packages,
            sizes: s.sizes?.map((z) => {
              return {
                sizeDescription: z.size_description,
                sizeAmount: z.size_amount,
              };
            }),
            bigPackages: s.big_packages?.map((b) => {
              return {
                idLocation: b.id_location,
                locationName: b.location_name,
                idBigPackages: b.id_big_packages,
                sizes: b.sizes?.map((z) => {
                  return {
                    sizeDescription: z.size_description,
                    sizeAmount: z.size_amount,
                  };
                }),
                smallerPackages: b.small_packages.map((s) => {
                  return {
                    idSmallerPackages: s.id_small_packages,
                    sizeDescription: s.size_description,
                    sizeAmount: s.size_amount,
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

export function transformToStockFilterPrepareModelResponse(
  response: StockFilterPrepareHttpResponse
): StockFilterPrepareModelResponse {
  return {
    epoch: response.epoch,
    sites: response.sites.map((s) => {
      return {
        id: s.id,
        address: s.address,
        city: s.city,
        name: s.name,
      };
    }),
  };
}
