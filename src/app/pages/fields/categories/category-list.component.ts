import { Category } from './../../../models/category.model';
import { CategoriesService } from 'app/services/categories.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  private categories: Category[];

  constructor(
    private categoriesService: CategoriesService,
    private router: Router
  ) {
    this.categories = [];
  }

  ngOnInit(): void {
    this.categoriesService.getAll().then((data) => {
      this.categories = data;
    });
  }

  triggerNewCategory(): void{
    this.router.navigate(['private/fields/categories/new']);
  }

  onEdit(row): void{

  }

  private onDelete(category: Category): void {
    if (confirm(`Are you sure to delete the category: ${category.name}?`) ) {
      this.categoriesService.deleteCategory(category)
      .then((data) => {
        this.ngOnInit();
        alert(data.json().messages[0].title);
      })
      .catch((e) => alert('Unable to delete the category: ${category.name} '));
    }
  }


}
