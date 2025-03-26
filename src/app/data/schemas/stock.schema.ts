export interface StockHeader {
  stock_id: string;
  product_id: string;
  product_name: string;
  type: string;
  specs: string;
  price: number;
  remaining_stock: number;
  total_size_amount: number;
  size_description: string;
  site_id: string;
  site_name: string;
  big_packages: BigPackage[];
  created_at: string;
  created_by: string;
  changed_on: string;
  changed_by: string;
}

export interface BigPackage {
  package_number: string;
  total_quantity: number;
  total_size_amount: number;
  size_description: string;
  is_open: boolean;
  small_packages: SmallPackage[];
  created_at: string;
  created_by: string;
  changed_on: string;
  changed_by: string;
}

export interface SmallPackage {
  package_id: string;
  quantity: number;
  size_amount: number;
  size_description: string;
  is_open: boolean;
  created_at: string;
  created_by: string;
  changed_on: string;
  changed_by: string;
}

// Request interfaces
export interface StockCreateRequest {
  product_id: string;
  product_name: string;
  type: string;
  specs: string;
  price: number;
  size_description: string;
  site_id: string;
  big_packages: {
    package_number: string;
    size_description: string;
    small_packages: {
      size_amount: number;
      size_description: string;
      created_by: string;
    }[];
    created_by: string;
  }[];
  created_by: string;
}

export interface StockUpdateRequest {
  stock_id: string;
  product_name: string;
  type: string;
  specs: string;
  price: number;
  size_description: string;
  site_id: string;
  changed_by: string;
}

export interface StockListResponse {
  epoch: number;
  data: StockHeader[];
}
export interface StockDetailResponse {
  epoch: number;
  data: StockHeader;
}
