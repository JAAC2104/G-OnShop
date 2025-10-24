import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { database } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";

type UserProfile = {
  email: string;
  name: string;
  phone: string;
  address: string;
  createdAt: any;
};

export function useUserProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const ref = doc(database, "users", currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    });
    return unsub;
  }, [currentUser]);

  return profile;
}