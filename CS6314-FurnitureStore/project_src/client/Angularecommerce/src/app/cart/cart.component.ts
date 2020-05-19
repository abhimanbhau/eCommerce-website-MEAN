//Cart component.ts - Type Script file that contains code to render cart feature to elearning application

//including the required files and services
import { Component, OnInit } from "@angular/core";

import { environment } from "../../environments/environment";
import { DataService } from "../data.service";
import { RestApiService } from "../rest-api.service";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";

//componnet files specifications
@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"],
})

//exporting the cart component
export class CartComponent implements OnInit {
  btnDisabled = false;
  handler: any;

  quantities = [];

  getHeaders() {
    const token = localStorage.getItem("token");
    return token ? new HttpHeaders().set("Authorization", token) : null;
  }

  constructor(
    private data: DataService,
    private rest: RestApiService,
    private router: Router,
    private http: HttpClient
  ) {}

  trackByCartItems(index: number, item: any) {
    return item._id;
  }

  get cartItems() {
    return this.data.getCart();
  }

  get cartTotal() {
    let total = 0;
    this.cartItems.forEach((data, index) => {
      total += data["price"] * this.quantities[index];
    });
    return total;
  }

  removeProduct(index, product) {
    this.quantities.splice(index, 1);
    this.data.removeFromCart(product);
  }

  ngOnInit() {
    this.cartItems.forEach((data) => {
      this.quantities.push(1);
    });
  }

  validate() {
    if (!this.quantities.every((data) => data > 0)) {
      this.data.warning("Quantity cannot be less than one.");
    } else if (!localStorage.getItem("token")) {
      this.router.navigate(["/login"]).then(() => {
        this.data.warning("You need to login before making a purchase.");
      });
    } else if (!this.data.user["address"]) {
      this.router.navigate(["/profile/address"]).then(() => {
        this.data.warning("You need to login before making a purchase.");
      });
    } else {
      this.data.message = "";
      return true;
    }
  }

  async checkout() {
    const data = await this.rest.get(
      "http://localhost:3030/api/accounts/address"
    );

    if (JSON.stringify(data["address"]) === "{}" && this.data.message === "") {
      alert(
        "Shipping address is not entered in profile details. Please enter a shipping address"
      );
      location.href = "http://localhost:4200/profile/address";
      return;
    }

    for (let i = 0; i < this.cartItems.length; ++i) {
      if (this.cartItems[i].quantity - this.quantities[i] < 0) {
        alert(
          this.cartItems[i].title +
            " has " +
            this.cartItems[i].quantity +
            " items in stock"
        );
        return false;
      }
    }

    for (let i = 0; i < this.cartItems.length; ++i) {
      this.http
        .post(
          "http://localhost:3030/api/product/" + this.cartItems[i]._id + "/qty",
          { qty: this.cartItems[i].quantity - this.quantities[i] }
        )
        .subscribe((val) => {
          console.log();
        });
    }

    this.btnDisabled = true;
    try {
      if (this.validate()) {
        let products;
        products = [];
        this.cartItems.forEach((d, index) => {
          console.log(d);
          products.push({
            product: d["_id"],
            quantity: this.quantities[index],
          });
        });

        this.http
          .post(
            "http://localhost:3030/api/payment",
            {
              total: this.cartTotal,
              products,
              qty: this.quantities,
            },
            {
              headers: this.getHeaders(),
            }
          )
          .subscribe(
            (val) => {
              console.log("POST call successful value returned in body", val);
            },
            (response) => {
              console.log("POST call in error", response);
            },
            () => {
              console.log("The POST observable is now completed.");
            }
          );
      } else {
        this.btnDisabled = false;
      }
    } catch (error) {
      this.data.error(error);
    }
    this.data.clearCart();
    window.location.replace("http://localhost:4200/profile/orders");
  }
}
