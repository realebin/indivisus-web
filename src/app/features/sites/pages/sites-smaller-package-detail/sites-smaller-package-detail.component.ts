import { Component } from '@angular/core';
import { ActivatedRoute } from '@node_modules/@angular/router';

@Component({
  selector: 'app-sites-smaller-package-detail',
  templateUrl: './sites-smaller-package-detail.component.html',
  styleUrl: './sites-smaller-package-detail.component.scss'
})
export class SitesSmallerPackageDetailComponent {

  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('productId');
      console.log('SitesSmallerPackageDetailComponent initialized with productId:', productId);
      // Add your logic to fetch product details using productId
    });
  }
}
