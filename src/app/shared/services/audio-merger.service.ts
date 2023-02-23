import {Injectable} from '@angular/core';
import {AudioContext} from 'standardized-audio-context';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioMergerService {

  convertedAudioBuffer = new Subject<AudioBuffer>();
  videoFileAsBuffer: ArrayBuffer;
  private _sampleRate = 48000;
  // private _sampleRate = 44100;
  private _context: AudioContext = new AudioContext();
  private _reader = new FileReader();

  constructor() {
  }

  async fetchAudio(...filePaths: string[]) {
    const files = filePaths.map(async filepath => {
      const buffer = await fetch(filepath).then(response => response.arrayBuffer());
      return await this._context.decodeAudioData(buffer);
    });
    return await Promise.all(files);
  }

  // mergeAudio(buffer) {
  //   let output = this._context.createBuffer(
  //     1,
  //     this._sampleRate * buffer.duration,
  //     this._sampleRate
  //   );
  //
  //   for (let i = buffer.getChannelData(0).length - 1; i >= 0; i--) {
  //     output.getChannelData(0)[i] += buffer.getChannelData(0)[i];
  //   }
  //   return output;
  // }

  mergeWeightedAudio(backgroundbuffer, foregroundbuffer, backgroundlevel): AudioBuffer {
    const list = [backgroundbuffer, foregroundbuffer];
    let numberOfChannels = 1;
    if (backgroundbuffer.numberOfChannels === foregroundbuffer.numberOfChannels) {
      numberOfChannels = backgroundbuffer.numberOfChannels;
    }
    const output = this._context.createBuffer(
      numberOfChannels,
      this._sampleRate * this._maxDuration(list),
      this._sampleRate
    );


    for (let j = 0; j < numberOfChannels; j++) {
      const outputData = output.getChannelData(j);
      for (let i = foregroundbuffer.getChannelData(j).length - 1; i >= 0; i--) {
        outputData[i] += foregroundbuffer.getChannelData(j)[i];
      }
      for (let i = backgroundbuffer.getChannelData(j).length - 1; i >= 0; i--) {
        outputData[i] += backgroundbuffer.getChannelData(j)[i] * backgroundlevel;
      }
      output.getChannelData(j).set(outputData);
    }


    return output;
    // return foregroundbuffer;
  }

  async convertVideoToAudio(video: Blob) {
    // this._sampleRate = 16000;
    console.log(this._context.sampleRate);
    this._reader.onload = async () => {
      const videoFileAsBuffer: any = this._reader.result;
      this._context.decodeAudioData(videoFileAsBuffer).then(decodedAudioData => {
        const duration = decodedAudioData.duration;
        console.log(decodedAudioData);

        const offlineAudioContext = new OfflineAudioContext(
          2,
          this._sampleRate * duration,
          this._sampleRate
        );
        const soundSource = offlineAudioContext.createBufferSource();
        soundSource.buffer = decodedAudioData;

        soundSource.connect(offlineAudioContext.destination);
        soundSource.start();

        console.log(soundSource);
        offlineAudioContext.startRendering();

        offlineAudioContext.oncomplete = e => {
          console.log(e.renderedBuffer);
          this.convertedAudioBuffer.next(e.renderedBuffer);
        };
      });
    };
    this._reader.readAsArrayBuffer(video);
  }

  export(buffer: AudioBuffer, audioType: string) {
    const type = audioType || 'audio/mp3';
    const recorded = this._interleave(buffer);
    const dataview = this._writeHeaders(recorded);
    const audioBlob = new Blob([dataview], {type});

    return {
      blob: audioBlob,
      url: this._renderURL(audioBlob),
      element: this._renderAudioElement(audioBlob, type),
    };
  }

  notSupported(callback: () => any) {
    return !this._isSupported() && callback();
  }

  close() {
    this._context.close();
    return this;
  }

  _maxDuration(buffers: any[]) {
    return Math.max.apply(
      Math,
      buffers.map(buffer => buffer.duration)
    );
  }

  _totalLength(buffers: any[]) {
    return buffers.map(buffer => buffer.length).reduce((a, b) => a + b, 0);
  }

  _isSupported(): boolean {
    return 'AudioContext' in window;
  }

  _writeHeaders(buffer: string | any[] | Float32Array) {
    const arrayBuffer = new ArrayBuffer(44 + buffer.length * 2);
      const view = new DataView(arrayBuffer);

    this._writeString(view, 0, 'RIFF');
    view.setUint32(4, 32 + buffer.length * 2, true);
    this._writeString(view, 8, 'WAVE');
    this._writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, this._sampleRate, true);
    view.setUint32(28, this._sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    this._writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * 2, true);

    return this._floatTo16BitPCM(view, buffer, 44);
  }

  _floatTo16BitPCM(dataview: DataView, buffer: string | any[] | Float32Array, offset: number) {
    for (let i = 0; i < buffer.length; i++, offset += 2) {
      const tmp = Math.max(-1, Math.min(1, buffer[i]));
      dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true);
    }
    return dataview;
  }
  _floatTo16BitPCM2(dataview: DataView, buffer: string | any[] | Float32Array, offset: number) {
    for (let i = 0; i < buffer.length; i++, offset += 2) {
      const tmp = Math.max(-1, Math.min(1, buffer[i]));
      dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true);
    }
    return dataview;
  }

  _writeString(dataview: DataView, offset: number, header: string) {
    let output;
    for (let i = 0; i < header.length; i++) {
      dataview.setUint8(offset + i, header.charCodeAt(i));
    }
  }

  _interleave(input: AudioBuffer) {
    const buffer = input.getChannelData(0);
      const length = buffer.length * 2;
      const result = new Float32Array(length);
      let index = 0;
      let inputIndex = 0;

    while (index < length) {
      result[index++] = buffer[inputIndex];
      result[index++] = buffer[inputIndex];
      inputIndex++;
    }
    return result;
  }
  _interleave2(input: AudioBuffer) {
    const buffer = input.getChannelData(0);
    console.log(input);
    const length = buffer.length;
    const result = new Float32Array(length);
    let index = 0;
    let inputIndex = 0;

    while (index < length) {
      result[index++] = buffer[inputIndex];
      result[index++] = buffer[inputIndex];
      inputIndex++;
    }
    return result;
  }

  _renderAudioElement(blob: Blob, type: string) {
    const audio: HTMLAudioElement = new Audio();
    audio.controls = true;
    audio.src = this._renderURL(blob);
    return audio;
  }

  _renderURL(blob: Blob) {
    return (window.URL || window.webkitURL).createObjectURL(blob);
  }
}
