/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import firebase from 'firebase';
import { finalize } from 'rxjs/operators';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserProfileDto } from '../modules/authentication/user';
declare let gapi: any;
declare let google: any;

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  apiKey = 'AIzaSyBRHpYUnc0zXzqb_k5zLYlNRGe8GvEwoNQ';
  scope = ['https://www.googleapis.com/auth/drive.file'];
  clientId = '997885489104-5n3g1l87et2khjeq0fmg9jbll212rlif.apps.googleusercontent.com';
  appId = '997885489104';
  driveUrl = 'https://www.googleapis.com/drive/v3/';

  pickerApiLoaded = false;
  oauthToken: any;

  downloadURL;
  task: AngularFireUploadTask;
  percentage: Observable<number>;
  file: Observable<any>;
  // audioURL;
  audioURL: BehaviorSubject<string>;
  audioURL$: Observable<string>;

  constructor(
    private storage: AngularFireStorage,
    private http: HttpClient,
    private angularFirestore: AngularFirestore
  ) {
    this.audioURL = new BehaviorSubject<string>('hello');
    this.audioURL$ = this.audioURL.asObservable();
  }

  uploadFile(path, file): AngularFireUploadTask {
    this.task = this.storage.upload(path, file);

    const ref = this.storage.ref(path);
    return this.task;
  }

  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  onDriveApiLoad() {
    gapi.load('auth', { callback: this.onAuthApiLoad.bind(this) });
    gapi.load('picker', { callback: this.onPickerApiLoad.bind(this) });
  }

  onAuthApiLoad() {
    gapi.auth.authorize(
      {
        client_id: this.clientId,
        scope: this.scope,
        immediate: false,
      },
      this.handleAuthResult.bind(this)
    );
  }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
    this.createPicker();
  }

  handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
      this.oauthToken = authResult.access_token;
      console.log(this.oauthToken);
      this.createPicker();
    }
  }

  createPicker() {
    if (this.pickerApiLoaded && this.oauthToken) {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      view.setMimeTypes(
        // eslint-disable-next-line max-len
        `image/png,image/jpeg,image/jpg,video/mp4,audio/m4a,audio/mpeg,audio/mp3,audio/wav,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/csv`
      );
      const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(this.appId)
        .setOAuthToken(this.oauthToken)
        .addView(view)
        .addView(new google.picker.DocsUploadView())
        .setDeveloperKey(this.apiKey)
        .setCallback(this.pickerCallback)
        .build();
      picker.setVisible(true);
    }
  }
  pickerCallback(data) {
    if (data.action === google.picker.Action.PICKED) {
      const fileId = data.docs[0].id;
      alert('The user selected: ' + fileId);
      this.file = data.docs[0];
      console.log(this.file);

      this.downloadFile(this.file).subscribe(dataI => {
        console.log(dataI);
      });
    }
  }
  downloadFile(file): Observable<string> {
    return new Observable(observer => {
      if (file.url) {
        const accessToken = gapi.auth.getToken().access_token;
        const xhr = new XMLHttpRequest();
        const downloadUrl = `https://www.googleapis.com/drive/v2/files/${file.id}?key=${this.apiKey}`;

        xhr.open('GET', downloadUrl, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        // xhr.responseType = 'blob';

        xhr.onload = () => {
          const fileBlob = JSON.parse(xhr.response);
          console.log(fileBlob);
          console.log(fileBlob.webContentLink);
          // getFileURL(fileBlob.webContentLink);
          // const audioURL = window.URL.createObjectURL(fileBlob);
          observer.next(fileBlob.webContentLink);
        };
        // const getFileURL = url => {
        //   // this.audioURL = url;
        //   this.audioURL.next(url);
        // };
        xhr.onerror = err => {
          console.log(err);
        };
        xhr.send();
      } else {
        console.log('null');
      }
    });
  }
}
