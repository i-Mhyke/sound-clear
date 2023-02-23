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
  selector: 'app-swap-background',
  templateUrl: './swap-background.component.html',
  styleUrls: ['./swap-background.component.scss'],
})
export class SwapBackgroundComponent implements OnInit {
  files: any[] = [];
  foregroundFile: any;
  backgroundFile: any;
  isHovering: boolean;
  // Link to Uncleaned audio url
  audioBlob: string[] = [];
  fileDropped = false;
  percentage = 0;
  cleaning = false;
  cleaned = false;
  cleanedURL: any = '';
  mode = 'determinate';
  foregroundUrl: any;
  backgroundUrl: any;
  cleanedFileSize: any;
  loadingmerge: boolean;
  mergedURL: string;
  sliderPercentage: number;

  constructor(
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private router: Router,
    private backgroundRemoverService: BackgroundRemoverService,
    private storage: AngularFireStorage,
    private mergerService: AudioMergerService,
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

  onFileHover(event: boolean) {
    this.isHovering = event;
  }
  onFileDropped(event: any) {
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
        item.url = this.createAudioUrl(item);
        this.fileDropped = true;
        console.log(item);
      }
    }
  }

  createAudioUrl(audio: any) {
    return window.URL.createObjectURL(audio);
    // this.audioBlob.push(initialAudio);
  }

  validateFileType(type: string) {
    const fileType = type.substring(0, type.indexOf('/'));
    const extension = type.split('/')[1];
    if (fileType === 'audio' || extension === 'webm') {
      return true;
    } else {
      return false;
    }
  }
  formatBytes(bytes: any, decimals: any) {
    return this.uploadService.formatBytes(bytes, decimals);
  }
  lessThan(subject: number, num: number) {
    return subject < num;
  }
  swapAudios(inputFiles: any) {
    console.log(inputFiles);
    this.cleaning = true;
    const foregroundPath = `${Date.now()}_${inputFiles[0].name}`;
    const foregroundUploadTask = this.uploadService.uploadFile(foregroundPath, inputFiles[0]);
    const backgroundPath = `${Date.now()}_${inputFiles[1].name}`;
    const backgroundUploadTask = this.uploadService.uploadFile(backgroundPath, inputFiles[1]);
    foregroundUploadTask.then(ref => {
      backgroundUploadTask.then(() => {
        this.backgroundRemoverService.swap_background(foregroundPath, backgroundPath).subscribe(
          (response: BackgroundRemoverResponse) => {
            console.log(response);
            if (response.status === 'success') {
              this.storage
                .ref(response.foreground)
                .getDownloadURL()
                .subscribe(
                  url => {
                    this.foregroundUrl = url;
                  },
                  error => {
                    console.log(error);
                  },
                  () => {
                    this.storage
                      .ref(response.background)
                      .getDownloadURL()
                      .subscribe(url => {
                        this.backgroundUrl = url;
                        this.mergeAudioFiles(0);
                      });
                    console.log('Final response', response);
                    this.getCleanedFileMetaData(response.foreground);
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

  mergeAudioFiles(backgroundlevel: number) {
    this.mergerService
      .fetchAudio(this.backgroundUrl, this.backgroundUrl)
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
      if (this.router.url === '/swap') {
        this.router.navigateByUrl('/swap');
      } else {
        this.router.navigateByUrl('/');
      }
    }
  }
}
