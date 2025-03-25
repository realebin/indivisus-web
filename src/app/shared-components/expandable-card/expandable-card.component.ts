import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { ExpandableCardData } from '@models/_component-base.model';

export interface ColumnConfig {
  field: string;
  label: string;
  isHeader?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-expandable-card',
  templateUrl: './expandable-card.component.html',
  styleUrls: ['./expandable-card.component.scss']
})
export class ExpandableCardComponent {
  @Input() data: any[] = [];
  @Input() columnConfig: ColumnConfig[] = [];
  @Input() cardTitle?: string;
  @Input() infoLink?: string;
  @Input() footerText?: string;
  @ContentChild('footerTemplate') footerTemplate!: TemplateRef<any>;

  // Pagination properties
  pageSize: number = 10;
  currentPage: number = 1;

  toggleExpand(item: ExpandableCardData): void {
    item.isExpanded = !item.isExpanded;
  }

  getHeaderIcon(): string | undefined {
    return this.columnConfig.find(col => col.icon)?.icon;
  }

  getHeaderValue(item: any, position: 'left' | 'right'): string {
    const headerColumns = this.columnConfig.filter(col => col.isHeader);
    const column = position === 'left' ? headerColumns[0] : headerColumns[1];
    return column ? item[column.field] : '';
  }

  getDetails(): ColumnConfig[] {
    return this.columnConfig;
  }

  // Pagination methods
  get maxPage(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  get displayedPages(): number[] {
    const range = 5;
    const halfRange = Math.floor(range / 2);
    let start = Math.max(this.currentPage - halfRange, 1);
    let end = Math.min(this.currentPage + halfRange, this.maxPage);

    if (end - start + 1 < range) {
      if (start === 1) {
        end = Math.min(start + range - 1, this.maxPage);
      } else {
        start = Math.max(end - range + 1, 1);
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
  }

  get paginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.data.slice(startIndex, startIndex + this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.maxPage) this.currentPage++;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.maxPage) this.currentPage = page;
  }
}
