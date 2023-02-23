import { NgModule } from '@angular/core';
import { AppRoutingModule } from './../app-routing.module';

import { CommonModule } from '@angular/common';
import { RemoveBackgroundComponent } from './remove-background/remove-background.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { DropzoneDirective } from './dropzone.directive';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { VoiceRecorderComponent } from './voice-recorder/voice-recorder.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { NgxAudioPlayerModule } from 'ngx-audio-player';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AudioPlayerComponent } from '../shared/audio-player/audio-player.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VideoBackgroundComponent } from './video-background/video-background.component';
import { UploadHandlerComponent } from '../shared/upload-handler/upload-handler.component';
import { SwapBackgroundComponent } from './swap-background/swap-background.component';
import { VideoSoundSwapComponent } from './video-sound-swap/video-sound-swap.component';
import { RecorderComponent } from './recorder/recorder.component';

@NgModule({
  declarations: [
    RemoveBackgroundComponent,
    DropzoneDirective,
    VoiceRecorderComponent,
    AudioPlayerComponent,
    VideoBackgroundComponent,
    UploadHandlerComponent,
    SwapBackgroundComponent,
    VideoSoundSwapComponent,
    RecorderComponent,
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatSnackBarModule,
    MatDividerModule,
    MatMenuModule,
    NgxAudioPlayerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSliderModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    RemoveBackgroundComponent,
    AudioPlayerComponent,
    RecorderComponent,
    UploadHandlerComponent,
  ],
})
export class ToolsModule {}
