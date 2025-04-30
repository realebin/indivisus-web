/* eslint-disable @typescript-eslint/no-extraneous-class */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { ModalComponent } from './modal/modal.component';
import { InputBuilderComponent } from './input-builder/input-builder.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ExpandableCardComponent } from './expandable-card/expandable-card.component';
import { PaginationCardComponent } from './pagination-card/pagination-card.component';
import { RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { EmptyDataComponent } from './empty-data/empty-data.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';
import { AgGridModule } from '@node_modules/ag-grid-angular';
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';
import { MultiSelectDropdownComponent } from './multi-select-dropdown/multi-select-dropdown.component';


@NgModule({
  declarations: [
    LoaderComponent,
    ModalComponent,
    InputBuilderComponent,
    ExpandableCardComponent,
    PaginationCardComponent,
    BreadcrumbsComponent,
    EmptyDataComponent,
    FilterPanelComponent,
    ResponsiveDataTableComponent,
    ActionButtonsComponent,
    MultiSelectDropdownComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AgGridModule],
  exports: [
    LoaderComponent,
    ModalComponent,
    InputBuilderComponent,
    ExpandableCardComponent,
    PaginationCardComponent,
    BreadcrumbsComponent,
    EmptyDataComponent,
    FilterPanelComponent,
    ResponsiveDataTableComponent,
    ActionButtonsComponent,
    MultiSelectDropdownComponent
  ],
})
export class SharedComponentsModule { }
