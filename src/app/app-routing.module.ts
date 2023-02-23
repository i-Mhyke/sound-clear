import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RemoveBackgroundComponent } from './tools/remove-background/remove-background.component';
import { PricingComponent } from './landing-page/pricing/pricing.component';
import { VoiceRecorderComponent } from './tools/voice-recorder/voice-recorder.component';
import { VideoBackgroundComponent } from './tools/video-background/video-background.component';
import { SwapBackgroundComponent } from './tools/swap-background/swap-background.component';
import { VideoSoundSwapComponent } from './tools/video-sound-swap/video-sound-swap.component';
import { DemoSignupComponent } from './demo-signup/demo-signup.component';
import { DownloadPageComponent } from './download-page/download-page.component';
import { RecorderComponent } from './tools/recorder/recorder.component';
import { SigninComponent } from './modules/authentication/signin/signin.component';
import { SignupComponent } from './modules/authentication/signup/signup.component';
import { DownloadsComponent } from './downloads/downloads.component';

const routes: Routes = [
  { path: 'download/:fileId', component: DownloadPageComponent },
  { path: 'user/downloads', component: DownloadsComponent },
  { path: 'home', component: LandingPageComponent },
  { path: 'audio', component: RemoveBackgroundComponent },
  { path: 'swap', component: SwapBackgroundComponent },
  { path: 'recorder', component: RecorderComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'video', component: VideoBackgroundComponent },
  { path: 'video-swap', component: VideoSoundSwapComponent },
  { path: 'beta-signup', component: DemoSignupComponent },
  { path: 'login', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
