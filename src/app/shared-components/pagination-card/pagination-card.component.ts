// pagination-card.component.ts
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-pagination-card',
  templateUrl: './pagination-card.component.html',
  styleUrls: ['./pagination-card.component.scss']
})
export class PaginationCardComponent {
  @Input() data: any[] = [];
  @Input() pageSize: number = 10;
  @Input() cardClass: string = '';
  @ContentChild('contentTemplate', { static: true }) contentTemplate!: TemplateRef<any>;

  currentPage: number = 1;

  get maxPage(): number {
    return Math.ceil((this.data?.length || 0) / this.pageSize);
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
    return (this.data || []).slice(startIndex, startIndex + this.pageSize);
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
