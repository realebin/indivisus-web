// dynamic-modal.service.ts
import { Injectable, createComponent, ApplicationRef, EnvironmentInjector, Type, ComponentRef } from '@angular/core';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class DynamicModalService {
  private modalComponentRef: ComponentRef<ModalComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  open(contentComponentType: Type<any>, config: any): ComponentRef<ModalComponent> {
    // Clean up any existing modal
    this.closeAll();

    // Create a container for the modal
    const modalContainer = document.createElement('div');
    modalContainer.id = 'dynamic-modal-container';
    document.body.appendChild(modalContainer);

    // Create the modal component using modern API
    this.modalComponentRef = createComponent(ModalComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: modalContainer
    });

    // Set modal properties
    const modalInstance = this.modalComponentRef.instance;
    modalInstance.title = config.title || 'Modal';
    modalInstance.confirmButtonText = config.confirmButtonText || 'Confirm';
    modalInstance.isFormValid = config.isFormValid !== undefined ? config.isFormValid : true;

    // Create the content component
    const contentComponentRef = createComponent(contentComponentType, {
      environmentInjector: this.environmentInjector
    });

    // Apply input properties to content component
    const contentInstance = contentComponentRef.instance;
    if (config.inputs) {
      Object.keys(config.inputs).forEach(key => {
        contentInstance[key] = config.inputs[key];
      });
    }

    // Attach the component to the modal
    modalInstance.content = contentComponentRef;

    // Listen for events
    modalInstance.confirm.subscribe((data) => {
      if (config.onConfirm) {
        config.onConfirm(contentInstance);
      }
    });

    // Attach to application
    this.appRef.attachView(this.modalComponentRef.hostView);

    // Force change detection
    this.modalComponentRef.changeDetectorRef.detectChanges();

    // Show the modal using Bootstrap
    const modalElement = modalContainer.querySelector('.modal');
    if (modalElement) {
      // For bootstrap 5
      const bsModal = new (window as any).bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true
      });
      bsModal.show();

      // Store the bootstrap modal instance for later cleanup
      (this.modalComponentRef as any).__bsModal = bsModal;
    }

    return this.modalComponentRef;
  }

  closeAll(): void {
    if (this.modalComponentRef) {
      // Hide the bootstrap modal if it exists
      if ((this.modalComponentRef as any).__bsModal) {
        (this.modalComponentRef as any).__bsModal.hide();
      }

      // Destroy the component
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
    }

    // Clean up any modal backdrop
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');

    // Remove any existing container
    const existingContainer = document.getElementById('dynamic-modal-container');
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }
  }
}
