import { Injectable, OnDestroy } from '@angular/core';
import { User } from '../services/user';
import { Router } from '@angular/router';
import { Observable, Subscription, map } from 'rxjs';
import {
  Firestore,
  doc,
  setDoc,
  docData
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

/**
 * `AuthService` is a service class responsible for handling user authentication.
 * It observes the user's authentication state and logs relevant information.
 * 
 * @property {Observable<User | null>} user$ - Observable representing the current user. Emits either the user data or null if not authenticated.
 * @property {Subscription} userSubscription - Subscription to the user$ observable to handle user state changes.
 */
export class AuthService implements OnDestroy {
  public user$: Observable<any>;
  private userSubscription?: Subscription;

  DEFAULT_IMAGES: string[] = [
    '../assets/img/avatar1.svg',
    '../assets/img/avatar2.svg',
    '../assets/img/avatar3.svg'
  ]


  /**
   * Constructs an instance of the AuthService.
   * @param {Auth} auth - The authentication service dependency provided by Firebase.
   * @param {Router} router - The Angular Router for navigating between routes.
   * @param {Firestore} firestore - The Firestore database service provided by Firebase.
   */
  constructor(
    private auth: Auth,
    public router: Router,
    private firestore: Firestore) {
    this.user$ = user(this.auth);
  }


  getRandomImage(): string {
    const randomIndex = Math.floor(Math.random() * this.DEFAULT_IMAGES.length);
    return this.DEFAULT_IMAGES[randomIndex];
  }


  /**
   * Sign in using email and password.
   * @async
   * @param {string} email - The email address of the user.
   * @param {string} password - The password of the user.
   * @throws Will throw an error if the sign-in process fails.
   * @returns {Promise<void>} Returns a promise that resolves when the sign-in process is complete.
   */
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      if (userCredential.user) {
        // await this.setUserData(userCredential.user);
        await this.setUserOnlineStatus(userCredential.user, true);
        this.router.navigate(['chat-history']);  // Maybe I have to change the route later.
      }
    } catch (error) {
      console.log('An unexpected error occurred. Please try again', error);
      throw error;
    }
  }


  /**
   * Sign up using display name, email, and password.
   * After successful sign-up, updates the user profile with the display name, sets user data, and navigates to the login page.
   * @async
   * @param {string} displayName - The display name of the user.
   * @param {string} email - The email address of the user.
   * @param {string} password - The password of the user.
   * @throws Will throw an error if the sign-up process fails.
   * @returns {Promise<void>} Returns a promise that resolves when the sign-up process is complete.
   */
  async signUp(displayName: string, email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        await this.setUserData(userCredential.user);
        this.router.navigate(['login']);
      }
    } catch (error) {
      console.log('An unexpected error occurred. Please try again.', error);
      throw error;
    }
  }


  /**
   * Signs in the user anonymously.
   * After a successful sign-in, updates the user profile to set the display name as 'Guest', sets user data, updates user's online status and navigates to chat history.<------ Maybe I have to change the route later.
   * @async
   * @throws {Error} Will log and rethrow the error if the sign-in process fails.
   * @returns {Promise<void>} Returns a promise that resolves when the anonymous sign-in process is complete.
   */
  async signInAnonymously() {
    // debugger;
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


  /**
   * Signs in the user using Google authentication.
   * After successful sign-in, sets user data, updates user's online status and navigates to chat history.<------ Maybe I have to change the route later.
   * @async
   * @throws {Error} Will log and rethrow the error if the Google sign-in process fails.
   * @returns {Promise<void>} Returns a promise that resolves when the Google sign-in process is complete.
   */
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      if (user) {
        await this.setUserData(user);
        await this.setUserOnlineStatus(result.user, true);
        this.router.navigate(['chat-history']); // Maybe I have to change the route later.
      }
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  }


  /**
   * Sends a password reset email to the specified email address.
   * @async
   * @param {string} passwordResetEmail - The email address where the password reset link should be sent.
   * @throws Will throw an error if the email sending process fails.
   */
  async forgotPassword(passwordResetEmail: string) {
    try {
      await sendPasswordResetEmail(this.auth, passwordResetEmail);
    } catch (error) {
      console.log('An unexpected error occurred. Please try again', error);
      throw error;
    }
  }


  /**
   * Signs out the currently authenticated user. If the user is logged in, updates
   * their online status to 'false' before signing out and then redirects to the login page.
   * @async
   * @throws Will throw an error if the sign-out process fails.
   */
  async signOut() {
    if (this.auth.currentUser) {
      await this.setUserOnlineStatus(this.auth.currentUser, false);
    }
    await signOut(this.auth);
    this.router.navigate(['login']);
  }


  /**
   * Sends a verification email to the currently authenticated user.
   * @async
   * @throws Will throw an error if sending the email fails.
   */
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


  /**
   * Sets or updates the online status of the user in Firestore.
   * @async
   * @param {FirebaseUser} user - The user object from Firebase Authentication.
   * @param {boolean} isOnline - The online status to be set for the user.
   * @returns {User} The data structure that was set in Firestore.
   */
  async setUserOnlineStatus(user: FirebaseUser, isOnline: boolean) {
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      isOnline: isOnline,
      photoURL: ''
    };
    await setDoc(doc(this.firestore, `users/${user.uid}`), userData);
    return userData;
  }


  /**
   * Sets or updates the user's data in the Firestore.
   * @async
   * @param {FirebaseUser} user - The user object from Firebase Authentication.
   * @returns {User} The data structure that was set in Firestore.
   */
  async setUserData(user: FirebaseUser, photoUrlValue?: string) {
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      photoURL: this.getRandomImage(),
    };
    await setDoc(doc(this.firestore, `users/${user.uid}`), userData);
    return userData;
  }



  /**
   * Fetches the online status of a user from Firestore based on their UID.
   * @param {string} uid - The UID of the user.
   * @returns {Observable<boolean>} Observable that emits the online status of the user.
   */
  getUserData(uid: string): Observable<User> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return docData(userDocRef).pipe(
      map((data: any): User => ({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        emailVerified: data.emailVerified,
        isOnline: data.isOnline,
        photoURL: data.photoURL,
      }))
    );
  }



  /**
   * Lifecycle hook that Angular calls when the component is destroyed.
   * If there's an active subscription to `user$`, it will be unsubscribed.
   */
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
