import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { StreamState } from './stream-state';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() audioUrl: string;

  stop$ = new Subject();
  audioObject: HTMLAudioElement = new Audio();

  audioEvents: Array<string> = [
    'ended',
    'error',
    'play',
    'playing',
    'pause',
    'timeupdate',
    'canplay',
    'loadedmetadata',
    'loadstart',
  ];

  state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
    mute: false,
  };
  stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(this.state);

  constructor() {
    this.getState().subscribe(state => {
      this.state = state;
    });
  }

  ngOnInit(): void {
    this.playStream(this.audioUrl);
  }
  ngOnChanges(changes: SimpleChanges) {
    this.playStream(changes.audioUrl.currentValue);
  }
  onSliderChangeEnd(change): void {
    this.seekTo(change.value);
  }

  playStream(url): any {
    return this.streamObservable(url);
  }

  streamObservable(url): any {
    this.audioObject.src = url;
    this.audioObject.load();

    // handle events on the audio object
    const handler = (event: Event) => {
      this.updateStateEvents(event);
    };
    this.addEvents(this.audioObject, this.audioEvents, handler);
    this.getInfinity();
    this.resetState();
    return () => {
      this.audioObject.pause();
      this.audioObject.currentTime = 0;

      this.removeEvent(this.audioObject, this.audioEvents, handler);
    };
  }

  addEvents(obj, events, handler): void {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  removeEvent(obj, events, handler): void {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }

  play(): void {
    this.audioObject.play();
  }

  pause(): void {
    this.audioObject.pause();
  }

  stop(): void {
    this.stop$.next();
  }

  mute(): void {
    this.audioObject.volume = 0;
    this.state.mute = true;
  }

  unmute(): void {
    this.audioObject.volume = 1;
    this.state.mute = false;
  }

  seekTo(seconds): void {
    this.audioObject.currentTime = seconds;
  }

  // Convert the time to a readable time format
  formatTime(time: number, format: string = 'mm:ss'): string {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  updateStateEvents(event: Event): void {
    switch (event.type) {
      case 'canplay':
        this.state.duration = this.audioObject.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;

      case 'playing':
        this.state.playing = true;
        break;

      case 'pause':
        this.state.playing = false;
        break;

      case 'timeupdate':
        this.state.currentTime = this.audioObject.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;

      case 'error':
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
  }

  resetState(): void {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false,
      mute: false,
    };
    this.audioObject.pause();
    this.audioObject.currentTime = 0;
  }

  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }

  ngOnDestroy() {
    this.resetState();
  }

  // Update recorded audio duration
  fixInfinity(audio): Promise<void> {
    return new Promise((resolve, reject) => {
      audio.onloadedmetadata = () => {
        audio.currentTime = Number.MAX_SAFE_INTEGER;
        if (this.ifUndefined(audio)) {
          audio.ontimeupdate = () => {
            if (!this.ifUndefined(audio)) {
              resolve(audio.duration);
            }
            audio.ontimeupdate = () => {
              if (!this.ifUndefined(audio)) {
                resolve(audio.duration);
              }
            };
          };
        } else {
          resolve(audio.duration);
        }
      };
    });
  }

  // Check if duration is undefined
  ifUndefined(audio): boolean {
    if (audio.duration === Infinity || isNaN(audio.duration) || audio.duration === undefined) {
      return true;
    } else {
      return false;
    }
  }

  getInfinity(): Promise<void> {
    return this.fixInfinity(this.audioObject).then(val => {
      // Reset audio current time
      this.audioObject.currentTime = 0.1;
      this.audioObject.currentTime = 0;
    });
  }
}
