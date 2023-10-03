import { Injectable } from '@angular/core';
import { User } from '../services/user';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { StorageService } from 'src/app/shared/services/storage.service';
import {
  Firestore,
  doc,
  setDoc,
  docData,
  updateDoc,
  collection,
  collectionData,
  deleteDoc,
  query,
  where,
  Timestamp,
  Query,
  DocumentData,
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
  signOut,
  deleteUser,
  onAuthStateChanged,
} from '@angular/fire/auth';
import {
  browserSessionPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

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
export class AuthService {
  public user$: Observable<User | null>;
  private userSubscription?: Subscription;
  currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    null
  );

  /**
   * Constructs an instance of the AuthService.
   * @param {Auth} auth - The authentication service dependency provided by Firebase.
   * @param {Router} router - The Angular Router for navigating between routes.
   * @param {Firestore} firestore - The Firestore database service provided by Firebase.
   */
  constructor(
    public auth: Auth,
    public router: Router,
    public storageService: StorageService,
    private firestore: Firestore
  ) {
    this.user$ = new Observable((subscriber) => {
      const unsubscribe = onAuthStateChanged(this.auth, subscriber);
      return unsubscribe;
    });
    this.initCurrentUser();
    this.initializePersistence();
  }

  user_images: string[] = [
    '../assets/img/avatar1.svg',
    '../assets/img/avatar2.svg',
    '../assets/img/avatar3.svg',
    '../assets/img/avatar4.svg',
    '../assets/img/avatar5.svg',
    '../assets/img/avatar6.svg',
  ];

  async initializePersistence() {
    this.user$
      .pipe(
        switchMap((user) => (user ? this.getUserData(user.uid) : of(null))),
        take(1)
      )
      .subscribe((userData) => this.setPersistenceBasedOnUserData(userData));
  }

  async setPersistenceBasedOnUserData(userData: any) {
    if (!userData) return;

    try {
      const isGuest = userData.displayName === 'Guest';
      await this.auth.setPersistence(
        isGuest ? browserSessionPersistence : browserLocalPersistence
      );
      console.log(
        isGuest
          ? 'Set persistence for Guest-User!'
          : 'Set standard persistence!'
      );
    } catch (error) {
      console.error("Couldn't set persistence", error);
    }
  }

  getRandomGuestImage(): string {
    const randomIndex = Math.floor(Math.random() * this.user_images.length);
    return this.user_images[randomIndex];
  }

  initCurrentUser(): void {
    this.user$
      .pipe(
        switchMap((firebaseUser) =>
          firebaseUser?.uid ? this.getUserData(firebaseUser.uid) : of(null)
        )
      )
      .subscribe((user) => {
        this.currentUser.next(user);
      });
  }

  get currentUserValue(): User | null {
    return this.currentUser.value;
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
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      if (userCredential.user) {
        await this.setUserOnlineStatus(userCredential.user.uid, true);
        const lastRoute =
          localStorage.getItem('lastRoute') ||
          'main/channel/tcgLB0MdDpTD27cGTU95';
        this.router.navigate([lastRoute]);
        console.log(lastRoute);
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
  async signUp(
    displayName: string,
    email: string,
    password: string,
    selectedAvatarURL: string
  ) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName,
          photoURL: selectedAvatarURL,
        });
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
    try {
      const userCredential = await signInAnonymously(this.auth);
      const randomImageURL = this.getRandomGuestImage();
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: 'Guest',
          photoURL: randomImageURL,
        });
        await this.setUserData(userCredential.user, true);
        const lastRoute =
          localStorage.getItem('lastRoute') ||
          'main/channel/tcgLB0MdDpTD27cGTU95';
        this.router.navigate([lastRoute]);
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
        await this.setUserData(user, true);
        const lastRoute =
          localStorage.getItem('lastRoute') ||
          'main/channel/tcgLB0MdDpTD27cGTU95';
        this.router.navigate([lastRoute]);
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
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      if (currentUser.displayName === 'Guest') {
        await this.deleteGuestUser(currentUser.uid);
      } else {
        await this.setUserOnlineStatus(currentUser.uid, false);
      }
    }
    await signOut(this.auth);
    this.router.navigate(['login']);
  }

  async deleteGuestUser(uid: string) {
    try {
      if (this.auth.currentUser && this.auth.currentUser.uid === uid) {
        await deleteUser(this.auth.currentUser);
      }
      await deleteDoc(doc(this.firestore, 'users', uid));
      this.userSubscription?.unsubscribe();
    } catch (error) {
      console.error('Error during deleting guest user:', error);
    }
  }

  async setUserData(user: FirebaseUser, isOnline?: boolean) {
    const { uid, email, displayName, emailVerified, photoURL } = user;
    const userData: User = {
      uid,
      email: email || null,
      displayName: displayName || null,
      displayNameLower: displayName?.toLowerCase() || null,
      emailVerified,
      photoURL,
      lastActive: Timestamp.now(),
      ...(typeof isOnline !== 'undefined' && { isOnline }),
    };
    await setDoc(doc(this.firestore, `users/${uid}`), userData);
    return userData;
  }

  async updateUser(uid: string, data: Partial<User>) {
    try {
      await updateDoc(doc(this.firestore, `users/${uid}`), data);
    } catch (error) {
      console.error('Error updating user data: ', error);
      throw error;
    }
  }

  /**
   * Fetches the online status of a user from Firestore based on their UID.
   * @param {string} uid - The UID of the user.
   * @returns {Observable<boolean>} Observable that emits the online status of the user.
   */
  getUserData(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return docData(userDocRef).pipe(
      map((data: any): User | null => {
        if (!data) return null;
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          emailVerified: data.emailVerified,
          isOnline: data.isOnline,
          photoURL: data.photoURL,
          hasUnreadMessages: data.hasUnreadMessages || [],
        };
      })
    );
  }

  mapFirestoreDataToUsers(userQuery: Query<DocumentData>): Observable<User[]> {
    return collectionData(userQuery).pipe(
      map((usersData) =>
        usersData.map(
          (data) =>
            ({
              uid: data['uid'],
              email: data['email'],
              displayName: data['displayName'],
              displayNameLower: data['displayNameLower'],
              emailVerified: data['emailVerified'],
              isOnline: data['isOnline'],
              photoURL: data['photoURL'],
              lastActive: data['lastActive'],
              hasUnreadMessages: data['hasUnreadMessages'],
            } as User)
        )
      )
    );
  }

  getUsers(searchTerm?: string): Observable<User[]> {
    let userQuery;
    if (searchTerm) {
      const lowerCaseTerm = searchTerm.toLowerCase();
      userQuery = query(
        collection(this.firestore, 'users'),
        where('displayNameLower', '>=', lowerCaseTerm),
        where('displayNameLower', '<=', lowerCaseTerm + '\uf8ff')
      );
    } else {
      userQuery = collection(this.firestore, 'users');
    }
    return this.mapFirestoreDataToUsers(userQuery);
  }

  getUsersWithEmail(searchTerm?: string): Observable<User[]> {
    let userQuery;
    if (searchTerm) {
      const lowerCaseTerm = searchTerm.toLowerCase();
      userQuery = query(
        collection(this.firestore, 'users'),
        where('email', '>=', lowerCaseTerm),
        where('email', '<=', lowerCaseTerm + '\uf8ff')
      );
    } else {
      userQuery = collection(this.firestore, 'users');
    }
    return this.mapFirestoreDataToUsers(userQuery);
  }

  getInactiveGuestUsers(): Observable<User[]> {
    const dateOneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const firestoreTimestampOneHourAgo = Timestamp.fromDate(dateOneHourAgo);
    const userQuery = query(
      collection(this.firestore, 'users'),
      where('displayName', '==', 'Guest'),
      where('lastActive', '<=', firestoreTimestampOneHourAgo)
    );

    return this.mapFirestoreDataToUsers(userQuery);
  }

  /**
   * Sets or updates the online status of the user in Firestore.
   * @async
   * @param {FirebaseUser} user - The user object from Firebase Authentication.
   * @param {boolean} isOnline - The online status to be set for the user.
   * @returns {User} The data structure that was set in Firestore.
   */
  async setUserOnlineStatus(uid: string, isOnline: boolean) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, {
      isOnline: isOnline,
      lastActive: Timestamp.now(),
    });
  }

  updateLastActive(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    updateDoc(userRef, {
      lastActive: Timestamp.now(),
    });
  }
}
