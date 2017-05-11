import { CategoriesService } from 'app/services/categories.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent {

  titleText: String = 'New Category';
  loading = false;

  constructor(
    private router: Router,
    private categoriesService: CategoriesService
  ) {

  }

  onCancel(): void {
    this.router.navigate(['/private/fields/categories']);
  }

  onSubmit(formValues):void {
    this.loading = true;
    this.categoriesService.crateCategory(formValues).then(
        data => {
          alert('Category created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/categories']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }


}
