import { Component, OnInit } from '@angular/core';
import { UploadService } from '../upload.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-remove-background',
  templateUrl: './remove-background.component.html',
  styleUrls: ['./remove-background.component.scss'],
})
export class RemoveBackgroundComponent implements OnInit {
  files: any[] = [];
  isHovering: boolean;
  // Link to Uncleaned audio url
  audioBlob;
  fileDropped = false;

  constructor(
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
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
        this.openSnackbar('Please input an audio file.');
        files = '';
        this.fileDropped = false;
      } else {
        this.files.push(item);
        item.progress = 0;
        this.fileDropped = true;
        this.createAudioUrl(item);
        console.log(item);
      }
    }
  }

  createAudioUrl(audio) {
    const initialAudio = window.URL.createObjectURL(audio);
    this.audioBlob = initialAudio;
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
  openDrive() {
    this.uploadService.onDriveApiLoad();
    this.uploadService.audioURL$.subscribe(data => {
      console.log(data);
    });
  }
}
