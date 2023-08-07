import { Injectable, OnDestroy, inject } from '@angular/core';
import { User } from '../services/user';
import { doc, setDoc, Firestore, getFirestore } from '@firebase/firestore';
import { getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, updateProfile, 
  User as FirebaseUser, signInAnonymously, 
  GoogleAuthProvider,
  sendEmailVerification,  
  signOut } from '@firebase/auth';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Auth, signInWithPopup, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private auth: Auth = inject(Auth);
  public user$: Observable<User | null> = user(this.auth);
  private userSubscription: Subscription;
  private firestore: Firestore = getFirestore();


  constructor(public router: Router) {
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


  async sendVerificationMail() {
    const auth = getAuth();
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        console.log("Verification Email Sent!");
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    } else {
      console.log("No user signed in");
    }
  }  


  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

}
