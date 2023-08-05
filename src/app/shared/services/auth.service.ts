import { Injectable } from '@angular/core';
import { User } from '../services/user';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';


@Injectable({
  providedIn: 'root',
})


export class AuthService {
  private user: Observable<User | null>;


  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router
  ) {
    this.user = this.afAuth.authState;
    this.user.subscribe(user => {
      if (user) {
        this.setUserData(user).then(() => {
          this.router.navigate(['chat-history']);
        });
      }
    });
  }


  signIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.setUserData(result.user);
        this.afAuth.authState.subscribe((user) => {
          if (user) {
            this.router.navigate(['chat-history']);  // Hier muss ich die Startseite nach dem Login eintragen!!!!
          }
        });
      });
  }


  signInAnonymously() {
    return this.afAuth.signInAnonymously()
      .then((result) => {
        this.setUserData(result.user);
        this.router.navigate(['chat-history']); // Hier muss ich die Startseite nach dem Login eintragen!!!!
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }


  signUp(displayName: string, email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        if (result.user) {
          result.user.updateProfile({
            displayName: displayName
          }).then(() => {
            this.setUserData(result.user);
            this.router.navigate(['login']);
          });
        }
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }


  forgotPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail);
  }



  get isLoggedIn(): Observable<boolean> {
    return this.user.pipe(map(user => !!user));
  }


  setUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }


  signOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    });
  }
}