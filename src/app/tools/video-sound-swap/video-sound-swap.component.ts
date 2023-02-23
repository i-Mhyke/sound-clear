import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BackgroundRemoverResponse } from 'src/app/shared/interfaces/background-remover-response.interface';
import { AudioMergerService } from 'src/app/shared/services/audio-merger.service';
import { BackgroundRemoverService } from '../background-remover.service';
import { UploadService } from '../upload.service';

@Component({
  selector: 'app-video-sound-swap',
  templateUrl: './video-sound-swap.component.html',
  styleUrls: ['./video-sound-swap.component.scss'],
})
export class VideoSoundSwapComponent implements OnInit {
  files: any[] = [];
  foregroundFile;
  backgroundFile;
  isHovering: boolean;
  // Link to Uncleaned audio url
  audioBlob: string[] = [];
  fileDropped = false;
  percentage = 0;
  cleaning = false;
  cleaned = false;
  cleanedURL: any = '';
  mode = 'determinate';
  cleanedFileSize: any;
  mergedURL: string;

  constructor(
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private router: Router,
    private backgroundRemoverService: BackgroundRemoverService,
    private storage: AngularFireStorage,
    private sanitizer: DomSanitizer
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
  ngOnInit(): void {}

  openSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  onFileHover(event) {
    this.isHovering = event;
  }
  onFileDropped(event) {
    this.fileUploadHandler(event);
  }

  fileUploadHandler(files) {
    for (const item of files) {
      if (!this.validateFileType(item.type.toLowerCase())) {
        this.openSnackbar('Please input an audio file.');
        files = '';
        this.fileDropped = false;
      } else {
        this.files.push(item);
        item.progress = 0;
        item.url = this.createVideoUrl(item);
        this.fileDropped = true;
        console.log(files);
      }
    }
  }

  createVideoUrl(video) {
    const url = window.URL.createObjectURL(video);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  validateFileType(type: string) {
    const fileType = type.substring(0, type.indexOf('/'));
    const extension = type.split('/')[1];
    if (fileType === 'video' || fileType === 'audio') {
      return true;
    } else {
      return false;
    }
  }
  formatBytes(bytes, decimals) {
    return this.uploadService.formatBytes(bytes, decimals);
  }

  lessThan(subject: number, num: number) {
    return subject < num;
  }

  swapVideos(inputFiles: any) {
    this.cleaning = true;
    const foregroundPath = `${Date.now()}_${inputFiles[0].name}`;
    const foregroundUploadTask = this.uploadService.uploadFile(foregroundPath, inputFiles[0]);
    const backgroundPath = `${Date.now()}_${inputFiles[1].name}`;
    const backgroundUploadTask = this.uploadService.uploadFile(backgroundPath, inputFiles[1]);
    foregroundUploadTask.then(ref => {
      backgroundUploadTask.then(() => {
        this.backgroundRemoverService.videoSoundSwap(foregroundPath, backgroundPath).subscribe(
          (response: BackgroundRemoverResponse) => {
            console.log(response);
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
          }
        );
      });
      backgroundUploadTask.percentageChanges().subscribe(percentage => {
        this.percentage = percentage;
        if (this.percentage === 100) {
          this.mode = 'inderminate';
        }
      });
    });
    foregroundUploadTask.percentageChanges().subscribe(percentage => {
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
  handleError() {
    console.log('something went wrong');
  }

  refreshComponent() {
    if (confirm('Files you uploaded could be lost.')) {
      if (this.router.url === '/video-swap') {
        this.router.navigateByUrl('/video-swap');
      } else {
        this.router.navigateByUrl('/');
      }
    }
  }
}
