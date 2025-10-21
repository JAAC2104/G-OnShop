import { useState } from "react"
import { NavLink } from "react-router"

type Gender = 'mujer' | 'hombre'
type Section = 'superior' | 'inferior'
type Category = Gender | Section

type Filter =
  | 'todo'
  | Gender
  | `${Section} ${Gender}`

type Product = {
  id: number
  name: string
  price: number
  categories: Category[]
  img: string
}

export const products: Product[] = [
  { id: 1, name: 'Camiseta deportiva mujer', price: 13500, categories: ['mujer', 'superior'], img: 'https://picsum.photos/300/300?1' },
  { id: 2, name: 'Camiseta deportiva hombre', price: 14200, categories: ['hombre', 'superior'], img: 'https://picsum.photos/300/300?2' },
  { id: 3, name: 'Leggings de compresión mujer', price: 18500, categories: ['mujer', 'inferior'], img: 'https://picsum.photos/300/300?3' },
  { id: 4, name: 'Shorts deportivos hombre', price: 11500, categories: ['hombre', 'inferior'], img: 'https://picsum.photos/300/300?4' },
  { id: 5, name: 'Top deportivo mujer', price: 9800, categories: ['mujer', 'superior'], img: 'https://picsum.photos/300/300?5' },
  { id: 6, name: 'Sudadera térmica hombre', price: 21000, categories: ['hombre', 'superior'], img: 'https://picsum.photos/300/300?6' },
  { id: 7, name: 'Sudadera térmica mujer', price: 19900, categories: ['mujer', 'superior'], img: 'https://picsum.photos/300/300?7' },
  { id: 8, name: 'Pantalones deportivos mujer', price: 16700, categories: ['mujer', 'inferior'], img: 'https://picsum.photos/300/300?8' },
  { id: 9, name: 'Joggers deportivos hombre', price: 17500, categories: ['hombre', 'inferior'], img: 'https://picsum.photos/300/300?9' },
  { id: 10, name: 'Camiseta sin mangas hombre', price: 9500, categories: ['hombre', 'superior'], img: 'https://picsum.photos/300/300?10' },
  { id: 11, name: 'Camiseta sin mangas mujer', price: 8900, categories: ['mujer', 'superior'], img: 'https://picsum.photos/300/300?11' },
  { id: 12, name: 'Ropa térmica unisex', price: 23000, categories: ['mujer', 'hombre', 'superior'], img: 'https://picsum.photos/300/300?12' },
  { id: 13, name: 'Pantalón de yoga mujer', price: 16200, categories: ['mujer', 'inferior'], img: 'https://picsum.photos/300/300?13' },
  { id: 14, name: 'Camiseta running hombre', price: 13200, categories: ['hombre', 'superior'], img: 'https://picsum.photos/300/300?14' },
  { id: 15, name: 'Camiseta running mujer', price: 12900, categories: ['mujer', 'superior'], img: 'https://picsum.photos/300/300?15' },
  { id: 16, name: 'Shorts de entrenamiento mujer', price: 11500, categories: ['mujer', 'inferior'], img: 'https://picsum.photos/300/300?16' },
  { id: 17, name: 'Shorts de entrenamiento hombre', price: 12500, categories: ['hombre', 'inferior'], img: 'https://picsum.photos/300/300?17' },
  { id: 18, name: 'Pantalón térmico hombre', price: 19500, categories: ['hombre', 'inferior'], img: 'https://picsum.photos/300/300?18' },
  { id: 19, name: 'Pantalón térmico mujer', price: 18800, categories: ['mujer', 'inferior'], img: 'https://picsum.photos/300/300?19' },
  { id: 20, name: 'Tank top compresión hombre', price: 11000, categories: ['hombre', 'superior'], img: 'https://picsum.photos/300/300?20' },
  { id: 21, name: 'Tank top compresión mujer', price: 10800, categories: ['mujer', 'superior'], img: 'https://picsum.photos/300/300?21' },
  { id: 22, name: 'Conjunto deportivo mujer', price: 25900, categories: ['mujer', 'superior', 'inferior'], img: 'https://picsum.photos/300/300?22' },
  { id: 23, name: 'Conjunto deportivo hombre', price: 27200, categories: ['hombre', 'superior', 'inferior'], img: 'https://picsum.photos/300/300?23' },
  { id: 24, name: 'Camisa de compresión hombre', price: 17800, categories: ['hombre', 'superior'], img: 'https://picsum.photos/300/300?24' },
  { id: 25, name: 'Camisa de compresión mujer', price: 17200, categories: ['mujer', 'superior'], img: 'https://picsum.photos/300/300?25' },
  { id: 26, name: 'Mallas térmicas mujer', price: 18700, categories: ['mujer', 'inferior'], img: 'https://picsum.photos/300/300?26' },
  { id: 27, name: 'Mallas térmicas hombre', price: 19200, categories: ['hombre', 'inferior'], img: 'https://picsum.photos/300/300?27' },
  { id: 28, name: 'Camiseta liviana unisex', price: 9700, categories: ['mujer', 'hombre', 'superior'], img: 'https://picsum.photos/300/300?28' },
  { id: 29, name: 'Shorts livianos unisex', price: 10200, categories: ['mujer', 'hombre', 'inferior'], img: 'https://picsum.photos/300/300?29' },
  { id: 30, name: 'Ropa deportiva funcional mujer', price: 22500, categories: ['mujer', 'superior'], img: 'https://picsum.photos/300/300?30' }
];

