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
  size: string;
  color: string;
  lineKey?: string;
};

type ShoppingCartValue = {
  cartItems: CartItem[];
  totalPrice: number;
  getTotalItems: number;
  addCartItem: (newItem: CartItem) => Promise<void>;
  deleteCartItem: (lineKey: string, fallback?: { id: number; size: string; color: string }) => Promise<void>;
  emptyShoppingCart: () => Promise<void>;
  incrementItem: (item: CartItem) => Promise<void>;
  decrementItem: (lineKey: string, currentQty: number, fallback?: { id: number; size: string; color: string }) => Promise<void>;
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

const variantKey = (it: Pick<CartItem, "id" | "size" | "color">): string =>
  `${it.id}__${(it.size || "").trim().toLowerCase()}__${(it.color || "").trim().toLowerCase()}`;

const isSameVariant = (a: CartItem, b: CartItem) =>
  a.id === b.id && a.size === b.size && a.color === b.color;

const mergeByVariantSumQty = (a: CartItem[], b: CartItem[]) => {
  const map = new Map<string, CartItem>();
  const add = (it: CartItem) => {
    const key = variantKey(it);
    const prev = map.get(key);
    if (!prev) map.set(key, { ...it });
    else map.set(key, { ...prev, quantity: prev.quantity + it.quantity });
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
          const remote = snap.docs.map(d => ({ ...(d.data() as CartItem), lineKey: d.id }));
          const merged = mergeByVariantSumQty(remote, local);

          for (const it of merged) {
            const key = it.lineKey ?? variantKey(it);
            const ref = doc(database, "users", currentUser.uid, "cart", key);
            await setDoc(ref, { ...it, lineKey: key }, { merge: true });
          }

          writeLocalCart([]);
        }
      }

      unsubRef.current = onSnapshot(colRef, (snap) => {
        const items = snap.docs.map(d => ({ ...(d.data() as CartItem), lineKey: d.id }));
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
        const idx = prev.findIndex(p => isSameVariant(p, newItem));
        if (idx === -1) return [...prev, newItem];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + newItem.quantity };
        return copy;
      });
      return;
    }

    const key = variantKey(newItem);
    const ref = doc(database, "users", currentUser.uid, "cart", key);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await setDoc(ref, { quantity: increment(newItem.quantity) }, { merge: true });
    } else {
      await setDoc(ref, { ...newItem, lineKey: key });
    }
  };

  const deleteCartItem = async (lineKey: string, fallback?: { id: number; size: string; color: string }) => {
    if (!currentUser) {
      setCartItems(prev => prev.filter(p => (p.lineKey ?? variantKey(p)) !== (lineKey || (fallback ? variantKey(fallback as any) : ""))));
      return;
    }
    const key = lineKey || (fallback ? variantKey(fallback as any) : "");
    if (!key) return;
    await deleteDoc(doc(database, "users", currentUser.uid, "cart", key));
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
        prev.map(p => ((p.lineKey ?? variantKey(p)) === (item.lineKey ?? variantKey(item)) ? { ...p, quantity: p.quantity + 1 } : p))
      );
      return;
    }
    const key = item.lineKey ?? variantKey(item);
    const ref = doc(database, "users", currentUser.uid, "cart", key);
    await setDoc(ref, { quantity: increment(1) }, { merge: true });
  };

  const decrementItem = async (lineKey: string, currentQty: number, fallback?: { id: number; size: string; color: string }) => {
    if (!currentUser) {
      setCartItems(prev => {
        const targetKey = lineKey || (fallback ? variantKey(fallback as any) : "");
        const item = prev.find(p => (p.lineKey ?? variantKey(p)) === targetKey);
        if (!item) return prev;
        if (item.quantity <= 1) return prev.filter(p => (p.lineKey ?? variantKey(p)) !== targetKey);
        return prev.map(p => ((p.lineKey ?? variantKey(p)) === targetKey ? { ...p, quantity: p.quantity - 1 } : p));
      });
      return;
    }
    const key = lineKey || (fallback ? variantKey(fallback as any) : "");
    if (!key) return;
    const ref = doc(database, "users", currentUser.uid, "cart", key);
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
