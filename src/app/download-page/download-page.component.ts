import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AudioMergerService } from '../shared/services/audio-merger.service';
import { UploadService } from '../tools/upload.service';

@Component({
  selector: 'app-download-page',
  templateUrl: './download-page.component.html',
  styleUrls: ['./download-page.component.scss']
})
export class DownloadPageComponent implements OnInit {
  fileName: string;
  id: string;
  mergedURL: string;
  cleanedURL: SafeResourceUrl;
  backgroundURL: string;
  foregroundURL: string;
  loadingMerge = false;
  sliderPercentage: number;

  constructor(private route: ActivatedRoute,
    private storage: AngularFireStorage,
    private mergerService: AudioMergerService,
    private sanitizer: DomSanitizer,
    private uploadService: UploadService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('fileId');
    this.getAudioDownloadUrl(this.id);
  }

  getAudioDownloadUrl(id: string) {
    const [foreground, background] = id.split('+');
    this.fileName = foreground;
      this.storage
        .ref(foreground)
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
              .ref(background)
              .getDownloadURL()
              .subscribe(url => {
                this.backgroundURL = url;
                this.mergeAudioFiles(0);
              });
          }
        );
  }

  mergeAudioFiles(backgroundLevel: number): void {
    this.mergerService
      .fetchAudio(this.backgroundURL, this.foregroundURL)
      .then(buffers =>
        this.mergerService.mergeWeightedAudio(buffers[0], buffers[1], backgroundLevel)
      )
      .then(merged => this.mergerService.export(merged, 'audio/mp3'))
      .then(output => {
        this.loadingMerge = false;
        this.mergedURL = output.url;
        this.cleanedURL = this.sanitizer.bypassSecurityTrustResourceUrl(output.url);
      })
      .catch(error => {
        throw new Error(error);
      });
  }

  onSliderChangeEnd(event) {
    this.loadingMerge = true;
    this.mergeAudioFiles(event.value);
    this.getSliderPercentage(event.value);
  }
  getSliderPercentage(sliderValue: number) {
    this.sliderPercentage = sliderValue * 100;
  }
  formatBytes(bytes: number, decimals: number): string {
    return this.uploadService.formatBytes(bytes, decimals);
  }
}
