import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthenticationService } from './demo-authentication.service';
import { SignUpState, SignUpStateEnum, UserObject } from './user';

@Component({
  selector: 'app-demo-signup',
  templateUrl: './demo-signup.component.html',
  styleUrls: ['./demo-signup.component.scss'],
})
export class DemoSignupComponent implements OnInit, OnDestroy {
  signupForm: FormGroup;
  confirmEmail: FormGroup;
  state: SignUpState;
  stateEnum = SignUpStateEnum;
  stateSubscription: Subscription;
  checkboxValid = false;

  purposes = [
    'Podcasting',
    'Youtube Content',
    'Social Media Content',
    'Api',
    'Enterprise',
    'Online Tutorials',
  ];

  constructor(private authService: AuthenticationService, private fb: FormBuilder) {
    this.authService._stateObs.subscribe(state => {
      this.state = state;
    });
  }

  ngOnInit(): void {
    this.authService.confirmUserSignIn();

    this.confirmEmail = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
    });
    this.signupForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      name: new FormControl('', [Validators.required]),
      checkBoxes: this.fb.array(this.purposes.map(x => false)),
    });
  }

  async onSignup() {
    const checkboxControl = this.signupForm?.controls.checkBoxes as FormArray;
    const checkboxControlArray = checkboxControl.value.map((value, i) =>
      value ? this.purposes[i] : false
    );
    const formValue: UserObject = {
      ...this.signupForm.value,
      checkBoxes: checkboxControlArray.filter(value => !!value),
    };
    if (this.signupForm.valid) {
      await this.authService.sendUserDetails(formValue);
    }
  }
  async onConfirmEmail() {
    const formValue: UserObject = {
      email: this.confirmEmail.value.email.toLocaleLowerCase(),
      name: '',
      checkBoxes: [],
    };
    if (this.confirmEmail.valid) {
      await this.authService.sendUserDetails(formValue);
    }
  }

  fieldsChange(event: any) {
    this.checkboxValid = this.signupForm.controls.checkBoxes.value.includes(true);
  }

  ngOnDestroy() {
    this.state = {
      currentState: this.stateEnum.default,
      error: '',
    };
    this.authService._stateObs.next(this.state);
  }
}
