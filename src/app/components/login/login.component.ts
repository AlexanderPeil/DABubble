import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor (private authService: AuthService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
    });
  }


  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      this.authService.signIn(email, password)
          .then(() => {
            console.log('Anmeldung erfolgreich!');
          })
          .catch((error: { message: string; }) => {
            window.alert('Anmeldung fehlgeschlagen: ' + error.message);
          });
    } else {
      window.alert('Bitte überprüfen Sie die Formulardaten.');
    }
  }  
  

  onGuestLogin() {
    this.authService.signInAnonymously().catch((error) => {
      window.alert('Anonyme Anmeldung fehlgeschlagen: ' + error.message);
    });
  }


  signInWithGoogle() {
    this.authService.signInWithGoogle().catch(error => {
      window.alert('Google Sign In failed: ' + error.message);
    });
  }
  

}
