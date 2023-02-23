import { Injectable } from '@angular/core';
import { UserProfileDto } from 'src/app/modules/authentication/user';
import firebase from 'firebase';
import { Action, AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataApiService {
  constructor(private angularFirestore: AngularFirestore) {}

  addFileToUserProfile(
    user: UserProfileDto,
    file: { mainFile: string; foreground: string; background: string }
  ): Promise<void> {
    return this.angularFirestore
      .collection('profiles')
      .doc(user.uid)
      .update({
        files: firebase.firestore.FieldValue.arrayUnion(file),
      });
  }
  removeFileFromUserProfile(
    user: UserProfileDto,
    file: { mainFile: string; foreground: string; background: string }
  ): Promise<void> {
    console.log(user);
    return this.angularFirestore
      .collection('profiles')
      .doc(user.uid)
      .update({
        files: firebase.firestore.FieldValue.arrayRemove(file),
      });
  }
  getUserFilesData(user: UserProfileDto): Observable<Action<DocumentSnapshot<unknown>>> {
    return this.angularFirestore.collection('profiles').doc(user.uid).snapshotChanges();
  }
}
