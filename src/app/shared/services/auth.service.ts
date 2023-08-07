import { Injectable, OnDestroy } from '@angular/core';
import { User } from '../services/user';
import { Router } from '@angular/router';
import { Observable, Subscription, map } from 'rxjs';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc
} from '@angular/fire/firestore';
import {
  Auth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  signInAnonymously,
  GoogleAuthProvider,
  sendEmailVerification,
  signOut,
  user
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private firestore: Firestore;
  public user$: Observable<User | null>;
  private userSubscription: Subscription;


  constructor(private auth: Auth, public router: Router) {
    this.firestore = getFirestore();
    this.user$ = user(this.auth);
    this.userSubscription = this.user$.subscribe((firebaseUser: User | null) => {
      if (firebaseUser) {
        console.log(firebaseUser);
      } else {
        console.log('User is not signed in');
      }
    });
  }

  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      if (userCredential.user) {
        await this.setUserData(userCredential.user);
        await this.setUserOnlineStatus(userCredential.user, true);
        this.router.navigate(['chat-history']);
      }
    } catch (error) {
      throw error;
    }
  }


  async signUp(displayName: string, email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
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
    try {
      const userCredential = await signInAnonymously(this.auth);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: 'Guest' });
        await this.setUserData(userCredential.user);
        this.router.navigate(['chat-history']);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }


  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      if (user) {
        await this.setUserData(user);
        this.router.navigate(['chat-history']);
      }
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  }


  async forgotPassword(passwordResetEmail: string) {
    try {
      await sendPasswordResetEmail(this.auth, passwordResetEmail);
    } catch (error) {
      throw error;
    }
  }


  async signOut() {
    if (this.auth.currentUser) {
      await this.setUserOnlineStatus(this.auth.currentUser, false); 
    }
    await signOut(this.auth);
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


  async sendVerificationMail() {
    if (this.auth.currentUser) {
      try {
        await sendEmailVerification(this.auth.currentUser);
        console.log("Verification Email Sent!");
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    } else {
      console.log("No user signed in");
    }
  }


  async setUserOnlineStatus(user: FirebaseUser, isOnline: boolean) {
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      isOnline: isOnline
    };
    await setDoc(doc(this.firestore, `users/${user.uid}`), userData);
    return userData;
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

}
