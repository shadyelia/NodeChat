import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ChatService } from "../services/chat.service";
import { Router } from "@angular/router";
import { IUser } from "../models/IUser";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  exist: boolean = false;

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
      let user: IUser = {
        id: Math.floor(Math.random() * 10),
        token: Math.random().toString(),
        userName: this.loginForm.controls.userName.value
      };

      this.chatService.login(user).subscribe((exist: boolean) => {
        this.exist = exist;
        if (!exist) {
          localStorage.setItem(
            "userName",
            this.loginForm.controls.userName.value
          );
          this.router.navigateByUrl(`/chat`);
        }
      });
    }
  }
}
