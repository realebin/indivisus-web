/**
 * ? Response Section
 */
export interface InvoiceInquiryHttpResponse {
  epoch: number;
  data: {
    invoice_number: string;
    customer_id: string;
    customer_name: string;
    site_id: string;
    site_name: string;
    due_date: string;
    total_price: number;
    total_quantity: number;
    notes: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    line_items: {
      line_item_id: string;
      stock_id: string;
      product_id: string;
      product_name: string;
      type: string;
      big_package_number: string;
      small_package_id: string;
      unit_amount: number;
      unit_price: number;
      total_price: number;
      size_description: string;
      package_status: string;
    }[];
    created_by: string;
    changed_by: string;
    created_at: string;
    changed_on: string;
  }[];
}

export interface InvoiceDetailHttpResponse {
  epoch: number;
  data: {
    invoice_number: string;
    customer_id: string;
    customer_name: string;
    site_id: string;
    site_name: string;
    due_date: string;
    total_price: number;
    total_quantity: number;
    notes: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    line_items: {
      line_item_id: string;
      stock_id: string;
      product_id: string;
      product_name: string;
      type: string;
      big_package_number: string;
      small_package_id: string;
      unit_amount: number;
      unit_price: number;
      total_price: number;
      size_description: string;
      package_status: string;
    }[];
    created_by: string;
    changed_by: string;
    created_at: string;
    changed_on: string;
  };
}

export interface InvoiceByCustomerHttpResponse {
  epoch: number;
  data: {
    invoice_number: string;
    customer_id: string;
    customer_name: string;
    site_id: string;
    site_name: string;
    due_date: string;
    total_price: number;
    total_quantity: number;
    notes: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    line_items: {
      line_item_id: string;
      stock_id: string;
      product_id: string;
      product_name: string;
      type: string;
      big_package_number: string;
      small_package_id: string;
      unit_amount: number;
      unit_price: number;
      total_price: number;
      size_description: string;
      package_status: string;
    }[];
    created_by: string;
    changed_by: string;
    created_at: string;
    changed_on: string;
  }[];
}

export interface InvoiceBySiteHttpResponse {
  epoch: number;
  data: {
    invoice_number: string;
    customer_id: string;
    customer_name: string;
    site_id: string;
    site_name: string;
    due_date: string;
    total_price: number;
    total_quantity: number;
    notes: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    line_items: {
      line_item_id: string;
      stock_id: string;
      product_id: string;
      product_name: string;
      type: string;
      big_package_number: string;
      small_package_id: string;
      unit_amount: number;
      unit_price: number;
      total_price: number;
      size_description: string;
      package_status: string;
    }[];
    created_by: string;
    changed_by: string;
    created_at: string;
    changed_on: string;
  }[];
}

export interface InvoiceByDateRangeHttpResponse {
  epoch: number;
  data: {
    invoice_number: string;
    customer_id: string;
    customer_name: string;
    site_id: string;
    site_name: string;
    due_date: string;
    total_price: number;
    total_quantity: number;
    notes: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    line_items?: {
      line_item_id: string;
      stock_id: string;
      product_id: string;
      product_name: string;
      type: string;
      big_package_number: string;
      small_package_id: string;
      unit_amount: number;
      unit_price: number;
      total_price: number;
      size_description: string;
      package_status: string;
    }[];
    created_by: string;
    changed_by: string;
    created_at: string;
    changed_on: string;
  }[];
}

export interface ProductListForInvoiceHttpResponse {
  epoch: number;
  data: {
    site_id: string;
    site_name: string;
    products: {
      stock_id: string;
      product_id: string;
      product_name: string;
      type: string;
      price: number;
      size_description: string;
      big_packages: {
        package_number: string;
        total_quantity: number;
        total_size_amount: number;
        size_description: string;
        is_open: boolean;
        small_packages: {
          package_id: string;
          quantity: number;
          size_amount: number;
          size_description: string;
          is_open: boolean;
        }[];
      }[];
    }[];
  };
}

/**
 * ? Request Section
 */
export interface InvoiceCreateHttpRequest {
  customer_id: string;
  site_id: string;
  due_date: string;
  notes?: string;
  line_items: {
    stock_id: string;
    product_id: string;
    big_package_number: string;
    small_package_id: string;
    unit_amount: number;
    unit_price: number;
  }[];
  created_by: string;
}

// Updated invoice.schema.ts - Include line items in update schema

export interface InvoiceUpdateHttpRequest {
  invoice_number: string;
  customer_id: string;
  site_id: string;
  due_date: string;
  notes?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  line_items: {  // Required in update request
    stock_id: string;
    product_id: string;
    big_package_number: string;
    small_package_id: string;
    unit_amount: number;
    unit_price: number;
  }[];
  changed_by: string;
}

export interface MultipleInvoicePdfRequest {
  invoice_numbers: string[];
}
