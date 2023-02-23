import { switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
import { FirestoreUser, UserObject, UserProfileDto, UserResponseType } from './user';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  currentUser: Subject<firebase.User> = new Subject<firebase.User>();
  constructor(
    private af: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private router: Router
  ) {
    this.af.onAuthStateChanged(user => {
      if (user) {
        const userDto = this.mapFirebaseUserToDto(user);
        localStorage.setItem('user', JSON.stringify(userDto));
        JSON.parse(localStorage.getItem('user'));
        this.currentUser.next(user);
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
        this.currentUser.next(null);
      }
    });
  }

  getCurrentUser(): Observable<firebase.User> {
    return this.currentUser.asObservable();
  }

  async createUserAccount(
    email: string,
    password: string,
    name: string
  ): Promise<UserResponseType> {
    try {
      const userCredentials = await (
        await this.af.createUserWithEmailAndPassword(email, password)
      ).user.updateProfile({
        displayName: name,
      });
      this.addUserToCollection(this.mapFirebaseUserToDto(await this.af.currentUser));
      return {
        status: 'success',
        message: `Signup successful. Welcome ${(await this.af.currentUser).displayName}!`,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
  async signUpWithGoogle(): Promise<UserResponseType> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredentials = await this.af.signInWithPopup(provider);
      this.checkIfUserExists(userCredentials.user.email).subscribe((isExist: boolean) => {
        if (!isExist) {
          this.addUserToCollection(this.mapFirebaseUserToDto(userCredentials.user));
        }
      });
      return {
        status: 'success',
        message: `Welcome back ${userCredentials.user.displayName || ''}!`,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
  async loginWithEmailAndPassword(email: string, password: string): Promise<UserResponseType> {
    try {
      const userCredentials = await this.af.signInWithEmailAndPassword(email, password);
      return {
        status: 'success',
        message: `Welcome back ${userCredentials.user.displayName || ''}!`,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  async signOut(): Promise<UserResponseType> {
    try {
      const signOut = await this.af.signOut();
      localStorage.removeItem('user');
      this.router.navigate(['login']);
      return {
        status: 'success',
        message: 'Sign out successful',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Could not sign user out.',
      };
    }
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null ? true : false;
  }
  get isVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user.emailVerified !== false ? true : false;
  }

  //Adds the user to the collection and stores the user as unverified until they confirm their email
  async addUserToCollection(userDetails: UserProfileDto): Promise<void> {
    return await this.angularFirestore.collection('profiles').doc(userDetails.uid).set({
      displayName: userDetails.displayName,
      email: userDetails.email,
      emailVerified: userDetails.emailVerified,
      photoUrl: userDetails.photoUrl,
      files: userDetails.files,
    });
  }

  //Updates the user's verified field to true immediately they click on the verification link email
  updateUserVerificationStatus(user: firebase.User) {
    const collectionUser = this.angularFirestore.collection('users', ref =>
      ref.where('email', '==', user.email)
    );

    collectionUser.get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.update({ verified: user.emailVerified });
      });
    });
  }

  //Updates the user details when they try to sign up with an unverified email
  updateUserDetailsInCollection(userDetails: UserObject) {
    const collectionUser = this.angularFirestore.collection('profiles', ref =>
      ref.where('email', '==', userDetails.email)
    );

    collectionUser.get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.update({ name: userDetails.name, purpose: userDetails.checkBoxes });
      });
    });
  }

  //Checks if user's email is in the firestore collection
  checkIfUserExists(userEmail: string): Observable<boolean> {
    return this.angularFirestore
      .collection('profiles', ref => ref.where('email', '==', userEmail))
      .get()
      .pipe(
        switchMap(result => {
          if (result.docs.length > 0) {
            return of(true);
          } else {
            return of(false);
          }
        })
      );
  }

  //Checks if the user has been verified.
  checkIfUserVerified(userEmail: string): Observable<boolean> {
    const user = this.angularFirestore.collection('profiles', ref =>
      ref.where('email', '==', userEmail)
    );

    return user.get().pipe(
      switchMap((result: firebase.firestore.QuerySnapshot<FirestoreUser>) => {
        if (result.docs[0].data().verified === true) {
          return of(true);
        } else {
          return of(false);
        }
      })
    );
  }

  public mapFirebaseUserToDto(user: firebase.User): UserProfileDto {
    const userObj = new UserProfileDto();
    userObj.displayName = user.displayName;
    userObj.email = user.email;
    userObj.emailVerified = user.emailVerified;
    userObj.photoUrl = user.photoURL;
    userObj.uid = user.uid;
    userObj.files = [];
    return userObj;
  }
}
