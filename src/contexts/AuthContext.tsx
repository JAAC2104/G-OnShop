import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { database } from "../firebase/firebase";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onIdTokenChanged, type User, type UserCredential, deleteUser, reauthenticateWithRedirect, reauthenticateWithPopup, reauthenticateWithCredential, browserLocalPersistence, setPersistence, EmailAuthProvider} from "firebase/auth";
import {doc, setDoc, serverTimestamp, getDoc, getDocs, deleteDoc, collection} from "firebase/firestore";

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string
};

type UpdateUserInput = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

type AuthContextValue = {
  currentUser: User | null;
  initializing: boolean;
  signUp: (data: SignUpInput) => Promise<UserCredential>;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => void;
  signInWithGoogle: () => Promise<UserCredential | void>;
  signInWithGoogleRedirect?: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateUser: (data: UpdateUserInput) => Promise<void>;
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
  const unsub = onIdTokenChanged(auth, (user) => {
    setCurrentUser(user);
    setInitializing(false);
  });

  getRedirectResult(auth)
    .then((res) => {
      if (res?.user) ensureUserDoc(res.user);
    })
    .catch(console.error);

  return unsub;
}, []);

  async function ensureUserDoc(u: User, extra?: Partial<{ phone: string, address: string }>) {
    const ref = doc(database, "users", u.uid);
    const snap = await getDoc(ref);

    const payload = {
      uid: u.uid,
      email: u.email ?? "",
      name: u.displayName ?? "",
      photoURL: u.photoURL ?? "",
      ...(extra?.address ? { address: extra.address } : {}),
      ...(extra?.phone ? { phone: extra.phone } : {}),
      providerId: u.providerData[0]?.providerId ?? "",
      ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload, { merge: true });
  }

  async function signUp({ email, password, name, phone, address }: SignUpInput) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    await updateProfile(user, { displayName: name });
    await ensureUserDoc(user, { phone, address });
    return cred;
  }

  function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logOut() {
    signOut(auth);
  }

  function shouldUseRedirect() {
    const ua = navigator.userAgent || "";
    const inApp = /(FBAN|FBAV|Instagram|Line|MicroMessenger|OkHttp|Twitter|TikTok|Pinterest)/i.test(ua);
    const iOS = /iPhone|iPad|iPod/i.test(ua);
    return inApp || iOS;
  }

  async function signInWithGoogle(): Promise<UserCredential | void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    await setPersistence(auth, browserLocalPersistence);

    try {
      const cred = await signInWithPopup(auth, provider);
      await ensureUserDoc(cred.user);
      return cred;
    } catch (e: any) {
      if (
        e?.code === "auth/operation-not-supported-in-this-environment" ||
        e?.code === "auth/popup-blocked" ||
        e?.code === "auth/popup-closed-by-user"
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw e;
    }
  }

  async function signInWithGoogleRedirect(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(auth, provider);
  }

  async function deleteUserData(uid: string) {
    const cartCol = collection(database, "users", uid, "cart");
    const cartSnap = await getDocs(cartCol);
    await Promise.all(cartSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(database, "users", uid));
  }

  async function reauthenticateIfNeeded(user: User, opts?: { password?: string }) {
    try {
      await deleteUser(user);
    } catch (err: any) {
      if (err?.code !== "auth/requires-recent-login") throw err;
      const providerId = user.providerData[0]?.providerId;

      if (providerId === "password") {
        if (!opts?.password || !user.email) {
          throw new Error("Se requiere re-autenticación: proporciona la contraseña del usuario.");
        }
        const cred = EmailAuthProvider.credential(user.email, opts.password);
        await reauthenticateWithCredential(user, cred);
      } else if (providerId === "google.com") {
        const googleProvider = new GoogleAuthProvider();
        try {
          await reauthenticateWithPopup(user, googleProvider);
        } catch (e: any) {
          await reauthenticateWithRedirect(user, googleProvider);
          return;
        }
      } else {
        throw new Error("Proveedor no soportado para re-autenticación en cliente.");
      }
      await deleteUser(user);
    }
  }

  async function deleteAccount(opts?: { password?: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado.");
    await deleteUserData(user.uid);
    await reauthenticateIfNeeded(user, { password: opts?.password });
    await signOut(auth);
  }

  async function updateUser(data: UpdateUserInput): Promise<void> {
  const u = auth.currentUser;
  if (!u) throw new Error("Debes iniciar sesión.");

  const needsAuthProfile =
    (typeof data.name === "string" && data.name.trim().length > 0)

  if (needsAuthProfile) {
    await updateProfile(u, {
      displayName: data.name ?? u.displayName ?? undefined
    });
  }

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (typeof data.name === "string") payload["name"] = data.name;
  if (typeof data.phone === "string") payload["phone"] = data.phone;
  if (typeof data.address === "string") payload["address"] = data.address;
  await setDoc(doc(database, "users", u.uid), payload, { merge: true });
  if (typeof data.name === "string") {
    setCurrentUser({ ...u, displayName: data.name ?? u.displayName});
  }
}

  const value: AuthContextValue = {
    currentUser,
    initializing,
    signUp,
    logIn,
    logOut,
    signInWithGoogle,
    signInWithGoogleRedirect,
    deleteAccount,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
