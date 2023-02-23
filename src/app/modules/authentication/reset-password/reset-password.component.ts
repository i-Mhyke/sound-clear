import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  gridColumns = 1;
  weight = '600px';
  application: FormGroup;
  submitted = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.application = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }
  backToLogin(){
    this.router.navigateByUrl('login');
  }


}
