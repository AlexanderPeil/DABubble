import { Injectable, OnDestroy, inject } from '@angular/core';
import { User } from '../services/user';
import { doc, setDoc, Firestore, getFirestore } from '@firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile, User as FirebaseUser, signInAnonymously, GoogleAuthProvider, signOut } from '@firebase/auth';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Auth, signInWithPopup, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private auth: Auth;
  public user$: Observable<User | null>;
  private userSubscription: Subscription;
  private firestore!: Firestore;

  constructor(public router: Router) {
    this.auth = inject(Auth);
    this.user$ = user(this.auth);
    this.firestore = getFirestore();
    this.userSubscription = this.user$.subscribe((firebaseUser: User | null) => {
      if (firebaseUser) {
        console.log(firebaseUser);
      } else {
        console.log('User is not signed in');
      }
    });
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
        console.log('Sign in successful, setting user data...');
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
    const auth = getAuth();
    try {
      const result = await signInWithPopup(auth, provider);
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


  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

}
