import { Component, OnInit } from '@angular/core';
import { UploadService } from '../upload.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireStorage } from '@angular/fire/storage';
import { BackgroundRemoverService } from '../background-remover.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AudioMergerService } from 'src/app/shared/services/audio-merger.service';

@Component({
  selector: 'app-video-background',
  templateUrl: './video-background.component.html',
  styleUrls: ['./video-background.component.scss'],
})
export class VideoBackgroundComponent implements OnInit {
  isHovering: boolean;
  fileDropped = false;
  files: any = [];
  msbaVideoUrl;
  convertedAudio;
  downloadUrl: any;
  percentage: number;
  mode: string;
  foregroundURL: any;
  cleaned = false;
  cleanedVideo: any;

  constructor(
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private router: Router
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
        this.openSnackbar('Please upload a video file.');
        files = '';
        this.fileDropped = false;
      } else {
        this.files.push(item);
        item.progress = 0;
        this.fileDropped = true;
        this.createVideoUrl(item);
        console.log(item);
      }
    }
  }
  createVideoUrl(video) {
    const initialVideo = window.URL.createObjectURL(video);
    this.msbaVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(initialVideo);
  }

  validateFileType(type: string) {
    const extension = type.substring(0, type.indexOf('/'));
    if (extension === 'video') {
      return true;
    } else {
      return false;
    }
  }
  formatBytes(bytes, decimals) {
    return this.uploadService.formatBytes(bytes, decimals);
  }

  refreshInput() {
    if (confirm('Are you sure you want to refresh?')) {
      this.router.navigateByUrl('/tools');
    }
  }

  handleError() {
    console.log('error');
  }
}
