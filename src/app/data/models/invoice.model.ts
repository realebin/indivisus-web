import {
  InvoiceInquiryHttpResponse,
  InvoiceDetailHttpResponse,
  InvoiceByCustomerHttpResponse,
  InvoiceBySiteHttpResponse,
  InvoiceByDateRangeHttpResponse,
  ProductListForInvoiceHttpResponse,
  InvoiceCreateHttpRequest,
  InvoiceUpdateHttpRequest,
  MultipleInvoicePdfRequest
} from '@schemas/invoice.schema';

export interface LineItem {
  lineItemId: string;
  stockId: string;
  productId: string;
  productName: string;
  type: string;
  bigPackageNumber: string;
  smallPackageId?: string;
  unitAmount?: number;
  unitPrice: number;
  totalPrice: number;
  sizeDescription: string;
  packageStatus: 'OPEN' | 'CLOSED';
  isEntireBigPackage?: boolean;
}

export interface Invoice {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  dueDate: string;
  totalPrice: number;
  totalQuantity: number;
  notes: string;
  reference?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  lineItems: LineItem[];
  createdBy: string;
  changedBy: string;
  createdAt: string;
  changedOn: string;
}

export interface LineItemWithMultiSelect {
  // Original properties from LineItem interface
  stockId: string;
  productId: string;
  bigPackageNumber: string;
  smallPackageId: string;
  unitAmount: number;
  unitPrice: number;
  productName?: string;
  type?: string;
  sizeDescription?: string;

  // UI extension properties
  _selectedSmallPackages?: string[];
  _bigPackageInfo?: {
    packageNumber: string;
    totalQuantity: number;
    totalSizeAmount: number;
    sizeDescription: string;
    isOpen: boolean;
    smallPackages: {
      packageId: string;
      quantity: number;
      sizeAmount: number;
      sizeDescription: string;
      isOpen: boolean;
    }[];
  };
}

export interface ProductForInvoice {
  stockId: string;
  productId: string;
  productName: string;
  type: string;
  price: number;
  sizeDescription: string;
  bigPackages: {
    packageNumber: string;
    totalQuantity: number;
    totalSizeAmount: number;
    sizeDescription: string;
    isOpen: boolean;
    smallPackages: {
      packageId: string;
      quantity: number;
      sizeAmount: number;
      sizeDescription: string;
      isOpen: boolean;
    }[];
  }[];
}

export interface ProductListForInvoice {
  siteId: string;
  siteName: string;
  products: ProductForInvoice[];
}

/**
 * ? Response Models
 */
export interface InvoiceInquiryModelResponse {
  epoch: number;
  invoices: Invoice[];
}

export interface InvoiceDetailModelResponse {
  epoch: number;
  invoice: Invoice;
}

export interface InvoiceByCustomerModelResponse {
  epoch: number;
  invoices: Invoice[];
}

export interface InvoiceBySiteModelResponse {
  epoch: number;
  invoices: Invoice[];
}

export interface InvoiceByDateRangeModelResponse {
  epoch: number;
  invoices: Invoice[];
}

export interface ProductListForInvoiceModelResponse {
  epoch: number;
  productList: ProductListForInvoice;
}

/**
 * ? Request Models
 */
export interface InvoiceCreateModelRequest {
  customerId: string;
  siteId: string;
  dueDate: string;
  notes?: string;
  reference?: string;
  lineItems: {
    stockId: string;
    productId: string;
    bigPackageNumber: string;
    smallPackageId?: string;
    unitAmount?: number;
    unitPrice: number;
    isEntireBigPackage?: boolean;
  }[];
  createdBy: string;
}

export interface InvoiceUpdateModelRequest {
  invoiceNumber: string;
  customerId: string;
  siteId: string;
  dueDate: string;
  notes?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  changedBy: string;
}

export interface MultipleInvoicePdfModelRequest {
  invoiceNumbers: string[];
}

/**
 * ? Transform Response Functions
 */
export function transformToInvoiceInquiryModelResponse(
  response: InvoiceInquiryHttpResponse
): InvoiceInquiryModelResponse {
  const invoices = response.data.map(invoiceData => ({
    invoiceNumber: invoiceData.invoice_number,
    customerId: invoiceData.customer_id,
    customerName: invoiceData.customer_name,
    siteId: invoiceData.site_id,
    siteName: invoiceData.site_name,
    dueDate: invoiceData.due_date,
    totalPrice: invoiceData.total_price,
    totalQuantity: invoiceData.total_quantity,
    notes: invoiceData.notes,
    reference: invoiceData.reference, // Add reference field
    status: invoiceData.status,
    lineItems: invoiceData.line_items.map(item => ({
      lineItemId: item.line_item_id,
      stockId: item.stock_id,
      productId: item.product_id,
      productName: item.product_name,
      type: item.type,
      bigPackageNumber: item.big_package_number,
      smallPackageId: item.small_package_id,
      unitAmount: item.unit_amount,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      sizeDescription: item.size_description,
      packageStatus: item.package_status,
      isEntireBigPackage: item.is_entire_big_package // Add new field
    })),
    createdBy: invoiceData.created_by,
    changedBy: invoiceData.changed_by,
    createdAt: invoiceData.created_at,
    changedOn: invoiceData.changed_on
  }));

  return {
    epoch: response.epoch,
    invoices
  };
}

