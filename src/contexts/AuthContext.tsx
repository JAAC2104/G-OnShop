import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { database } from "../firebase/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup, signInWithRedirect, type User, type UserCredential, getRedirectResult } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { browserPopupRedirectResolver, browserLocalPersistence, setPersistence } from "firebase/auth";

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

type AuthContextValue = {
  currentUser: User | null;
  initializing: boolean;
  signUp: (data: SignUpInput) => Promise<UserCredential>;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => void;
  signInWithGoogle: () => Promise<UserCredential | void>;
  signInWithGoogleRedirect?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setInitializing(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        ensureUserDoc(result.user);
      }
    })
    .catch(console.error);
}, []);

  async function ensureUserDoc(u: User, extra?: Partial<{ phone: string }>) {
    const ref = doc(database, "users", u.uid);
    const snap = await getDoc(ref);

    const payload = {
      uid: u.uid,
      email: u.email ?? "",
      name: u.displayName ?? "",
      photoURL: u.photoURL ?? "",
      phone: extra?.phone ?? u.phoneNumber ?? "",
      providerId: u.providerData[0]?.providerId ?? "",
      ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload, { merge: true });
  }

  async function signUp({ email, password, name, phone }: SignUpInput) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    await updateProfile(user, { displayName: name });
    await ensureUserDoc(user, { phone });
    return cred;
  }

  function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logOut() {
    signOut(auth);
  }

  async function signInWithGoogle(): Promise<UserCredential | void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  await setPersistence(auth, browserLocalPersistence);

  try {
    const cred = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    await ensureUserDoc(cred.user);
    return cred;
  } catch (e: any) {
    if (e?.code === "auth/operation-not-supported-in-this-environment" ||
        e?.code === "auth/popup-blocked" ||
        e?.code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
      return;
    }
    throw e;
  }
}

  async function signInWithGoogleRedirect(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
}

  const value: AuthContextValue = {
    currentUser,
    initializing,
    signUp,
    logIn,
    logOut,
    signInWithGoogle,
    signInWithGoogleRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
