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


}
