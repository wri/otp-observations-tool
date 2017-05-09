import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent {

  private titleText: String = 'New Category';

  constructor(
    private router: Router
  ) {

  }

  onCancel(): void{
    this.router.navigate(['/private/fields/categories']);
  }

  onSubmit(formValues):void {
    console.log('submit!', formValues);
  }


}
