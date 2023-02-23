import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from '../authentication.service';
import { UserResponseType } from '../user';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  gridColumns = 1;
  weight = '600px';
  loginForm: FormGroup;
  recaptcha: FormGroup;
  env;
  submitted = false;

  hide = true;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.env = environment;
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }
  goToSignUp() {
    this.router.navigateByUrl('signup');
  }
  submitForm() {
    if (this.loginForm.valid) {
      this.authService
        .loginWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password)
        .then((response: UserResponseType) => {
          if (response.status === 'error') {
            this.openSnackBar(response.message);
          } else {
            this.openSnackBar(response.message);
            this.router.navigate(['/']);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
  signInWithGoogle() {
    this.authService.signUpWithGoogle().then((response: UserResponseType) => {
      if (response.status === 'error') {
        this.openSnackBar(response.message);
      } else {
        this.openSnackBar(response.message);
        this.router.navigate(['/']);
      }
    });
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 5000,
    });
  }
  forgotPassword() {
    this.router.navigateByUrl('reset_password');
  }
}
