import { Category } from 'app/models/category.model';
import { CategoriesService } from 'app/services/categories.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit {

  titleText: string;
  loading = false;
  submitButtonText: string;
  public mode = 'new';
  categoryId: string;
  category: Category;

  constructor(
    private router: Router,
    private categoriesService: CategoriesService,
    private route: ActivatedRoute
  ) {

    if (this.router.url.match(/\/edit\/[0-9]+$/)) {
      this.setMode('edit');
    } else {
      this.setMode('new');
    }
  }

  ngOnInit(): void {
    if (this.mode === 'edit') {
      this.loadCategory();
    }
  }

  setMode(value: string): void {
    this.mode = value;
    if (this.mode === 'edit') {
      this.titleText = 'Edit category';
      this.submitButtonText = 'Update';
      this.categoryId = this.route.snapshot.params['id'];
    } else if (this.mode === 'new') {
      this.titleText = 'New category';
      this.submitButtonText = 'Create';
    }
  }

  loadCategory(): void {
    this.loading = true;
    this.categoriesService.getById(this.categoryId).then(
      data => {
        this.category = data;
        this.loading = false;
      }
    ).catch( error => alert(error));
  }

  onCancel(): void {
    this.router.navigate(['/private/fields/categories']);
  }

  onSubmit(formValues): void {
    this.loading = true;
    if (this.mode === 'new') {
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
    } else {
      this.categoriesService.updateCategory(this.category).then(
        data => {
          alert('Category updated successfully!');
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


}
