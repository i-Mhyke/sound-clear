import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AuthenticationService } from './authentication.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppRoutingModule } from 'src/app/app-routing.module';

@NgModule({
  declarations: [SignupComponent, SigninComponent, ResetPasswordComponent],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    NgxCaptchaModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  providers: [AuthenticationService],
  // entryComponents: [SigninComponent, SignupComponent]
})
export class AuthenticationModule {}
