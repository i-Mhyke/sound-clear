/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as moment from 'moment';
declare let MediaRecorder: any;

interface RecordedAudioOutput {
  title: string;
  blob: Blob;
  mimetype: string;
}

@Injectable({
  providedIn: 'root',
})
export class VoiceRecorderService {
  private mediaRecorder;
  private stream: MediaStream;
  private typeArray = ['audio/ogg', 'audio/webm'];
  private mimeType = '';
  private chunks = [];
  private counterRunning = false;
  private timerInterval: any;
  private counter: number;

  private recordObservable = new Subject<RecordedAudioOutput>();
  private counterObservable = new Subject<string>();
  private recordPauseObservable = new Subject<boolean>();

  constructor() {}

  getRecordedAudio(): Observable<RecordedAudioOutput> {
    return this.recordObservable.asObservable();
  }
  getRecordedTime(): Observable<string> {
    return this.counterObservable.asObservable();
  }
  getPauseState(): Observable<boolean> {
    return this.recordPauseObservable.asObservable();
  }

  startRecording() {
    if (!this.mediaRecorder || this.mediaRecorder.stream.active === false) {
      this.initializeRecorder();
    } else {
      this.chunks = [];
      this.mediaRecorder.start(10);
      this.startTimer();
    }
  }

  pauseRecording() {
    this.startTimer();
    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.recordPauseObservable.next(true);
    } else if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.recordPauseObservable.next(false);
    }
  }

  stopRecording() {
    this.mediaRecorder.stop();
    this.saveAudio();
    this.stopTimer();
    this.stopRecorderInitializer();
    this.recordPauseObservable.next(false);
  }
  abortRecording() {
    this.mediaRecorder.stop();
    this.stopTimer();
    this.stopRecorderInitializer();
    this.recordPauseObservable.next(false);
  }

  private async initializeRecorder() {
    this.mimeType = this.typeArray.find(type => {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: this.mimeType,
    });

    this.mediaRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data);
        // console.log(this.chunks);
      }
    };
    this.startRecording();
  }

  private stopRecorderInitializer() {
    this.stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  private saveAudio() {
    const blob = new Blob(this.chunks, { type: this.mimeType });
    const extension = this.mimeType.split('/')[1];
    const audioName = `REC${Date.now()}.${extension}`;

    this.recordObservable.next({ title: audioName, blob, mimetype: this.mimeType });
  }

  private startTimer() {
    this.counterRunning = !this.counterRunning;
    if (this.counterRunning) {
      const startTime = Date.now() - (this.counter || 0);
      this.timerInterval = setInterval(() => {
        this.counter = Date.now() - startTime;

        this.counterObservable.next(moment.utc(this.counter).format('HH:mm:ss'));
      }, 1000);
    } else {
      clearInterval(this.timerInterval);
    }
  }

  // private pauseTimer() {
  //   clearInterval(this.timerInterval);
  // }

  private stopTimer() {
    this.counter = undefined;
    this.counterRunning = false;
    clearInterval(this.timerInterval);
  }
}
