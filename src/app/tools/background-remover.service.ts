/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BackgroundRemoverService {
  constructor(private http: HttpClient) {}

  remove_background(file_name: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const httpParams: HttpParams = new HttpParams();
    // httpParams = httpParams.set('filename', file_name)
    return this.http.post(
      'https://rendfx-wav-lncykkpkba-ew.a.run.app/background_remove',
      // 'http://localhost:5000/background_remove',
      JSON.stringify({ filename: file_name }),
      httpOptions
    );
  }
  remove_videoBackground(file_name: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const httpParams: HttpParams = new HttpParams();
    return this.http.post(
      'https://rendfx-wav-lncykkpkba-ew.a.run.app/video_convert',
      JSON.stringify({ filename: file_name }),
      httpOptions
    );
  }
  swap_background(foreground_filename: string, background_filename: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const httpParams: HttpParams = new HttpParams();
    return this.http.post(
      'https://rendfx-wav-lncykkpkba-ew.a.run.app/background_swap',
      JSON.stringify({
        foreground_filename,
        background_filename,
      }),
      httpOptions
    );
  }
  videoSoundSwap(foreground: string, background: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.post(
      'https://rendfx-wav-lncykkpkba-ew.a.run.app/video_swap',
      JSON.stringify({
        foreground_filename: foreground,
        background_filename: background,
      }),
      httpOptions
    );
  }

  onEnded(event) {}
}
