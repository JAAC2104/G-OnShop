import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "../firebase/firebase";
import { database } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onIdTokenChanged,
  type User,
  type UserCredential,
  deleteUser,
  reauthenticateWithRedirect,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  setPersistence,
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
  logOut: () => void;
  signInWithGoogle: () => Promise<UserCredential | void>;
  signInWithGoogleRedirect?: () => Promise<void>;
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

  const PENDING_DELETE_KEY = "__PENDING_DELETE_ACCOUNT__";
  const RETURN_TO_KEY = "__AUTH_RETURN_TO__";

  function isIOSOrIPadOS(): boolean {
    try {
      const ua = navigator.userAgent || "";
      const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
      const isIPadOS13Plus = navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1;
      return isIOSDevice || isIPadOS13Plus;
    } catch {
      return false;
    }
  }

  function isStandalonePWA(): boolean {
    try {
      const iosStandalone = (navigator as any).standalone === true;
      const displayModeStandalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
      return !!(iosStandalone || displayModeStandalone);
    } catch {
      return false;
    }
  }

  function isEmbeddedBrowser(): boolean {
    try {
      const ua = (navigator.userAgent || "").toLowerCase();
      const patterns = [
        "fbav",
        "fban",
        "instagram",
        "line/",
        "twitter",
        "tiktok",
        "snapchat",
        "; wv;",
        "webview",
        "duckduckgo",
        "gsa",
        "miuibrowser",
        "heytapbrowser",
        "oppobrowser",
        "opxbrowser",
      ];
      return patterns.some((p) => ua.includes(p));
    } catch {
      return false;
    }
  }

  useEffect(() => {
  const unsub = onIdTokenChanged(auth, (user) => {
    setCurrentUser(user);
    setInitializing(false);
  });

  getRedirectResult(auth)
    .then(res => { if (res?.user) ensureUserDoc(res.user); })
    .catch(console.error);

  return unsub;
}, []);

  async function ensureUserDoc(u: User, extra?: Partial<{ phone: string; address: string }>) {
    const ref = doc(database, "users", u.uid);
    const snap = await getDoc(ref);

    const payload: Record<string, unknown> = {
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

  async function setBestPersistence() {
    try {
      await setPersistence(auth, browserLocalPersistence);
      return;
    } catch {}
    try {
      await setPersistence(auth, browserSessionPersistence);
      return;
    } catch {}
    await setPersistence(auth, inMemoryPersistence);
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
    signOut(auth).catch((err) => console.error("signOut error:", err));
  }

  async function signInWithGoogle(): Promise<UserCredential | void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    await setBestPersistence();

    try {
      if (isIOSOrIPadOS() || isStandalonePWA() || isEmbeddedBrowser()) {
        try { sessionStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
        try { localStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
        try { localStorage.setItem("__AUTH_DBG__onRedirect", JSON.stringify({ ts: Date.now(), note: "redirect-start" })); } catch {}
        await signInWithRedirect(auth, provider);
        return;
      }
    } catch (err) {
      console.error("pre-redirect detection error:", err);
    }

    try {
      const cred = await signInWithPopup(auth, provider);
      try {
        await ensureUserDoc(cred.user);
      } catch (err) {
        console.error("ensureUserDoc after popup error:", err);
      }
      return cred;
    } catch (e: any) {
      if (
        e?.code === "auth/operation-not-supported-in-this-environment" ||
        e?.code === "auth/popup-blocked" ||
        e?.code === "auth/popup-closed-by-user"
      ) {
        try { sessionStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
        try { localStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
        try { localStorage.setItem("__AUTH_DBG__onRedirect", JSON.stringify({ ts: Date.now(), note: "popup-fallback-redirect" })); } catch {}
        await signInWithRedirect(auth, provider);
        return;
      }
      throw e;
    }
  }

  async function signInWithGoogleRedirect(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await setBestPersistence();
    try { sessionStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
    try { localStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
    try { localStorage.setItem("__AUTH_DBG__onRedirect", JSON.stringify({ ts: Date.now(), note: "explicit-redirect" })); } catch {}
    await signInWithRedirect(auth, provider);
  }

  async function deleteUserData(uid: string) {
    const cartCol = collection(database, "users", uid, "cart");
    const cartSnap = await getDocs(cartCol);
    await Promise.all(cartSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(database, "users", uid));
  }

  async function performFinalAccountDeletion(user: User) {
    await deleteUserData(user.uid);
    await deleteUser(user);
    try { await signOut(auth); } catch {}
  }

  async function reauthenticateUser(user: User, opts?: { password?: string }) {
    const providerId = user.providerData[0]?.providerId;

    if (providerId === "password") {
      if (!user.email) throw new Error("No email available for reauth.");
      const password = opts?.password ?? window.prompt("Para eliminar tu cuenta, introduce tu contrasena") ?? "";
      if (!password) throw new Error("Se cancelo la reautenticacion.");
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
      return "password" as const;
    }

    if (providerId === "google.com") {
      const googleProvider = new GoogleAuthProvider();
      try {
        if (isIOSOrIPadOS() || isStandalonePWA() || isEmbeddedBrowser()) {
          try { localStorage.setItem(PENDING_DELETE_KEY, "1"); } catch {}
          await reauthenticateWithRedirect(user, googleProvider);
          return "redirect" as const;
        }
        await reauthenticateWithPopup(user, googleProvider);
        return "popup" as const;
      } catch (e: any) {
        try { localStorage.setItem(PENDING_DELETE_KEY, "1"); } catch {}
        await reauthenticateWithRedirect(user, googleProvider);
        return "redirect" as const;
      }
    }

    throw new Error("Proveedor no soportado para re-autenticacion.");
  }

  async function deleteAccount(opts?: { password?: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado.");

    const mode = await reauthenticateUser(user, { password: opts?.password });
    if (mode === "redirect") return;
    await performFinalAccountDeletion(user);
  }

  async function updateUser(data: UpdateUserInput): Promise<void> {
    const u = auth.currentUser;
    if (!u) throw new Error("Debes iniciar sesion.");

    const needsAuthProfile = typeof data.name === "string" && data.name.trim().length > 0;

    if (needsAuthProfile) {
      await updateProfile(u, { displayName: data.name ?? u.displayName ?? undefined });
    }

    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (typeof data.name === "string") payload["name"] = data.name;
    if (typeof data.phone === "string") payload["phone"] = data.phone;
    if (typeof data.address === "string") payload["address"] = data.address;
    await setDoc(doc(database, "users", u.uid), payload, { merge: true });
    if (typeof data.name === "string") {
      setCurrentUser({ ...u, displayName: data.name ?? u.displayName });
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
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
