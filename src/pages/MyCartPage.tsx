import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import Alert from "../components/Alert";
import LeftArrow from "../assets/leftArrow.svg?react"
import RightArrow from "../assets/rightArrow.svg?react"

export default function MyCartPage() {
  const { cartItems, totalPrice, incrementItem, decrementItem, deleteCartItem, emptyShoppingCart } = useCart();

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const handleEmpty = async () => {
    await emptyShoppingCart();
    setAlertMsg("Carrito vaciado correctamente");
    setAlertOpen(true);
  };

  return (
    <>
      <main className="container mx-auto px-4">
        <Alert message={alertMsg} open={alertOpen} onClose={() => setAlertOpen(false)} />
        <h1 className="text-center mt-10 mb-6 text-3xl text-blue font-semibold">Mi Carrito de Compras</h1>

        {cartItems.length === 0 ? (
          <p className="text-center text-blue mt-10">Tu carrito está vacío.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-5">
            <section className="lg:col-span-2 flex flex-col gap-4">
              {cartItems.map((item) => {
                const key = item.lineKey ?? `${item.id}-${item.size}-${item.color}`;
                const fallback = { id: item.id, size: item.size, color: item.color };
                return (
                  <article key={key} className="bg-neutral-300/50 backdrop-blur p-4 rounded-lg flex flex-col md:flex-row gap-4 shadow-md">
                    <div className="relative w-full md:w-[180px] aspect-[1/1]">
                      <img className="absolute inset-0 h-full w-full object-cover rounded-md" src={item.image} alt={item.name} />
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                      <div className="flex flex-col gap-5 flex-1">
                        <h2 className="text-blue text-xl font-semibold">{item.name}</h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-blue">
                          <span className="font-semibold">Color: {item.color}</span>
                          <span className="font-semibold">Talla: {item.size}</span>
                          <span className="font-semibold">Precio: ₡{item.price.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            aria-label="Disminuir cantidad"
                            onClick={() => decrementItem(item.lineKey ?? "", item.quantity, fallback)}
                          >
                            <LeftArrow className="text-pink h-7 w-7 cursor-pointer hover:scale-105"/>
                          </button>
                          <span className="min-w-8 text-center text-lg font-semibold text-blue">{item.quantity}</span>
                          <button
                            aria-label="Aumentar cantidad"
                            onClick={() => incrementItem(item)}
                          >
                            <RightArrow className="text-pink h-7 w-7 cursor-pointer hover:scale-105"/>
                          </button>
                        </div>

                        <span className="text-pink font-semibold text-lg">₡{(item.quantity * item.price).toLocaleString()}</span>

                        <button className="ml-auto md:ml-0 text-blue hover:text-pink font-semibold text-blue cursor-pointer" onClick={() => deleteCartItem(item.lineKey ?? "", fallback)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="bg-neutral-300/50 backdrop-blur p-5 rounded-lg h-fit shadow-md mb-10">
              <h3 className="text-blue text-xl font-semibold mb-3">Resumen</h3>
              <div className="flex justify-between text-blue my-5">
                <span>Artículos</span>
                <span>{cartItems.reduce((a, b) => a + b.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-blue font-semibold text-lg my-5">
                <span>Total</span>
                <span>₡{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-yellow p-2 rounded-md text-blue font-semibold hover:opacity-90 transition cursor-pointer">Finalizar compra</button>
                <button className="px-3 py-2 border-2 border-pink rounded-md text-blue font-semibold cursor-pointer hover:bg-pink/10 transition" onClick={handleEmpty}>
                  Vaciar
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

