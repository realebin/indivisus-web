/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import {
  UserManagementDeleteModelRequest,
} from '@models/user-management.model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { UserManagementService } from '@services/user-management.service';
import { ColumnConfig } from 'src/app/shared-components/expandable-card/expandable-card.component';
import { UserManagementDictionaryEnum } from '@cores/enums/custom-variable.enum';
import type { ColDef, GridApi } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { SortOption } from 'src/app/shared-components';

@Component({
  selector: 'app-user-management-table-inquiry',
  templateUrl: './user-management-table-inquiry.component.html',
  styleUrl: './user-management-table-inquiry.component.scss',
})
export class UserManagementTableInquiryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() type: UserManagementDictionaryEnum;
  @Input() data: any;
  @Output() editUserEvent = new EventEmitter<any>();
  @Output() deleteUserEvent = new EventEmitter<any>();

  private destroy$ = new Subject<void>();
  columnDefs: ColDef[] = [];
  sortOptions: SortOption[] = [];

  // Card configurations for each type
  cardConfigs: { [key: string]: ColumnConfig[] } = {
    APPUSER: [
      { field: 'username', label: 'Username' },
      { field: 'fullName', label: 'Name', isHeader: true, icon: 'bi-person' },
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'role', label: 'Role', isHeader: true },
      { field: 'site', label: 'Site' },
    ],
    CUSTOMER: [
      { field: 'fullName', label: 'Name', isHeader: true, icon: 'bi-people' },
      { field: 'city', label: 'City', isHeader: true },
      { field: 'phoneNumber', label: 'Phone' },
      { field: 'address', label: 'Address' },
      { field: 'postalCode', label: 'Postal Code' },
    ],
    SUPPLIER: [
      { field: 'name', label: 'Name', isHeader: true, icon: 'bi-building' },
      { field: 'country', label: 'Country', isHeader: true },
      { field: 'phoneNumber', label: 'Phone' },
      { field: 'address', label: 'Address' },
      { field: 'city', label: 'City' },
      { field: 'postalCode', label: 'Postal Code' },
      { field: 'description', label: 'Notes' },
    ]
  };

  constructor(
    private userManagementService: UserManagementService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.setupColumnDefs();
    this.setupSortOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type'] || changes['data']) {
      this.setupColumnDefs();
      this.setupSortOptions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSortOptions(): void {
    switch (this.type) {
      case UserManagementDictionaryEnum.AppUser:
        this.sortOptions = [
          { field: 'username', label: 'Username' },
          { field: 'firstName', label: 'First Name' },
          { field: 'lastName', label: 'Last Name' },
          { field: 'role', label: 'Role' },
          { field: 'site', label: 'Site' }
        ];
        break;
      case UserManagementDictionaryEnum.Customer:
        this.sortOptions = [
          { field: 'firstName', label: 'First Name' },
          { field: 'lastName', label: 'Last Name' },
          { field: 'city', label: 'City' },
          { field: 'phoneNumber', label: 'Phone' }
        ];
        break;
      case UserManagementDictionaryEnum.Supplier:
        this.sortOptions = [
          { field: 'name', label: 'Name' },
          { field: 'city', label: 'City' },
          { field: 'country', label: 'Country' },
          { field: 'phoneNumber', label: 'Phone' }
        ];
        break;
      default:
        this.sortOptions = [];
        break;
    }
  }

  setupColumnDefs(): void {
    switch (this.type) {
      case UserManagementDictionaryEnum.AppUser:
        this.setAppUserColumnDefs();
        break;
      case UserManagementDictionaryEnum.Customer:
        this.setCustomerColumnDefs();
        break;
      case UserManagementDictionaryEnum.Supplier:
        this.setSupplierColumnDefs();
        break;
      default:
        break;
    }
  }

  setAppUserColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: 'No',
        valueGetter: (params) => {
          return params.node?.rowIndex !== null ? params.node!.rowIndex + 1 : '';
        },
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        sortable: false,
        filter: false
      },
      { field: 'role', headerName: 'Role' },
      { field: 'firstName', headerName: 'First Name' },
      { field: 'lastName', headerName: 'Last Name' },
      { field: 'username', headerName: 'Username' },
      { field: 'site', headerName: 'Site' },
      {
        headerName: 'Actions',
        cellRenderer: this.actionsRenderer.bind(this),
        cellRendererParams: {
          edit: this.editUser.bind(this),
          delete: this.deleteUser.bind(this)
        },
        sortable: false,
        filter: false,
        width: 110,
        minWidth: 110,
        flex: 0.1
      }
    ];
  }

  setCustomerColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: 'No',
        valueGetter: (params) => {
          return params.node?.rowIndex !== null ? params.node!.rowIndex + 1 : '';
        },
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        sortable: false,
        filter: false
      },
      { field: 'firstName', headerName: 'First Name' },
      { field: 'lastName', headerName: 'Last Name' },
      { field: 'address', headerName: 'Address' },
      { field: 'city', headerName: 'City' },
      { field: 'postalCode', headerName: 'Postal Code' },
      { field: 'phoneNumber', headerName: 'Tel' },
      { field: 'notes', headerName: 'Notes' },
      {
        headerName: 'Actions',
        cellRenderer: this.actionsRenderer.bind(this),
        cellRendererParams: {
          edit: this.editUser.bind(this),
          delete: this.deleteUser.bind(this)
        },
        sortable: false,
        filter: false,
        width: 110,
        minWidth: 110,
        flex: 0.1
      }
    ];
  }

  setSupplierColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: 'No',
        valueGetter: (params) => {
          return params.node?.rowIndex !== null ? params.node!.rowIndex + 1 : '';
        },
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        sortable: false,
        filter: false
      },
      { field: 'name', headerName: 'Name' },
      { field: 'address', headerName: 'Address' },
      { field: 'city', headerName: 'City' },
      { field: 'phoneNumber', headerName: 'Tel' },
      { field: 'country', headerName: 'Country' },
      { field: 'description', headerName: 'Notes' },
      {
        headerName: 'Actions',
        cellRenderer: this.actionsRenderer.bind(this),
        cellRendererParams: {
          edit: this.editUser.bind(this),
          delete: this.deleteUser.bind(this)
        },
        sortable: false,
        filter: false,
        width: 110,
        minWidth: 110,
        flex: 0.1
      }
    ];
  }

  actionsRenderer(params: any) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';

    const editButton = document.createElement('button');
    editButton.classList.add('btn', 'btn-sm', 'btn-primary', 'me-2');
    editButton.innerHTML = '<i class="bi bi-pencil"></i>';
    editButton.addEventListener('click', () => params.edit(params.data));
    editButton.style.padding = '0.25rem 0.5rem';

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteButton.addEventListener('click', () => params.delete(params.data));
    deleteButton.style.padding = '0.25rem 0.5rem';

    container.appendChild(editButton);
    container.appendChild(deleteButton);

    return container;
  }

  editUser(user: any): void {
    this.editUserEvent.emit(user);
  }

  deleteUser(user: any): void {
    let name;

    if (
      this.type === UserManagementDictionaryEnum.AppUser ||
      this.type === UserManagementDictionaryEnum.Customer
    ) {
      name = user.firstName + ' ' + user.lastName;
    } else {
      name = user.name;
    }

    const req: UserManagementDeleteModelRequest = {
      id: user.id,
      type: this.type,
    };

    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.userManagementService.deleteUser(req).subscribe({
        next: (data) => {
          alert(data);
          this.deleteUserEvent.emit();
        },
        error: (error) => {
          alert(error);
        },
      });
    }
  }

  // Handle grid-related events
  // onGridReady(gridApi: GridApi): void {
  //   // Additional grid-ready handling if needed
  // }

  // Helper to get the page title based on type
  getPageTitle(): string {
    switch (this.type) {
      case UserManagementDictionaryEnum.AppUser:
        return 'User Management';
      case UserManagementDictionaryEnum.Customer:
        return 'Customer Management';
      case UserManagementDictionaryEnum.Supplier:
        return 'Supplier Management';
      default:
        return 'Data Management';
    }
  }
}
