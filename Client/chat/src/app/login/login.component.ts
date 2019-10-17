import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ChatService } from "../services/chat.service";
import { Router } from "@angular/router";
import { IUserLogin } from "../models/IUserLogin";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      userName: ["", Validators.required]
    });
  }

  login() {
    if (this.loginForm.valid) {
      let user: IUserLogin = {
        token: Math.random().toString(),
        userName: this.loginForm.controls.userName.value
      };

      this.chatService.login(user).subscribe((finish: boolean) => {
        if (finish) {
          this.chatService.setUserName(this.loginForm.controls.userName.value);
          this.router.navigateByUrl(`/chat`);
        }
      });
    }
  }
}
