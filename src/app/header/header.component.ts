import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '../modules/authentication/authentication.service';
import { UserProfileDto, UserResponseType } from '../modules/authentication/user';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  scrollTop = false;
  isLoggedIn = false;
  currentUser: UserProfileDto = JSON.parse(localStorage.getItem('user'));
  userInitials: string;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthenticationService,
    private _snackBar: MatSnackBar
  ) {
    this.authService.getCurrentUser().subscribe(user => {
      if (user !== null) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
    this.isLoggedIn = this.authService.isLoggedIn;
    this.userInitials = this.isLoggedIn
      ? this.currentUser.displayName.split(' ')[0].split('')[0]
      : undefined;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e: any) {
    if (window.pageYOffset > 0) {
      this.scrollTop = true;
    } else {
      this.scrollTop = false;
    }
  }

  ngOnInit(): void {}
  backToHome() {
    this.router.navigateByUrl('home');
  }
  logOut() {
    this.authService.signOut().then((response: UserResponseType) => {
      if (response.status === 'error') {
        this.openSnackBar(response.message);
      } else {
        this.isLoggedIn = false;
        this.openSnackBar(response.message);
      }
    });
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 5000,
    });
  }
}
