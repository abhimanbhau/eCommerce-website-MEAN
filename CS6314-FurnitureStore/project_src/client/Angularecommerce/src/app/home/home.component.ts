//Homecomponent.ts - Type Script file that contains code to render home page  to elearning application

//including the required files and services
import { Component, OnInit } from "@angular/core";
import { DataService } from "../data.service";
import { ActivatedRoute } from "@angular/router";
import { RestApiService } from "../rest-api.service";

//component specific details
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})

//Exporting the HomeComponent
export class HomeComponent implements OnInit {
  products: any;
  page = 1;
  lengthProducts = 0;

  constructor(
    private data: DataService,
    private rest: RestApiService,
    private activatedRoute: ActivatedRoute
  ) {}
  async getProducts(event?: any) {
    console.log(this.page);
    console.log(event);
    try {
      const data = await this.rest.get(
        `http://localhost:3030/api/products?page=${this.page - 1}`
      );
      console.log(data);
      this.lengthProducts = data["totalProducts"];
      data["success"]
        ? (this.products = data["products"])
        : this.data.error(data["message"]);

      let i = 0;
      this.products.forEach((element) => {
        i++;
      });
      this.lengthProducts = i;
    } catch (error) {
      this.data.error(error["message"]);
    }
  }

  async ngOnInit() {
    // try {
    //   const data = await this.rest.get("http://localhost:3030/api/products");
    //   data["success"]
    //     ? (this.products = data["products"])
    //     : this.data.error("Could not fetch products.");
    // } catch (error) {
    //   this.data.error(error["message"]);
    // }
    this.activatedRoute.params.subscribe((res) => {
      this.getProducts();
    });
  }
}
