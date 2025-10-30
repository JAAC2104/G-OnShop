import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, database } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  onIdTokenChanged,
  type User,
  type UserCredential,
  deleteUser,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, getDocs, deleteDoc, collection } from "firebase/firestore";

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
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
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential | void>;
  deleteAccount: (opts?: { password?: string }) => Promise<void>;
  updateUser: (data: UpdateUserInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, (user) => {
      setCurrentUser(user);
      setInitializing(false);
    });
    getRedirectResult(auth).catch(console.error);

    return unsub;
  }, []);

  async function ensureUserDoc(u: User, extra?: Partial<{ phone: string; address: string }>) {
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
    await updateProfile(cred.user, { displayName: name });
    await ensureUserDoc(cred.user, { phone, address });
    return cred;
  }

  function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logOut() {
    return signOut(auth);
  }

  async function signInWithGoogle(): Promise<UserCredential | void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    await ensureUserDoc(cred.user);
    return cred;
  }

  async function deleteUserData(uid: string) {
    const cartCol = collection(database, "users", uid, "cart");
    const cartSnap = await getDocs(cartCol);
    await Promise.all(cartSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(database, "users", uid));
  }

  async function deleteAccount(opts?: { password?: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado.");

    const providerId = user.providerData[0]?.providerId;

    if (providerId === "password") {
      if (!user.email) throw new Error("No hay correo electrónico para reautenticación.");
      const password = opts?.password ?? prompt("Introduce tu contraseña para eliminar la cuenta:");
      if (!password) throw new Error("Operación cancelada.");
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
    } else if (providerId === "google.com") {
      const googleProvider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, googleProvider);
    }

    await deleteUserData(user.uid);
    await deleteUser(user);
    await signOut(auth);
  }

  async function updateUser(data: UpdateUserInput): Promise<void> {
    const u = auth.currentUser;
    if (!u) throw new Error("Debes iniciar sesión.");

    if (data.name) await updateProfile(u, { displayName: data.name });

    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.name) payload.name = data.name;
    if (data.phone) payload.phone = data.phone;
    if (data.address) payload.address = data.address;

    await setDoc(doc(database, "users", u.uid), payload, { merge: true });
    setCurrentUser({ ...u, displayName: data.name ?? u.displayName });
  }

  const value: AuthContextValue = {
    currentUser,
    initializing,
    signUp,
    logIn,
    logOut,
    signInWithGoogle,
    deleteAccount,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
