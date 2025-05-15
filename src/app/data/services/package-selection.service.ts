import { Injectable } from '@angular/core';
import { LineItemData } from '@models/line-item-extensions';

@Injectable({
  providedIn: 'root'
})
export class PackageSelectionService {

  constructor() { }

  /**
   * Check if a big package is already selected in any other line item
   */
  isBigPackageSelected(lineItems: LineItemData[], packageNumber: string, excludeIndex: number): boolean {
    return lineItems.some((item, index) =>
      index !== excludeIndex && item.bigPackageNumber === packageNumber
    );
  }

  /**
   * Check if a small package is already selected in any other line item
   */
  isSmallPackageSelected(lineItems: LineItemData[], packageId: string, excludeIndex: number): boolean {
    return lineItems.some((item, index) => {
      if (index === excludeIndex) return false;

      // Check both single selection and multi-selection
      if (item.smallPackageId === packageId) return true;

      // Check in selected small packages array
      if (item._selectedSmallPackages && item._selectedSmallPackages.includes(packageId)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Find all duplicate packages across line items
   */
  findDuplicatePackages(lineItems: LineItemData[]): {
    duplicateBigPackages: string[];
    duplicateSmallPackages: string[];
    allDuplicates: string[];
  } {
    const duplicateBigPackages: string[] = [];
    const duplicateSmallPackages: string[] = [];
    const usedBigPackages = new Set<string>();
    const usedSmallPackages = new Set<string>();

    for (const item of lineItems) {
      // Check big packages
      if (item.bigPackageNumber) {
        if (usedBigPackages.has(item.bigPackageNumber)) {
          if (!duplicateBigPackages.includes(item.bigPackageNumber)) {
            duplicateBigPackages.push(item.bigPackageNumber);
          }
        } else {
          usedBigPackages.add(item.bigPackageNumber);
        }
      }

      // Check small packages
      const smallPackages = item._selectedSmallPackages ||
        (item.smallPackageId ? [item.smallPackageId] : []);

      for (const packageId of smallPackages) {
        if (usedSmallPackages.has(packageId)) {
          if (!duplicateSmallPackages.includes(packageId)) {
            duplicateSmallPackages.push(packageId);
          }
        } else {
          usedSmallPackages.add(packageId);
        }
      }
    }

    const allDuplicates = [
      ...duplicateBigPackages.map(pkg => `Big Package: ${pkg}`),
      ...duplicateSmallPackages.map(pkg => `Small Package: ${pkg}`)
    ];

    return {
      duplicateBigPackages,
      duplicateSmallPackages,
      allDuplicates
    };
  }

  /**
   * Validate line items for duplicate packages
   */
  validateLineItems(lineItems: LineItemData[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for empty line items
    if (lineItems.length === 0) {
      errors.push('At least one line item is required');
    }

    // Check for incomplete line items
    const incompleteItems = lineItems.filter(item =>
      !item.productId || !item.bigPackageNumber || !item.smallPackageId || item.unitAmount <= 0
    );

    if (incompleteItems.length > 0) {
      errors.push(`${incompleteItems.length} line item(s) are incomplete`);
    }

    // Check for duplicate packages
    const { allDuplicates } = this.findDuplicatePackages(lineItems);
    if (allDuplicates.length > 0) {
      errors.push(`Duplicate packages detected: ${allDuplicates.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available packages for a specific line item
   */
  getAvailableBigPackages(allPackages: any[], lineItems: LineItemData[], currentIndex: number): any[] {
    return allPackages.map(pkg => ({
      ...pkg,
      isAlreadySelected: this.isBigPackageSelected(lineItems, pkg.packageNumber, currentIndex),
      isDisabled: this.isBigPackageSelected(lineItems, pkg.packageNumber, currentIndex)
    }));
  }

  /**
   * Get available small packages for a specific line item
   */
  getAvailableSmallPackages(
    bigPackage: any,
    lineItems: LineItemData[],
    currentIndex: number,
    selectedPackages: string[] = []
  ): any[] {
    if (!bigPackage?.smallPackages) return [];

    return bigPackage.smallPackages
      .filter((sp: any) => sp.sizeAmount > 0 || sp.quantity > 0)
      .map((sp: any) => {
        const isAlreadySelected = this.isSmallPackageSelected(lineItems, sp.packageId, currentIndex);

        return {
          ...sp,
          isAlreadySelected,
          isDisabled: isAlreadySelected,
          isCurrentlySelected: selectedPackages.includes(sp.packageId)
        };
      });
  }

  /**
   * Clean up line item caches after removal
   */
  reindexCaches<T>(caches: { [index: number]: T }, removedIndex: number): { [index: number]: T } {
    const newCaches: { [index: number]: T } = {};

    Object.keys(caches).forEach(key => {
      const oldIndex = parseInt(key);
      if (oldIndex > removedIndex) {
        newCaches[oldIndex - 1] = caches[oldIndex];
      } else if (oldIndex < removedIndex) {
        newCaches[oldIndex] = caches[oldIndex];
      }
      // Skip the removed index
  });

    return newCaches;
  }

  /**
   * Check if a line item has valid selections
   */
  isLineItemValid(lineItem: LineItemData): boolean {
    return !!(
      lineItem.productId &&
      lineItem.bigPackageNumber &&
      lineItem.smallPackageId &&
      lineItem.unitAmount > 0 &&
      lineItem.unitPrice > 0
    );
  }

  /**
   * Get summary of selected packages across all line items
   */
  getSelectionSummary(lineItems: LineItemData[]): {
    totalItems: number;
    validItems: number;
    totalBigPackages: number;
    totalSmallPackages: number;
    uniqueBigPackages: Set<string>;
    uniqueSmallPackages: Set<string>;
  } {
    const uniqueBigPackages = new Set<string>();
    const uniqueSmallPackages = new Set<string>();
    let totalBigPackages = 0;
    let totalSmallPackages = 0;
    let validItems = 0;

    lineItems.forEach(item => {
      if (this.isLineItemValid(item)) {
        validItems++;
      }

      if (item.bigPackageNumber) {
        uniqueBigPackages.add(item.bigPackageNumber);
        totalBigPackages++;
      }

      const smallPackages = item._selectedSmallPackages ||
        (item.smallPackageId ? [item.smallPackageId] : []);

      smallPackages.forEach(packageId => {
        uniqueSmallPackages.add(packageId);
        totalSmallPackages++;
      });
    });

    return {
      totalItems: lineItems.length,
      validItems,
      totalBigPackages,
      totalSmallPackages,
      uniqueBigPackages,
      uniqueSmallPackages
    };
  }
}
