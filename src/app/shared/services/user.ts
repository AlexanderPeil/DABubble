export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
    isOnline?: boolean; 
    photoURL: string | null | undefined;
}