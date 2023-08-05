import { Injectable } from '@angular/core';
import { User } from '../services/user';
import { doc, setDoc, Firestore } from '@firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile, User as FirebaseUser, signInAnonymously, onAuthStateChanged, signOut } from '@firebase/auth';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private firestore: Firestore,
    private router: Router
  ) {
    const auth = getAuth();
    this.user$ = new Observable<any>(subscriber => {
      onAuthStateChanged(auth, subscriber);
    }).pipe(
      switchMap((firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          return from(this.setUserData(firebaseUser));
        } else {
          return of(null);
        }
      })
    );
    
  }

  async signIn(email: string, password: string) {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await this.setUserData(userCredential.user);
        this.router.navigate(['chat-history']);
      }
    } catch (error) {
      throw error;
    }
  }

  async signUp(displayName: string, email: string, password: string) {
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        await this.setUserData(userCredential.user);
        this.router.navigate(['login']);
      }
    } catch (error) {
      throw error;
    }
  }

  async signInAnonymously() {
    const auth = getAuth();
    try {
      const userCredential = await signInAnonymously(auth);
      if (userCredential.user) {
        await this.setUserData(userCredential.user);
        this.router.navigate(['chat-history']);
      }
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(passwordResetEmail: string) {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, passwordResetEmail);
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    const auth = getAuth();
    await signOut(auth);
    this.router.navigate(['login']);
  }

  async setUserData(user: FirebaseUser) {
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
    };
    await setDoc(doc(this.firestore, `users/${user.uid}`), userData);
    return userData;
  }
}
