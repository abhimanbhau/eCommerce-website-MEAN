import { Component, OnInit } from "@angular/core";

import { Router } from "@angular/router";
import { RestApiService } from "../rest-api.service";
import { DataService } from "../data.service";

import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-edit-product",
  templateUrl: "./edit-product.component.html",
  styleUrls: ["./edit-product.component.scss"],
})
export class EditProductComponent implements OnInit {
  product = {
    idP: "",
    title: "",
    price: 0,
    quantity: 0,
    categoryId: "",
    description: "",
    product_picture: null,
  };

  categories: any;
  btnDisabled = false;
  constructor(
    private data: DataService,
    private rest: RestApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    let id = "";
    this.activatedRoute.params.subscribe((params) => {
      id = params["id"];
      this.product.idP = id;

      console.log(`${id}`);
    });

    this.rest
      .get(`http://localhost:3030/api/product/${id}`)
      .then((data) => {
        data["success"]
          ? (this.product = data["product"])
          : this.router.navigate(["/"]);
      })
      .catch((error) => this.data.error(error["message"]));

    try {
      const data = await this.rest.get("http://localhost:3030/api/categories");
      data["success"]
        ? (this.categories = data["categories"])
        : this.data.error(data["message"]);
    } catch (error) {
      this.data.error(error["message"]);
    }
  }

  validate(product) {
    if (product.title) {
      if (product.price) {
        if (product.categoryId) {
          if (product.description) {
            if (product.product_picture) {
              return true;
            } else {
              this.data.error("Please select product image.");
            }
          } else {
            this.data.error("Please enter description.");
          }
        } else {
          this.data.error("Please select category.");
        }
      } else {
        this.data.error("Please enter a price.");
      }
    } else {
      this.data.error("Please enter a title.");
    }
  }

  fileChange(event: any) {
    this.product.product_picture = event.target.files[0];
  }

  async post() {
    console.log("posting update");
    this.btnDisabled = true;
    try {
      if (this.validate(this.product)) {
        const form = new FormData();
        for (const key in this.product) {
          if (this.product.hasOwnProperty(key)) {
            if (key === "product_picture") {
              form.append(
                "product_picture",
                this.product.product_picture,
                this.product.product_picture.name
              );
            } else {
              form.append(key, this.product[key]);
            }
          }
        }
        console.log(this.product);
        const data = await this.rest.post(
          "http://localhost:3030/api/seller/editproducts",
          form
        );
        console.log(data);
        data["success"]
          ? this.router
              .navigate(["/profile/myproducts"])
              .then(() => this.data.success(data["message"]))
              .catch((error) => this.data.error(error))
          : this.data.error(data["message"]);
      }
    } catch (error) {
      this.data.error(error["message"]);
    }
    this.btnDisabled = false;
  }
}
