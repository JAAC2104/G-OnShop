import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { database } from "../firebase/firebase";
import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, type User, type UserCredential,} from "firebase/auth";
import {doc, setDoc, serverTimestamp,} from "firebase/firestore";

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

type AuthContextValue = {
    currentUser: User | null;
    signUp: (data: SignUpInput) => Promise<UserCredential>;
    logIn: (email: string, password: string) => Promise<UserCredential>;
    logOut: () => void
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return unsub;
  }, []);

  async function signUp({ email, password, name, phone }: SignUpInput) {

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await updateProfile(user, { displayName: name });

    await setDoc(doc(database, "users", user.uid), {
      uid: user.uid,
      email,
      name,
      phone,        
      createdAt: serverTimestamp(),
    });

    return cred;
  }

  function logIn(email: string, password: string){
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logOut() {
        signOut(auth);
    }

  const value: AuthContextValue = {
     currentUser, 
     signUp, 
     logIn,
     logOut 
    };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}