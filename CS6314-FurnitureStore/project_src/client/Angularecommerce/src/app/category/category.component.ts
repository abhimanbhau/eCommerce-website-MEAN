//Category component.ts - Type Script file that contains code to render Category  to elearning application

//including the required files and services
import { Component, OnInit } from "@angular/core";

import { ActivatedRoute } from "@angular/router";
import { RestApiService } from "../rest-api.service";
import { DataService } from "../data.service";

//component specifc details
@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"],
})

//exporting the category component
export class CategoryComponent implements OnInit {
  categoryId: any;
  category: any;
  page = 1;
  filteredItems: any;

  constructor(
    private data: DataService,
    private activatedRoute: ActivatedRoute,
    private rest: RestApiService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((res) => {
      this.categoryId = res["id"];
      this.getProducts();
    });
  }

  get lower() {
    return 2 * (this.page - 1) + 1;
  }

  get upper() {
    return Math.min(2 * this.page, this.category.totalProducts);
  }

  assignCopy() {
    this.filteredItems = Object.assign([], this.category.products);
  }
  filterItem(value) {
    if (!value) {
      this.assignCopy();
    } // when nothing has typed
    this.filteredItems = Object.assign([], this.category.products).filter(
      (item) => item.title.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
  }

  async getProducts(event?: any) {
    if (event) {
      this.category = null;
    }
    try {
      const data = await this.rest.get(
        `http://localhost:3030/api/categories/${this.categoryId}?page=${
          this.page - 1
        }`
      );
      data["success"]
        ? (this.category = data)
        : this.data.error(data["message"]);
      console.log(this.category.products);
      this.assignCopy();
      console.log(this.filteredItems);
    } catch (error) {
      this.data.error(error["message"]);
    }
  }
}
