import { createContext, useState, useMemo, useContext, useEffect, useRef } from "react";
import { database } from "../firebase/firebase";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, increment, getDocs } from "firebase/firestore";
import { useAuth } from "./AuthContext";

export type CartItem = {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
};

type ShoppingCartValue = {
  cartItems: CartItem[];
  totalPrice: number;
  getTotalItems: number;
  addCartItem: (newItem: CartItem) => Promise<void>;
  deleteCartItem: (itemId: number) => Promise<void>;
  emptyShoppingCart: () => Promise<void>;
  incrementItem: (item: CartItem) => Promise<void>;
  decrementItem: (itemId: number, currentQty: number) => Promise<void>;
};

const CART_LS_KEY = "cart";

export const CartContext = createContext<ShoppingCartValue | undefined>(undefined);
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
};

const readLocalCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    // Validación mínima
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalCart = (items: CartItem[]) => {
  localStorage.setItem(CART_LS_KEY, JSON.stringify(items));
};

const mergeByIdSumQty = (a: CartItem[], b: CartItem[]) => {
  const map = new Map<number, CartItem>();
  const add = (it: CartItem) => {
    const prev = map.get(it.id);
    if (!prev) map.set(it.id, { ...it });
    else map.set(it.id, { ...prev, quantity: prev.quantity + it.quantity });
  };
  a.forEach(add);
  b.forEach(add);
  return Array.from(map.values());
};

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);
  const didMigrateRef = useRef(false);

  useEffect(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    if (!currentUser) {
      didMigrateRef.current = false;
      const local = readLocalCart();
      setCartItems(local);
      return;
    }

    const colRef = collection(database, "users", currentUser.uid, "cart");

    (async () => {
      if (!didMigrateRef.current) {
        didMigrateRef.current = true;
        const local = readLocalCart();
        if (local.length > 0) {
          const snap = await getDocs(colRef);
          const remote = snap.docs.map(d => d.data() as CartItem);
          const merged = mergeByIdSumQty(remote, local);

          for (const it of merged) {
            const ref = doc(database, "users", currentUser.uid, "cart", String(it.id));
            await setDoc(ref, it, { merge: true });
          }

          for (const it of local) {
            const ref = doc(database, "users", currentUser.uid, "cart", String(it.id));
            const existing = await getDoc(ref);
            if (existing.exists()) {
              await setDoc(ref, { quantity: increment(it.quantity) }, { merge: true });
            } else {
              await setDoc(ref, it);
            }
          }

          writeLocalCart([]);
        }
      }

      unsubRef.current = onSnapshot(colRef, (snap) => {
        const items = snap.docs.map(d => d.data() as CartItem);
        setCartItems(items);
      });
    })();

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      writeLocalCart(cartItems);
    }
  }, [cartItems, currentUser]);

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const getTotalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const addCartItem = async (newItem: CartItem) => {
    if (!currentUser) {
      setCartItems((prev) => {
        const idx = prev.findIndex(p => p.id === newItem.id);
        if (idx === -1) return [...prev, newItem];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + newItem.quantity };
        return copy;
      });
      return;
    }

    const ref = doc(database, "users", currentUser.uid, "cart", String(newItem.id));
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await setDoc(ref, { quantity: increment(newItem.quantity) }, { merge: true });
    } else {
      await setDoc(ref, newItem);
    }
  };

  const deleteCartItem = async (itemId: number) => {
    if (!currentUser) {
      setCartItems(prev => prev.filter(p => p.id !== itemId));
      return;
    }
    await deleteDoc(doc(database, "users", currentUser.uid, "cart", String(itemId)));
  };

  const emptyShoppingCart = async () => {
    if (!currentUser) {
      setCartItems([]);
      return;
    }
    const colRef = collection(database, "users", currentUser.uid, "cart");
    const snap = await getDocs(colRef);
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  };

  const incrementItem = async (item: CartItem) => {
    if (!currentUser) {
      setCartItems(prev =>
        prev.map(p => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p))
      );
      return;
    }
    const ref = doc(database, "users", currentUser.uid, "cart", String(item.id));
    await setDoc(ref, { quantity: increment(1) }, { merge: true });
  };

  const decrementItem = async (itemId: number, currentQty: number) => {
    if (!currentUser) {
      setCartItems(prev => {
        const item = prev.find(p => p.id === itemId);
        if (!item) return prev;
        if (item.quantity <= 1) return prev.filter(p => p.id !== itemId);
        return prev.map(p => (p.id === itemId ? { ...p, quantity: p.quantity - 1 } : p));
      });
      return;
    }
    const ref = doc(database, "users", currentUser.uid, "cart", String(itemId));
    if (currentQty <= 1) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { quantity: increment(-1) }, { merge: true });
    }
  };

  const value: ShoppingCartValue = {
    cartItems,
    totalPrice,
    getTotalItems,
    addCartItem,
    deleteCartItem,
    emptyShoppingCart,
    incrementItem,
    decrementItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
