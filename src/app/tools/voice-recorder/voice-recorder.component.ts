import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { VoiceRecorderService } from '../voice-recorder.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-voice-recorder',
  templateUrl: './voice-recorder.component.html',
  styleUrls: ['./voice-recorder.component.scss'],
})
export class VoiceRecorderComponent implements OnInit, OnDestroy {
  @Input() inserted: boolean;

  counter: string;
  file;
  audioBlob;
  recording = false;
  recordPaused = false;
  recordEnded = false;
  audioSubscription: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private voiceRecorderService: VoiceRecorderService,
    private router: Router
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.audioSubscription = this.voiceRecorderService.getRecordedAudio().subscribe(audio => {
      this.createAudioFile(audio);
    });

    this.voiceRecorderService.getRecordedTime().subscribe(time => {
      this.counter = time;
      if (this.counter === '00:01:01') {this.stopRecording();}
    });

    this.voiceRecorderService.getPauseState().subscribe(state => {
      this.recordPaused = state;
    });
  }

  ngOnInit(): void {}

  startRecording() {
    this.voiceRecorderService.startRecording();
    this.recording = true;
  }
  pauseRecording() {
    this.voiceRecorderService.pauseRecording();
  }
  stopRecording() {
    this.voiceRecorderService.stopRecording();
    this.recording = false;
    this.recordPaused = false;
    this.recordEnded = true;
  }
  abortRecording() {
    if (this.recording) {
      this.voiceRecorderService.abortRecording();
    }
  }

  createAudioFile(audio) {
    const audioURL = window.URL.createObjectURL(audio.blob);
    this.file = new File([audio.blob], audio.title, {
      type: audio.mimetype,
      lastModified: Date.now(),
    });
    this.file.progress = 0;
    this.file.url = this.sanitizer.bypassSecurityTrustResourceUrl(audioURL);
    this.audioBlob = audioURL;
    console.log(this.file);
  }

  ngOnDestroy() {
    this.abortRecording();
    this.audioSubscription.unsubscribe();
  }
}
