import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../modules/authentication/authentication.service';
import { UserProfileDto } from '../modules/authentication/user';
import { DataApiService } from '../shared/services/data-api.service';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss'],
})
export class DownloadsComponent implements OnInit {
  currentUser: UserProfileDto = JSON.parse(localStorage.getItem('user'));
  data: any;
  loading: boolean;

  constructor(private dataApiService: DataApiService, private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.loading = true;
    if (this.authService.isLoggedIn) {
      this.dataApiService.getUserFilesData(this.currentUser).subscribe(userProfile => {
        this.data = userProfile.payload.data();
        this.loading = false;
        console.log(this.data);
      });
    }
  }
  deleteFileFromUserProfile(file: { mainFile: string; foreground: string; background: string }) {
    this.dataApiService.removeFileFromUserProfile(this.currentUser, file);
  }
}
