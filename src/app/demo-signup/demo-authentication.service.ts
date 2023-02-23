import { switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
// import { auth } from 'firebase/app';
// import { User } from 'firebase';
import firebase from 'firebase';
import {
  AuthenticationObject,
  FirestoreUser,
  SignUpState,
  SignUpStateEnum,
  UserObject,
} from './user';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  state: SignUpState = {
    currentState: SignUpStateEnum.default,
    error: '',
  };
  _stateObs: BehaviorSubject<SignUpState> = new BehaviorSubject(this.state);
  _userObs: BehaviorSubject<string> = new BehaviorSubject(
    window.localStorage.getItem('emailForSignIn')
  );

  constructor(
    private af: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private router: Router
  ) {}

  // Collects the user details from the client form and performs series of validation checks
  async sendUserDetails(userDetails: UserObject) {
    const email = userDetails.email.toLocaleLowerCase();

    if ((await this.af.isSignInWithEmailLink(location.href)) && !!email) {
      //This is called when a user confirms their email from a different device.
      this.signInUserWithEmailLink(email);
    } else {
      this.checkIfUserExists(email).subscribe(userExists => {
        if (userExists) {
          this.checkIfUserVerified(email).subscribe(userVerified => {
            if (!userVerified) {
              this.sendEmailMethod(email, userDetails, false);
            } else {
              this.state.error = 'Email has already been used by another user.';
              this._stateObs.next(this.state);
            }
          });
        } else {
          this.sendEmailMethod(email, userDetails, true);
        }
      });
    }
  }

  //This function retrieves the user's email then sends the verification email to the user.
  async sendEmailMethod(email: string, userDetails: UserObject, newSignUp: boolean) {
    this.af
      .sendSignInLinkToEmail(email, {
        url: `${location.origin}/beta-signup`,
        handleCodeInApp: true,
      })
      .then(() => {
        window.localStorage.setItem('emailForSignIn', email);
        this.state.currentState = SignUpStateEnum.emailSent;
        this._stateObs.next(this.state);

        //Checks if the user is signing up for the first time to avoid duplicate users in the firestore collection.
        //If the user has signed up previously but did not verify their email, we update the users document,
        // otherwise, we create a new user document
        return newSignUp ? this.addUserToCollection(userDetails) : this.updateUserDetailsInCollection(userDetails);
      })
      .catch(error => {
        this.state.error = error.message;
        this._stateObs.next(this.state);
      });
  }

  //Called every time the component is rendered to check if there is a verification link and user email in the local storage.
  //If there is a verification link and user email in local storage, the user will be signed in.
  async confirmUserSignIn() {
    if ((await this.af.isSignInWithEmailLink(location.href)) && !!this._userObs.value) {
      this.signInUserWithEmailLink(this._userObs.value);
    } else if ((await this.af.isSignInWithEmailLink(location.href)) && !this._userObs.value) {
      this.state.currentState = SignUpStateEnum.differentDevice;
      this._stateObs.next(this.state);
    }
  }

  //Function is called to check the user's verification link and maps it to the email that was provided
  async signInUserWithEmailLink(email: string) {
    this.state.currentState = SignUpStateEnum.loading;
    this._stateObs.next(this.state);
    return this.af
      .signInWithEmailLink(email, window.location.href)
      .then((result: firebase.auth.UserCredential) => {
        //This checks if the email stored in local storage matches the new email provided.
        // This is applicable when a user tries to verify their email from a device different from the one used to sign up
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        !!this._userObs.value || this._userObs.value === email
          ? null
          : window.localStorage.setItem('emailForSignIn', email);

        //Updates the state
        this.state.currentState = SignUpStateEnum.successfulSignup;
        this._stateObs.next(this.state);

        //Calls the function that updates the user's verification states
        this.updateUserVerificationStatus(result.user);
      })
      .catch(error => {
        if (error.code === 'auth/invalid-action-code') {
          this.router.navigateByUrl('/beta-signup');
        }
      });
  }

  //Adds the user to the collection and stores the user as unverified until they confirm their email
  addUserToCollection(userDetails: UserObject) {
    const userObj = {
      name: userDetails.name,
      email: userDetails.email.toLowerCase(),
      verified: false,
      purpose: userDetails.checkBoxes,
    };
    this.angularFirestore.collection('users').add(userObj);
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
    const collectionUser = this.angularFirestore.collection('users', ref =>
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
      .collection('users', ref => ref.where('email', '==', userEmail))
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
    const user = this.angularFirestore.collection('users', ref =>
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
}