export function transformToInvoiceDetailModelResponse(
  response: InvoiceDetailHttpResponse
): InvoiceDetailModelResponse {
  const invoice: Invoice = {
    invoiceNumber: response.data.invoice_number,
    customerId: response.data.customer_id,
    customerName: response.data.customer_name,
    siteId: response.data.site_id,
    siteName: response.data.site_name,
    dueDate: response.data.due_date,
    totalPrice: response.data.total_price,
    totalQuantity: response.data.total_quantity,
    notes: response.data.notes,
    reference: response.data.reference || '',
    status: response.data.status,
    lineItems: response.data.line_items.map(item => ({
      lineItemId: item.line_item_id,
      stockId: item.stock_id,
      productId: item.product_id,
      productName: item.product_name,
      type: item.type,
      bigPackageNumber: item.big_package_number,
      smallPackageId: item.small_package_id,
      unitAmount: item.unit_amount,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      sizeDescription: item.size_description,
      packageStatus: item.package_status as 'OPEN' | 'CLOSED',
      isEntireBigPackage: item.is_entire_big_package || false
    })),
    createdBy: response.data.created_by,
    changedBy: response.data.changed_by,
    createdAt: response.data.created_at,
    changedOn: response.data.changed_on
  };

  return {
    epoch: response.epoch,
    invoice
  };
}

export function transformToInvoiceByCustomerModelResponse(
  response: InvoiceByCustomerHttpResponse
): InvoiceByCustomerModelResponse {
  const invoices = response.data.map(invoiceData => ({
    invoiceNumber: invoiceData.invoice_number,
    customerId: invoiceData.customer_id,
    customerName: invoiceData.customer_name,
    siteId: invoiceData.site_id,
    siteName: invoiceData.site_name,
    dueDate: invoiceData.due_date,
    totalPrice: invoiceData.total_price,
    totalQuantity: invoiceData.total_quantity,
    notes: invoiceData.notes,
    status: invoiceData.status,
    lineItems: invoiceData.line_items.map(item => ({
      lineItemId: item.line_item_id,
      stockId: item.stock_id,
      productId: item.product_id,
      productName: item.product_name,
      type: item.type,
      bigPackageNumber: item.big_package_number,
      smallPackageId: item.small_package_id,
      unitAmount: item.unit_amount,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      sizeDescription: item.size_description,
      packageStatus: item.package_status as 'OPEN' | 'CLOSED'
    })),
    createdBy: invoiceData.created_by,
    changedBy: invoiceData.changed_by,
    createdAt: invoiceData.created_at,
    changedOn: invoiceData.changed_on
  }));

  return {
    epoch: response.epoch,
    invoices
  };
}

export function transformToInvoiceBySiteModelResponse(
  response: InvoiceBySiteHttpResponse
): InvoiceBySiteModelResponse {
  const invoices = response.data.map(invoiceData => ({
    invoiceNumber: invoiceData.invoice_number,
    customerId: invoiceData.customer_id,
    customerName: invoiceData.customer_name,
    siteId: invoiceData.site_id,
    siteName: invoiceData.site_name,
    dueDate: invoiceData.due_date,
    totalPrice: invoiceData.total_price,
    totalQuantity: invoiceData.total_quantity,
    notes: invoiceData.notes,
    status: invoiceData.status,
    lineItems: invoiceData.line_items.map(item => ({
      lineItemId: item.line_item_id,
      stockId: item.stock_id,
      productId: item.product_id,
      productName: item.product_name,
      type: item.type,
      bigPackageNumber: item.big_package_number,
      smallPackageId: item.small_package_id,
      unitAmount: item.unit_amount,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      sizeDescription: item.size_description,
      packageStatus: item.package_status as 'OPEN' | 'CLOSED'
    })),
    createdBy: invoiceData.created_by,
    changedBy: invoiceData.changed_by,
    createdAt: invoiceData.created_at,
    changedOn: invoiceData.changed_on
  }));

  return {
    epoch: response.epoch,
    invoices
  };
}

