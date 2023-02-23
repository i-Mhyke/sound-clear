import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  audioBuffer: AudioBuffer;
  audioContext: AudioContext;
  audioBufferSource: AudioBufferSourceNode;

  constructor() {
  }

  initialize(): void {
    const bufferSource = this.audioContext.createBufferSource();
    bufferSource.buffer = this.audioBuffer;
    bufferSource.connect(this.audioContext.destination);
    this.audioBufferSource = bufferSource;
  }

  play(): void {
    this.audioBufferSource.start(0);
  }

  pause(): void {
  }

  stop(): void {
  }

  toBeginning(): void {
  }

  setBuffer(audioBuffer: AudioBuffer): void {
    this.audioBuffer = audioBuffer;
  }

  setContext(audioContext: AudioContext): void {
    this.audioContext = audioContext;
  }
}
