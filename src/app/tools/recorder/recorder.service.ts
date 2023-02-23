import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as Lamejs from 'lamejs';
import * as moment from 'moment';
import * as RecordRTC from 'recordrtc';
import { AudioMergerService } from 'src/app/shared/services/audio-merger.service';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const W3Module: any;

@Injectable({
  providedIn: 'root',
})
export class RecorderService {
  blob: Blob = undefined;
  counterRunning: boolean;
  timerInterval: ReturnType<typeof setInterval>;
  _recordedBlob = new Subject<Blob>();
  _offlineAudioContext = window.OfflineAudioContext;
  offlineAudioContext = new this._offlineAudioContext(1, 44100 * 1, 44100);
  private counter: number;
  private isSafari: boolean = this.isBrowserSafari();
  private microphoneStream: MediaStream;
  private rtcMediaRecorder: RecordRTC;
  private counterObservable = new Subject<string>();
  private recordPauseObservable = new Subject<boolean>();

  constructor(private mergerService: AudioMergerService) {}

  getPauseState(): Observable<boolean> {
    return this.recordPauseObservable.asObservable();
  }
  getCounterObservable(): Observable<string> {
    return this.counterObservable.asObservable();
  }

  startRecording() {
    this.checkBrowserCompatibility();
  }

  pauseRecording() {
    this.startTimer();
    if (this.rtcMediaRecorder.getState() === 'recording') {
      this.rtcMediaRecorder.pauseRecording();
      this.recordPauseObservable.next(true);
    } else if (this.rtcMediaRecorder.getState() === 'paused') {
      this.rtcMediaRecorder.resumeRecording();
      this.recordPauseObservable.next(false);
    }
  }
  stopRecording() {
    this.stopTimer();

    this.rtcMediaRecorder.stopRecording(() => {
      const audioBlob: Blob = this.rtcMediaRecorder.getBlob();

      W3Module.convertWebmToMP3(audioBlob).then((mp3Blob: Blob) => {
        this._recordedBlob.next(mp3Blob);
      });
      this.stopRecorderInitializer();
      this.recordPauseObservable.next(false);
    });
  }

  abortRecorder() {
    this.rtcMediaRecorder.stopRecording();
    this.stopTimer();
    this.stopRecorderInitializer();
    this.recordPauseObservable.next(false);
  }

  isBrowserSafari(): boolean {
    const userAgentString = navigator.userAgent;
    const chromeAgent = userAgentString.indexOf('Chrome') > -1;
    const safariAgent = userAgentString.indexOf('Safari') > -1;

    if (chromeAgent && safariAgent) {
      return false;
    } else {
      return safariAgent;
    }
  }

  private async checkBrowserCompatibility() {
    if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
      alert('This browser does not support WebRTC getUserMedia API.');
    }
    this.initializeRecorder();
  }

  private async initializeRecorder() {
    try {
      const options: RecordRTC.Options = {
        type: 'audio',
        checkForInactiveTracks: true,
        sampleRate: 44100,
        recorderType: RecordRTC.MediaStreamRecorder,
        bufferSize: this.isSafari ? 4096 : 16384,
      };
      this.microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true },
      });
      this.rtcMediaRecorder = new RecordRTC(this.microphoneStream, options);
      this.rtcMediaRecorder.startRecording();
      this.startTimer();
    } catch (error) {
      alert('Unable to capture your microphone. Please reload the page and try again.');
    }
  }

  private stopRecorderInitializer() {
    this.microphoneStream.getTracks().forEach(track => {
      track.stop();
    });
    this.microphoneStream.getTracks().forEach(track => {
      track.stop();
    });
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

  private stopTimer() {
    this.counter = undefined;
    this.counterRunning = false;
    clearInterval(this.timerInterval);
  }

  private async convertBlobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return await new Response(blob).arrayBuffer();
  }

  private async _arrayBufferToInt8(buffer: ArrayBuffer) {
    const decodedBuffer = await this.offlineAudioContext.decodeAudioData(buffer);
    const interleavedAudio = this.mergerService._interleave2(decodedBuffer);
    const arrayBuffer = new ArrayBuffer(44 + interleavedAudio.length * 2);
    const view = new DataView(arrayBuffer);
    const float16BCM = this.mergerService._floatTo16BitPCM2(view, interleavedAudio, 44);
    const samples = new Int16Array(arrayBuffer, float16BCM.byteOffset, float16BCM.byteLength / 2);
    this.encodeToMp3(1, 44100, samples);
  }

  private encodeToMp3(channels: number, sampleRate: number, samples: Int16Array) {
    const buffer = [];
    const mp3enc = new Lamejs.Mp3Encoder(channels, sampleRate, 128);
    let remaining = samples.length;
    const maxSamples = 1152;
    for (let i = 0; remaining >= maxSamples; i += maxSamples) {
      const mono = samples.subarray(i, i + maxSamples);
      const mp3buf = mp3enc.encodeBuffer(mono);
      if (mp3buf.length > 0) {
        buffer.push(new Int8Array(mp3buf));
      }
      remaining -= maxSamples;
    }
    const d = mp3enc.flush();
    if (d.length > 0) {
      buffer.push(new Int8Array(d));
    }

    console.log('done encoding, size=', buffer.length);
    const blob = new Blob(buffer, { type: 'audio/mp3' });
    this._recordedBlob.next(blob);
  }
}
