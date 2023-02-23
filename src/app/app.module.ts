import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AuthenticationModule } from './modules/authentication/authentication.module';
import { ToolsModule } from './tools/tools.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FooterComponent } from './footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { PricingComponent } from './landing-page/pricing/pricing.component';
import { SigninComponent } from './modules/authentication/signin/signin.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { DemoSignupComponent } from './demo-signup/demo-signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DownloadPageComponent } from './download-page/download-page.component';
import { MatMenuModule } from '@angular/material/menu';
import { DownloadsComponent } from './downloads/downloads.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LandingPageComponent,
    FooterComponent,
    PricingComponent,
    DemoSignupComponent,
    DownloadPageComponent,
    DownloadsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ToolsModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    HttpClientModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSliderModule,
    MatMenuModule,
    // NgxAudioPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [],
})
export class AppModule {}
