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
  supplier_id?: string;
  supplier_name?: string;
  arrival_date?: string;
  small_packages: SmallPackage[];
  created_at: string;
  created_by: string;
  changed_on: string;
  changed_by: string;
}

export interface SmallPackage {
  package_id: string;
  quantity: number; // Always 1 as per requirement
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
  specs?: string;
  price: number;
  size_description: string;
  site_id: string;
  big_packages: BigPackageCreateRequest[];
  created_by: string;
}

export interface BigPackageCreateRequest {
  package_number?: string;
  size_description?: string;
  supplier_id?: string;
  arrival_date?: string;
  small_packages: SmallPackageCreateRequest[];
  created_by: string;
}

export interface SmallPackageCreateRequest {
  size_amount: number;
  size_description?: string;
  created_by: string;
}

export interface StockUpdateRequest {
  stock_id: string;
  product_name: string;
  type: string;
  specs?: string;
  price: number;
  size_description: string;
  site_id: string;
  changed_by: string;
}

export interface BigPackageUpdateRequest {
  package_number: string;
  size_description: string;
  is_open: boolean;
  supplier_id?: string;
  arrival_date?: string;
  changed_by: string;
}

export interface MarkPackageRequest {
  package_number?: string; // for big package
  package_id?: string; // for small package
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
