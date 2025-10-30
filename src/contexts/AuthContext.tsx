import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { auth, database } from "../firebase/firebase";
import {
  // login/registro básicos
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  // Google
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  // sesión
  onIdTokenChanged,
  // tipos
  type User, type UserCredential,
  // eliminar cuenta + reauth
  deleteUser,
  reauthenticateWithRedirect,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, getDocs, deleteDoc, collection } from "firebase/firestore";

type SignUpInput = {
  email: string; password: string; name: string; phone: string; address: string;
};
type UpdateUserInput = {
  name?: string; email?: string; phone?: string; address?: string;
};

type AuthContextValue = {
  currentUser: User | null;
  initializing: boolean;
  signUp: (data: SignUpInput) => Promise<UserCredential>;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
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

const PENDING_DELETE_KEY = "__PENDING_DELETE_ACCOUNT__";
const RETURN_TO_KEY = "__AUTH_RETURN_TO__";

function isIOSOrIPadOS(): boolean {
  const ua = navigator.userAgent || "";
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS13Plus = (navigator as any).platform === "MacIntel" && (navigator as any).maxTouchPoints > 1;
  return isIOSDevice || isIPadOS13Plus;
}
function isStandalonePWA(): boolean {
  const iosStandalone = (navigator as any).standalone === true;
  const displayModeStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  return iosStandalone || displayModeStandalone;
}
function isEmbeddedBrowser(): boolean {
  const ua = (navigator.userAgent || "").toLowerCase();
  return /(fbav|fban|instagram|line\/|twitter|tiktok|snapchat|; wv;|webview|duckduckgo|gsa|miuibrowser|heytapbrowser|oppobrowser|opxbrowser)/.test(ua);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const hasProcessedPendingDelete = useRef(false);

  useEffect(() => {
    (async () => {
      // 🔸 En SDK modernos existe authStateReady; si no, simplemente sigue.
      await (auth as any).authStateReady?.();

      // 1) Procesa el resultado del redirect (si lo hay)
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) await ensureUserDoc(res.user);
      } catch (e) {
        console.error("[auth] getRedirectResult error:", e);
      }

      // 2) Mantén la sesión sincronizada
      const unsub = onIdTokenChanged(auth, async (user) => {
        setCurrentUser(user);
        setInitializing(false);

        // Si veníamos de reauth para eliminar cuenta vía redirect
        if (!user && hasProcessedPendingDelete.current) {
          hasProcessedPendingDelete.current = false;
        }
        if (user && !hasProcessedPendingDelete.current && localStorage.getItem(PENDING_DELETE_KEY)) {
          hasProcessedPendingDelete.current = true;
          try {
            await performFinalAccountDeletion(user);
          } finally {
            localStorage.removeItem(PENDING_DELETE_KEY);
          }
        }
      });

      return () => unsub();
    })();
  }, []);

  // ---------- Helpers ----------
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
      const password = opts?.password ?? window.prompt("Para eliminar tu cuenta, introduce tu contraseña") ?? "";
      if (!password) throw new Error("Se canceló la reautenticación.");
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
      return "password" as const;
    }

    if (providerId === "google.com") {
      const googleProvider = new GoogleAuthProvider();
      try {
        if (isIOSOrIPadOS() || isStandalonePWA() || isEmbeddedBrowser()) {
          localStorage.setItem(PENDING_DELETE_KEY, "1");
          await reauthenticateWithRedirect(user, googleProvider);
          return "redirect" as const;
        }
        await reauthenticateWithPopup(user, googleProvider);
        return "popup" as const;
      } catch {
        localStorage.setItem(PENDING_DELETE_KEY, "1");
        await reauthenticateWithRedirect(user, googleProvider);
        return "redirect" as const;
      }
    }

    throw new Error("Proveedor no soportado para re-autenticación.");
  }

  // ---------- Métodos públicos ----------
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

    // iOS / PWA / webview → redirect directo
    if (isIOSOrIPadOS() || isStandalonePWA() || isEmbeddedBrowser()) {
      try { sessionStorage.setItem(RETURN_TO_KEY, "/usuario"); localStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
      await signInWithRedirect(auth, provider); // ✅ sin tercer argumento
      return;
    }

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
        try { sessionStorage.setItem(RETURN_TO_KEY, "/usuario"); localStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
        await signInWithRedirect(auth, provider); // ✅ sin tercer argumento
        return;
      }
      throw e;
    }
  }

  async function signInWithGoogleRedirect(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try { sessionStorage.setItem(RETURN_TO_KEY, "/usuario"); localStorage.setItem(RETURN_TO_KEY, "/usuario"); } catch {}
    await signInWithRedirect(auth, provider); // ✅
  }

  async function deleteAccount(opts?: { password?: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado.");
    const mode = await reauthenticateUser(user, { password: opts?.password });
    if (mode === "redirect") return; // volverá del redirect y se procesará en onIdTokenChanged
    await performFinalAccountDeletion(user);
  }

  async function updateUser(data: UpdateUserInput): Promise<void> {
    const u = auth.currentUser;
    if (!u) throw new Error("Debes iniciar sesión.");

    // Actualiza perfil de Auth si cambia el nombre
    if (typeof data.name === "string" && data.name.trim()) {
      await updateProfile(u, { displayName: data.name });
    }

    // Actualiza Firestore
    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.address !== undefined) payload.address = data.address;

    await setDoc(doc(database, "users", u.uid), payload, { merge: true });

    // Refleja el displayName en el estado local
    if (typeof data.name === "string") {
      setCurrentUser({ ...u, displayName: data.name });
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
