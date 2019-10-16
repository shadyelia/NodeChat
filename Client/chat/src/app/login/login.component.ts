import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ChatService } from "../services/chat.service";
import { Router } from "@angular/router";

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
    this.chatService
      .login(this.loginForm.controls.userName.value)
      .subscribe((exist: boolean) => {
        this.exist = exist;
        if (!exist) {
          this.router.navigateByUrl(`/chat`);
        }
      });
  }
}