export function transformToInvoiceByDateRangeModelResponse(
  response: InvoiceByDateRangeHttpResponse
): InvoiceByDateRangeModelResponse {
  const invoices = response.data.map(invoiceData => ({
    invoiceNumber: invoiceData.invoice_number,
    customerId: invoiceData.customer_id,
    customerName: invoiceData.customer_name,
    siteId: invoiceData.site_id,
    siteName: invoiceData.site_name,
    dueDate: invoiceData.due_date,
    totalPrice: invoiceData.total_price,
    totalQuantity: invoiceData.total_quantity,
    notes: invoiceData.notes,
    status: invoiceData.status,
    lineItems: invoiceData?.line_items?.map(item => ({
      lineItemId: item.line_item_id,
      stockId: item.stock_id,
      productId: item.product_id,
      productName: item.product_name,
      type: item.type,
      bigPackageNumber: item.big_package_number,
      smallPackageId: item.small_package_id,
      unitAmount: item.unit_amount,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      sizeDescription: item.size_description,
      packageStatus: item.package_status as 'OPEN' | 'CLOSED'
    })) || [],
    createdBy: invoiceData.created_by,
    changedBy: invoiceData.changed_by,
    createdAt: invoiceData.created_at,
    changedOn: invoiceData.changed_on
  }));

  return {
    epoch: response.epoch,
    invoices
  };
}

export function transformToProductListForInvoiceModelResponse(
  response: ProductListForInvoiceHttpResponse
): ProductListForInvoiceModelResponse {
  const productList = {
    siteId: response.data.site_id,
    siteName: response.data.site_name,
    products: response.data.products.map(product => ({
      stockId: product.stock_id,
      productId: product.product_id,
      productName: product.product_name,
      type: product.type,
      price: product.price,
      sizeDescription: product.size_description,
      bigPackages: product.big_packages.map(bigPackage => ({
        packageNumber: bigPackage.package_number,
        totalQuantity: bigPackage.total_quantity,
        totalSizeAmount: bigPackage.total_size_amount,
        sizeDescription: bigPackage.size_description,
        isOpen: bigPackage.is_open,
        smallPackages: bigPackage.small_packages.map(smallPackage => ({
          packageId: smallPackage.package_id,
          quantity: smallPackage.quantity,
          sizeAmount: smallPackage.size_amount,
          sizeDescription: smallPackage.size_description,
          isOpen: smallPackage.is_open
        }))
      }))
    }))
  };

  return {
    epoch: response.epoch,
    productList
  };
}

/**
 * ? Transform Request Functions
 */
export function transformToInvoiceCreateHttpRequest(
  request: InvoiceCreateModelRequest
): InvoiceCreateHttpRequest {
  return {
    customer_id: request.customerId,
    site_id: request.siteId,
    due_date: request.dueDate,
    notes: request.notes,
    reference: request.reference, // Add reference field
    line_items: request.lineItems.map(item => ({
      stock_id: item.stockId,
      product_id: item.productId,
      big_package_number: item.bigPackageNumber,
      small_package_id: item.smallPackageId,
      unit_amount: item.unitAmount,
      unit_price: item.unitPrice,
      is_entire_big_package: item.isEntireBigPackage // Add new field
    })),
    created_by: request.createdBy
  };
}

// Updated invoice.model.ts - Add line items to update request

export interface InvoiceUpdateModelRequest {
  invoiceNumber: string;
  customerId: string;
  siteId: string;
  dueDate: string;
  notes?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  lineItems: {  // Required according to API documentation
    stockId: string;
    productId: string;
    bigPackageNumber: string;
    smallPackageId: string;
    unitAmount: number;
    unitPrice: number;
  }[];
  changedBy: string;
}


export function transformToInvoiceUpdateHttpRequest(
  request: InvoiceUpdateModelRequest
): InvoiceUpdateHttpRequest {
  return {
    invoice_number: request.invoiceNumber,
    customer_id: request.customerId,
    site_id: request.siteId,
    due_date: request.dueDate,
    notes: request.notes,
    status: request.status,
    line_items: request.lineItems.map(item => ({
      stock_id: item.stockId,
      product_id: item.productId,
      big_package_number: item.bigPackageNumber,
      small_package_id: item.smallPackageId,
      unit_amount: item.unitAmount,
      unit_price: item.unitPrice
    })),
    changed_by: request.changedBy
  };
}

export function transformToMultipleInvoicePdfHttpRequest(
  request: MultipleInvoicePdfModelRequest
): MultipleInvoicePdfRequest {
  return {
    invoice_numbers: request.invoiceNumbers
  };
}

