// src/app/data/models/line-item-extensions.ts

/**
 * Interface for line items with the exact structure needed for invoice forms
 * This matches your original LineItemData interface used in InvoiceFormComponent
 */
export interface LineItemData {
  stockId: string;
  productId: string;
  bigPackageNumber: string;
  smallPackageId: string;
  unitAmount: number;
  unitPrice: number;
  productName?: string;
  type?: string;
  sizeDescription?: string;
  totalPrice?: number;

  // UI-only properties for multi-select support
  _selectedSmallPackages?: string[];
  _bigPackageInfo?: any;
}

/**
 * Expands multi-selected line items into individual API-compatible line items
 * @param lineItems Line items that may contain _selectedSmallPackages
 * @returns Array of expanded line items ready for API submission
 */
export function expandMultiSelectLineItems(lineItems: LineItemData[]): LineItemData[] {
  return lineItems.flatMap(item => {
    // Check if item has multiple selected small packages
    if (item._selectedSmallPackages &&
        Array.isArray(item._selectedSmallPackages) &&
        item._selectedSmallPackages.length > 0) {

      // Create a separate line item for each selected small package
      return item._selectedSmallPackages.map((packageId: string) => {
        // Find the small package details
        const smallPackage = findSmallPackageById(item._bigPackageInfo, packageId);
        const sizeAmount = smallPackage ? smallPackage.sizeAmount : 0;

        // Create a new line item with this small package
        return {
          stockId: item.stockId,
          productId: item.productId,
          bigPackageNumber: item.bigPackageNumber,
          smallPackageId: packageId, // Each gets a unique smallPackageId
          // Safely calculate the amount - handle the case where _selectedSmallPackages might be undefined
          unitAmount: sizeAmount || (item._selectedSmallPackages && item._selectedSmallPackages.length > 0 ?
                                     item.unitAmount / item._selectedSmallPackages.length :
                                     item.unitAmount),
          unitPrice: item.unitPrice,
          productName: item.productName,
          type: item.type,
          sizeDescription: smallPackage ? smallPackage.sizeDescription : item.sizeDescription
        };
      });
    }

    // If no multiple selection, return the original item
    return [item];
  });
}

/**
 * Helper function to find a small package within a big package by its ID
 */
function findSmallPackageById(bigPackage: any, packageId: string): any {
  if (!bigPackage || !bigPackage.smallPackages) return null;

  return bigPackage.smallPackages.find((sp: any) => sp.packageId === packageId);
}
