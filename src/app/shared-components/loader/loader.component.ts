import { Component, Input } from '@angular/core';
enum LoaderType {
  Absolute = 'loading-overlay',
  Relative = 'loading-relative',
}
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  @Input() type: LoaderType.Absolute | LoaderType.Relative | string;
}
