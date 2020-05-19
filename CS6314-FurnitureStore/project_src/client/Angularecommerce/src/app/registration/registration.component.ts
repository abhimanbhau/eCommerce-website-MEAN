//Registration component.ts - Type Script file that contains code to render Registration/SignUp feature to elearning application

//including the required files and services
import { Component, OnInit } from "@angular/core";

import { RestApiService } from "../rest-api.service";
import { DataService } from "../data.service";
import { Router } from "@angular/router";

//component specific details
@Component({
  selector: "app-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.scss"],
})

//exporting Registration component for reuse
export class RegistrationComponent implements OnInit {
  name = "";
  email = "";
  password = "";
  password1 = "";
  isSeller = false;

  btnDisabled = false;

  constructor(
    private router: Router,
    private data: DataService,
    private rest: RestApiService
  ) {}

  ngOnInit() {}

  validate() {
    if (this.name) {
      if (
        this.email &&
        this.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      ) {
        if (this.password) {
          if (this.password1) {
            if (this.password === this.password1) {
              if (
                // this.password.match(
                //   /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
                // )
                this.password.match(
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
                )
              ) {
                return true;
              } else {
                this.data.error(
                  "Password should contain 8 chars, 1 lowercase, 1 uppercase, 1 digit and one of [!@#$%^&*]"
                );
              }
            } else {
              this.data.error("Passwords do not match.");
            }
          } else {
            this.data.error("Confirmation Password is not entered");
          }
        } else {
          this.data.error("Password is not entered");
        }
      } else {
        this.data.error("Invalid email");
      }
    } else {
      this.data.error("Name is not entered.");
    }
  }

  async register() {
    this.btnDisabled = true;
    try {
      if (this.validate()) {
        const data = await this.rest.post(
          "http://localhost:3030/api/accounts/signup",
          {
            name: this.name,
            email: this.email,
            password: this.password,
            isSeller: this.isSeller,
          }
        );
        if (data["success"]) {
          localStorage.setItem("token", data["token"]);
          await this.data.getProfile();
          this.data.success("Registration successful!");
          location.href = "http://localhost:4200/profile/address";
        } else {
          this.data.error(data["message"]);
        }
      }
    } catch (error) {
      this.data.error(error["message"]);
    }
    this.btnDisabled = false;
  }
}
