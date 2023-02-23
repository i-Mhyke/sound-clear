import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { UserResponseType } from '../user';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  gridColumns = 1;
  weight = '600px';
  signUpForm: FormGroup;
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
    this.signUpForm = new FormGroup(
      {
        fullName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      },
      { validators: this.passwordMatchingValidator }
    );
  }

  checkPasswords(group: FormGroup) {
    const password = group.controls.newPassword.value;
    const confirmPassword = group.controls.confirmPassword.value;

    return password === confirmPassword ? null : { notSame: true };
  }
  passwordMatchingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    return password?.value === confirmPassword?.value ? null : { notSame: true };
  };
  submitForm() {
    if (this.signUpForm.valid) {
      this.authService
        .createUserAccount(
          this.signUpForm.value.email,
          this.signUpForm.value.password,
          this.signUpForm.value.fullName
        )
        .then((response: UserResponseType) => {
          if (response.status === 'error') {
            this.openSnackBar(response.message);
          } else {
            this.openSnackBar(response.message);
            this.router.navigate(['/']);
          }
        });
    }
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 5000,
    });
  }
  goToLogin() {
    this.router.navigateByUrl('login');
  }

  signupWithGoogle() {
    this.authService.signUpWithGoogle().then((response: UserResponseType) => {
      if (response.status === 'error') {
        this.openSnackBar(response.message);
      } else {
        this.openSnackBar(response.message);
        this.router.navigate(['/']);
      }
    });
  }
  signupWithEmail() {
    // this.authService
  }
}
