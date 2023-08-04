import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  sendMail!: FormGroup;


  ngOnInit() {
    this.sendMail = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
    });
  }

}
