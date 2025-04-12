import {
  BigPackage,
  SmallPackage,
  StockCreateRequest,
  StockHeader,
  StockUpdateRequest,
} from '@schemas/stock.schema';

export interface StockHeaderModel {
  stockId: string;
  productId: string;
  productName: string;
  type: string;
  specs: string;
  price: number;
  remainingStock: number;
  totalSizeAmount: number;
  sizeDescription: string;
  siteId: string;
  siteName: string;
  bigPackages: BigPackageModel[];
  createdAt: string;
  createdBy: string;
  changedOn: string;
  changedBy: string;
}

export interface BigPackageModel {
  packageNumber: string;
  totalQuantity: number;
  totalSizeAmount: number;
  sizeDescription: string;
  isOpen: boolean;
  smallPackages: SmallPackageModel[];
  createdAt: string;
  createdBy: string;
  changedOn: string;
  changedBy: string;
}

export interface SmallPackageModel {
  packageId: string;
  quantity: number;
  sizeAmount: number;
  sizeDescription: string;
  isOpen: boolean;
  createdAt: string;
  createdBy: string;
  changedOn: string;
  changedBy: string;
}

// Transform functions for HTTP response to model
export function transformToStockHeaderModel(
  stock: StockHeader
): StockHeaderModel {
  return {
    stockId: stock.stock_id,
    productId: stock.product_id,
    productName: stock.product_name,
    type: stock.type,
    specs: stock.specs,
    price: stock.price,
    remainingStock: stock.remaining_stock,
    totalSizeAmount: stock.total_size_amount,
    sizeDescription: stock.size_description,
    siteId: stock.site_id,
    siteName: stock.site_name,
    bigPackages: stock.big_packages.map(transformToBigPackageModel),
    createdAt: stock.created_at,
    createdBy: stock.created_by,
    changedOn: stock.changed_on,
    changedBy: stock.changed_by,
  };
}

export function transformToBigPackageModel(
  bigPackage: BigPackage
): BigPackageModel {
  return {
    packageNumber: bigPackage.package_number,
    totalQuantity: bigPackage.total_quantity,
    totalSizeAmount: bigPackage.total_size_amount,
    sizeDescription: bigPackage.size_description,
    isOpen: bigPackage.is_open,
    smallPackages: bigPackage.small_packages.map(transformToSmallPackageModel),
    createdAt: bigPackage.created_at,
    createdBy: bigPackage.created_by,
    changedOn: bigPackage.changed_on,
    changedBy: bigPackage.changed_by,
  };
}

export function transformToSmallPackageModel(
  smallPackage: SmallPackage
): SmallPackageModel {
  return {
    packageId: smallPackage.package_id,
    quantity: smallPackage.quantity,
    sizeAmount: smallPackage.size_amount,
    sizeDescription: smallPackage.size_description,
    isOpen: smallPackage.is_open,
    createdAt: smallPackage.created_at,
    createdBy: smallPackage.created_by,
    changedOn: smallPackage.changed_on,
    changedBy: smallPackage.changed_by,
  };
}

// Transform functions for model to HTTP request
export function transformToStockCreateRequest(model: {
  productId: string;
  productName: string;
  type: string;
  specs: string;
  price: number;
  sizeDescription: string;
  siteId: string;
  bigPackages: {
    packageNumber: string;
    sizeDescription: string;
    smallPackages: {
      sizeAmount: number;
      sizeDescription: string;
      createdBy: string;
    }[];
    createdBy: string;
  }[];
  createdBy: string;
}): StockCreateRequest {
  return {
    product_id: model.productId,
    product_name: model.productName,
    type: model.type,
    specs: model.specs,
    price: model.price,
    size_description: model.sizeDescription,
    site_id: model.siteId,
    big_packages: model.bigPackages.map((bp) => ({
      package_number: bp.packageNumber,
      size_description: bp.sizeDescription,
      small_packages: bp.smallPackages.map((sp) => ({
        size_amount: sp.sizeAmount,
        size_description: sp.sizeDescription,
        created_by: sp.createdBy,
      })),
      created_by: bp.createdBy,
    })),
    created_by: model.createdBy,
  };
}

export function transformToStockUpdateRequest(model: {
  stockId: string;
  productName: string;
  type: string;
  specs: string;
  price: number;
  sizeDescription: string;
  siteId: string;
  changedBy: string;
}): StockUpdateRequest {
  return {
    stock_id: model.stockId,
    product_name: model.productName,
    type: model.type,
    specs: model.specs,
    price: model.price,
    size_description: model.sizeDescription,
    site_id: model.siteId,
    changed_by: model.changedBy,
  };
}
