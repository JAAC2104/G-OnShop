import { Link, NavLink, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { products } from "../components/MainShop";
import { useState } from "react";
import Footer from "../components/Footer";

const PRODUCTS = products;

export async function productLoader({ params }: LoaderFunctionArgs) {
  const { productId } = params;

  if (!productId) {
    throw new Response("Producto no encontrado", { status: 404 });
  }

  const product = PRODUCTS.find((p) => p.id === Number(productId));
  if (!product) {
    throw new Response("Producto no encontrado", { status: 404 });
  }

  await new Promise((r) => setTimeout(r, 200));

  return { product };
}

export default function ProductPage() {
  const { product } = useLoaderData();
  const [selected, setSelected] = useState("amber");

  const colors = [
    { name: "amber", class: "bg-amber-300" },
    { name: "blue", class: "bg-blue-400" },
    { name: "pink", class: "bg-pink-400" },
    { name: "green", class: "bg-green-400" },
    { name: "red", class: "bg-red-400" },
    { name: "skyBlue", class: "bg-sky-400" },
    { name: "white", class: "bg-neutral-200" },
  ];

  return (<>
    <main className="container mt-5 flex flex-col mx-auto">
        <Link to="/" className="text-blue-950 hover:text-pink-600 tranform-all duration-300 font-semibold m-2">← Volver a la tienda</Link>
    
        <section className="product flex flex-col lg:flex-row lg:gap-20 items-center mt-8 justify-center m-5">
            <img src={product.img} alt={product.name} className="w-[300px] lg:w-[400px] rounded-md shadow-md"/>

            <div className="font-semibold text-blue m-3">
                <h1 className="text-xl">{product.name}</h1>
                <p className="text-pink text-2xl">₡{product.price.toLocaleString()}</p>
                <form action="" className="flex flex-col my-7">
                  <div className="flex flex-col my-3">
                    <label htmlFor="color">Seleccione el color:</label>
                    <div className="flex gap-3 m-2">
                      {colors.map((color) => (
                        <button key={color.name} onClick={() => setSelected(color.name)} type="button" className={`h-6 w-6 rounded-full border-2 transition cursor-pointer ${color.class} ${selected === color.name ? "border-black scale-110" : "border-transparent"}`}></button>))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="talla">Seleccione la talla:</label>
                    <select name="talla" id="talla" className="border-2 border-pink rounded-md p-1 bg-neutral-100">
                      <option value="xs">XS</option>
                      <option value="s">S</option>
                      <option value="m">M</option>
                      <option value="l">L</option>
                      <option value="xl">XL</option>
                    </select>
                  </div>
                  <button className="bg-yellow p-2 rounded-md m-5 text-blue cursor-pointer" type="submit" onClick={() => alert("Producto agregado al carrito 🛒")}>Agregar al carrito</button>
                </form>
            </div>
        </section>

      <hr className="text-blue"/>

      <section className="flex flex-col items-center m-2">
  <h2 className="text-xl font-semibold text-blue m-5">Productos relacionados</h2>

  <div
    className="
      grid gap-4
      grid-cols-2
      sm:grid-cols-3
      lg:grid-cols-4
      w-full max-w-6xl
    "
  >
    {PRODUCTS.filter((p) => {
      if (p.id === product.id) return false;
      const matches = p.categories.filter((cat: string) =>
        product.categories.includes(cat)
      ).length;
      return matches >= 2;
    }).map((related) => (
      <NavLink
        key={related.id}
        to={`/p/${related.id}/${related.name}`}
        className="animate-scroll-slide-up group hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        <div
          className="
            flex flex-col mx-auto
            h-[250px] sm:h-[250px] md:h-[280px] lg:w-[250px] lg:h-[300px]
          "
        >
          <div className="relative max-h-[300px] max-w-[300px]">
            <img
              className="rounded-md w-full h-full object-cover"
              src={related.img}
              alt={related.name}
            />
            <div
              className="
                absolute bottom-0
                text-blue font-semibold bg-white/60 w-full p-1 text-center
                opacity-0 group-hover:opacity-100 transition-all duration-300
              "
            >
              Ver Producto
            </div>
          </div>
          <div className="p-2">
            <h3 className="text-center font-semibold text-blue text-sm sm:text-base">
              {related.name}
            </h3>
            <p className="text-center text-blue text-sm sm:text-base">
              ₡{related.price}
            </p>
          </div>
        </div>
      </NavLink>
    ))}
  </div>
</section>


    </main>
    <Footer/>
  </>);
}
