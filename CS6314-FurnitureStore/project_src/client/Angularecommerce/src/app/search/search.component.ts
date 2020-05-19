//Search component.ts - Type Script file that contains code to render seareched products to elearning application

//including the required files and services
import { Component, OnInit } from "@angular/core";

import { ActivatedRoute } from "@angular/router";
import { DataService } from "../data.service";
import { RestApiService } from "../rest-api.service";

//component specific details
@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})

//exporting Serach Component
export class SearchComponent implements OnInit {
  query: string;
  page = 1;

  content: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private data: DataService,
    private rest: RestApiService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((res) => {
      this.query = res["query"];
      this.page = 1;
      this.getProducts();
    });
  }

  get lower() {
    // return 3 + this.content.hitsPerPage * this.content.page;
    return 3 * (this.page - 1) + 1;
  }

  get upper() {
    // return Math.min(
    //   3 * this.content.hitsPerPage * (this.content.page + 1),
    //   this.content.nbHits

    // );
    return Math.min(3 * this.page, this.content.nbHits);
  }

  async getProducts() {
    this.content = null;
    try {
      const data = await this.rest.get(
        `http://localhost:3030/api/search?query=${this.query}&page=${
          this.page - 1
        }`
      );

      data["success"]
        ? (this.content = data["products"])
        : this.data.error(data["message"]);
      console.log(this.content);
      this.content.forEach((element) => {
        console.log(element);
      });
    } catch (error) {
      this.data.error(error["message"]);
    }
  }
}
