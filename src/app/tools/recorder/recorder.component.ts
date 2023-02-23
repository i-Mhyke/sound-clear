import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomFile } from 'src/app/shared/interfaces/custom-file.interface';
import { RecorderService } from './recorder.service';

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RecorderComponent implements OnInit, OnDestroy {
  @Input() inserted: boolean;

  counter: string;
  file: CustomFile;
  audioBlob: string;
  recording = false;
  recordPaused = false;
  recordEnded = false;
  audioSubscription: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private recorderService: RecorderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.audioSubscription = this.recorderService._recordedBlob.subscribe((blob: Blob) => {
      this.createAudioFile(blob);
    });

    this.recorderService.getCounterObservable().subscribe((time: string) => {
      this.counter = time;
      // if (this.counter === '00:01:01') {this.stopRecording();}
    });

    this.recorderService.getPauseState().subscribe(state => {
      this.recordPaused = state;
    });
  }

  ngOnInit(): void {}

  startRecording() {
    this.recorderService.startRecording();
    this.recording = true;
  }
  pauseRecording() {
    this.recorderService.pauseRecording();
  }
  stopRecording() {
    this.recorderService.stopRecording();
    this.recording = false;
    this.recordPaused = false;
    this.recordEnded = true;
  }
  abortRecording() {
    if (this.recording) {
      this.recorderService.abortRecorder();
    }
  }

  createAudioFile(blob: Blob) {
    if (blob) {
      const recordName = `REC${Date.now()}.mp3`;
      const audioURL = window.URL.createObjectURL(blob);
      const newFile: CustomFile = new File([blob], recordName, {
        type: 'audio/mp3',
        lastModified: Date.now(),
      });
      newFile.progress = 0;
      newFile.url = this.sanitizer.bypassSecurityTrustResourceUrl(audioURL);
      this.audioBlob = audioURL;
      this.file = newFile;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    this.abortRecording();
    this.audioSubscription.unsubscribe();
    this.cdr.detach();
  }
}