export default function MainShop(){
  const [filter, setFilter] = useState<Filter>('todo');
  const [isActive, setIsActive] = useState(false);

  const filteredProducts = products.filter((p) => {
    if (filter === 'todo') return true;
    const parts = filter.split(' ') as Category[]; //
    return parts.every(part => p.categories.includes(part));
  });

  return(
    <div>
      <div className="relative flex justify-center lg:m-5 items-center">
        <h1 className="absolute font-semibold text-4xl lg:text-7xl text-pink">Tienda</h1>
        <img className="lg:rounded-xl shadow-lg" src="https://picsum.photos/1600/400" alt="" />
      </div>

      {/* Filters for Desktop */}
      <div className="hidden lg:flex gap-5 mx-auto my-15 lg:w-2/4 items-center bg-neutral-300/50 backdrop-blur p-3 rounded-full shadow-md">
        <div className="flex gap-2 mx-auto text-blue">
          <h2 className="text-lg font-semibold">Filtros:</h2>
          <button onClick={() => setFilter('todo')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer ${filter === "todo" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Todo</button>
          <span>|</span>
          <button onClick={() => setFilter('mujer')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer ${filter === "mujer" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Mujer</button>
          <button onClick={() => setFilter('inferior mujer')} className={`w-30 h-8 bg-white rounded-lg cursor-pointer ${filter === "inferior mujer" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Parte Inferior</button>
          <button onClick={() => setFilter('superior mujer')} className={`w-30 h-8 bg-white rounded-lg cursor-pointer ${filter === "superior mujer" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Parte Superior</button>
          <span>|</span>
          <button onClick={() => setFilter('hombre')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer ${filter === "hombre" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Hombre</button>
          <button onClick={() => setFilter('inferior hombre')} className={`w-30 h-8 bg-white rounded-lg cursor-pointer ${filter === "inferior hombre" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Parte Inferior</button>
          <button onClick={() => setFilter('superior hombre')} className={`w-30 h-8 bg-white rounded-lg cursor-pointer ${filter === "superior hombre" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Parte Superior</button>
        </div>
      </div>

      {/* Filters for Mobile */}
      <div className="flex lg:hidden">
        <button onClick={() => setIsActive(!isActive)} className="text-lg bg-yellow m-5 p-2 text-blue font-semibold rounded-lg w-50 mx-auto">Filtros</button>
      </div>

      {isActive && (<div className="fixed bg-black/20 inset-0 z-[900] lg:hidden" onClick={() => setIsActive(false)}></div>)}

      <div className={`absolute z-[1000] shadow-md fixed w-full bottom-0 transition-transform duration-500 ease-in-out ${isActive ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col gap-3 mx-auto bg-neutral-300/50 backdrop-blur p-5 shadow-xl p-10 h-[60vh] rounded-t-3xl text-blue">
          <button onClick={() => setFilter('todo')} className={`w-18 h-8 bg-neutral-200 rounded-lg cursor-pointer ${filter === "todo" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Todo</button>
          <hr className="text-blue my-1"/>
          <button onClick={() => setFilter('mujer')} className={`w-18 h-8 bg-neutral-200 rounded-lg cursor-pointer ${filter === "mujer" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Mujer</button>
          <div className="flex gap-3">
            <button onClick={() => setFilter('inferior mujer')} className={`w-30 h-8 bg-neutral-200 rounded-lg cursor-pointer ${filter === "inferior mujer" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Parte Inferior</button>
            <button onClick={() => setFilter('superior mujer')} className={`w-30 h-8 bg-neutral-200 rounded-lg cursor-pointer ${filter === "superior mujer" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Parte Superior</button>
          </div>
          <hr className="text-blue my-1"/>
          <button onClick={() => setFilter('hombre')} className={`w-18 h-8 bg-neutral-200 rounded-lg cursor-pointer ${filter === "hombre" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Hombre</button>
          <div className="flex gap-3">
            <button onClick={() => setFilter('inferior hombre')} className={`w-30 h-8 bg-neutral-200 rounded-lg cursor-pointer ${filter === "inferior hombre" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Parte Inferior</button>
            <button onClick={() => setFilter('superior hombre')} className={`w-30 h-8 bg-neutral-200 rounded-lg cursor-pointer ${filter === "superior hombre" ? "bg-yellow text-blue transition-all duration-300" : ""}`}>Parte Superior</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:w-6/7 lg:grid-cols-4 m-2 mt-2 lg:mx-auto justify-center items-center gap-5">
        {filteredProducts.map(product => (
          <NavLink key={product.id} to={`/p/${product.id}/${product.name}`}>
            <div className="animate-scroll-slide-up flex flex-col group hover:scale-105 transition-all duration-200 h-[270px] md:h-[300px] lg:w-[300px] lg:h-[350px] cursor-pointer mx-auto">
              <div className="max-h-[400px] max-w-[400px] relative">
                <img className="rounded-md" src={product.img} alt="Product Image" />
                <div className="absolute bottom-0 text-blue bg-amber-400/90 w-full p-1 text-center opacity-0 group-hover:opacity-100 transition-all duration-300">Ver Producto</div>
              </div>
              <div className="p-2">
                <h3 className="text-center font-semibold text-blue">{product.name}</h3>
                <p className="text-center text-blue">₡{product.price}</p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}