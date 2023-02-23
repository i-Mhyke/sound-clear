import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/modules/authentication/authentication.service';
import { UserProfileDto } from 'src/app/modules/authentication/user';
import { BackgroundRemoverService } from 'src/app/tools/background-remover.service';
import { UploadService } from 'src/app/tools/upload.service';
import { BackgroundRemoverResponse } from '../interfaces/background-remover-response.interface';
import { CustomFile } from '../interfaces/custom-file.interface';
import { AudioMergerService } from '../services/audio-merger.service';
import firebase from 'firebase';
import { DataApiService } from '../services/data-api.service';

@Component({
  selector: 'app-upload-handler',
  templateUrl: './upload-handler.component.html',
  styleUrls: ['./upload-handler.component.scss'],
})
export class UploadHandlerComponent implements OnInit, OnChanges {
  @Input() file: CustomFile;
  @Input() blob: Blob;
  @Input() recorded = false;
  @Input() isVideo = false;

  msbapAudioUrl;
  percentage = 0;
  cleaning = false;
  cleaned = false;
  cleanedURL: any = '';
  mode = 'determinate';

  backgroundURL = '';
  foregroundURL = '';
  cleanedFileSize = '';
  mergedURL: string;
  loadingmerge = false;
  sliderPercentage: number;
  currentUser: UserProfileDto = JSON.parse(localStorage.getItem('user'));

  constructor(
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private backgroundRemoverService: BackgroundRemoverService,
    private storage: AngularFireStorage,
    private router: Router,
    private mergerService: AudioMergerService,
    private authService: AuthenticationService,
    private dataApiService: DataApiService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges) {
    this.file = changes.file.currentValue;
    console.log(changes);
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  sendVideo(video) {
    console.log('Cleaning Video');
    const path = `${Date.now()}_${video.name}`;
    const uploadTask = this.uploadService.uploadFile(path, video);
    uploadTask.then(ref => {
      this.openSnackbar('Upload Complete');
      this.cleaning = true;
      this.backgroundRemoverService.remove_videoBackground(path).subscribe(
        (response: BackgroundRemoverResponse) => {
          console.log('Backend Response', response);
          if (response.status === 'success') {
            this.storage
              .ref(response.processed_video)
              .getDownloadURL()
              .subscribe(
                url => {
                  this.cleanedURL = url;
                  this.mergedURL = url;
                  // this.cleanedURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                  this.getCleanedFileMetaData(response.processed_video);
                  this.cleaned = true;
                  this.cleaning = false;
                },
                error => {
                  console.log(error);
                }
              );
          } else if (response.status === 'error') {
            this.handleError();
          }
        },
        error => {
          console.log(error);
          this.handleError();
        }
      );
    });
    uploadTask.percentageChanges().subscribe(percentage => {
      this.percentage = percentage;
      if (this.percentage === 100) {
        this.mode = 'inderminate';
      }
    });
  }

  sendFile(file) {
    console.log('cleaning audio');
    const path = `${Date.now()}_${file.name}`;
    const uploadTask = this.uploadService.uploadFile(path, file);
    uploadTask.then(ref => {
      this.openSnackbar('Upload Complete');
      this.cleaning = true;
      ref.ref.getDownloadURL().then(url => (this.msbapAudioUrl = url));
      this.backgroundRemoverService.remove_background(path).subscribe(
        (response: BackgroundRemoverResponse) => {
          console.log('Backend Response', response);
          if (response.status === 'success') {
            this.storage
              .ref(response.foreground)
              .getDownloadURL()
              .subscribe(
                url => {
                  this.foregroundURL = url;
                },
                error => {
                  console.log(error);
                },
                () => {
                  this.storage
                    .ref(response.background)
                    .getDownloadURL()
                    .subscribe(url => {
                      this.backgroundURL = url;
                      this.mergeAudioFiles(0);
                    });
                  this.getCleanedFileMetaData(response.foreground);
                  if (this.authService.isLoggedIn) {
                    this.dataApiService.addFileToUserProfile(this.currentUser, {
                      mainFile: path,
                      foreground: response.foreground,
                      background: response.background,
                    });
                  }
                }
              );
          } else if (response.status === 'error') {
            this.handleError();
          }
        },
        error => {
          console.log(error);
          this.handleError();
        }
      );
    });
    uploadTask.percentageChanges().subscribe(percentage => {
      this.percentage = percentage;
      if (this.percentage === 100) {
        this.mode = 'inderminate';
      }
    });
  }

  getCleanedFileMetaData(data) {
    this.storage
      .ref(data)
      .getMetadata()
      .subscribe(metadata => {
        this.cleanedFileSize = metadata.size;
      });
  }
  mergeAudioFiles(backgroundlevel: number) {
    this.mergerService
      .fetchAudio(this.backgroundURL, this.foregroundURL)
      .then(buffers =>
        this.mergerService.mergeWeightedAudio(buffers[0], buffers[1], backgroundlevel)
      )
      .then(merged => this.mergerService.export(merged, 'audio/mp3'))
      .then(output => {
        this.mergedURL = output.url;
        this.cleanedURL = this.sanitizer.bypassSecurityTrustResourceUrl(output.url);
        this.mode = 'buffer';
        this.cleaned = true;
        this.cleaning = false;
        this.loadingmerge = false;
      })
      .catch(error => {
        throw new Error(error);
      });
  }

  onSliderChangeEnd(event) {
    this.loadingmerge = true;
    this.mergeAudioFiles(event.value);
    this.getSliderPercentage(event.value);
  }
  getSliderPercentage(sliderValue: number) {
    this.sliderPercentage = sliderValue * 100;
  }

  handleError() {
    this.openSnackbar('An error occured. Please check your network and try again');
    // this.router.navigateByUrl('/audio');
  }

  //Convert the file size
  formatBytes(bytes, decimals) {
    return this.uploadService.formatBytes(bytes, decimals);
  }

  refreshComponent() {
    if (confirm('Files you uploaded could be lost.')) {
      if (this.router.url === '/recorder') {
        this.router.navigateByUrl('/recorder');
      } else if (this.router.url === '/audio') {
        this.router.navigateByUrl('/audio');
      } else if (this.router.url === '/video') {
        this.router.navigateByUrl('/video');
      } else {
        this.router.navigateByUrl('/');
      }
    }
  }
}
