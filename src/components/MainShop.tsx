import { useState } from "react"
import { NavLink } from "react-router"

type Gender = 'mujer' | 'unisex'
type Section = 'topsReversibles' | 'tops' | 'camisas' | 'leggings' | 'shorts' | 'bolsos' | 'cropTops' | 'blusas'
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
  { id: 1, name: 'Top Reversible Basic', price: 10500, categories: ['mujer', 'topsReversibles'], img: 'https://picsum.photos/300/300?1' },
  { id: 2, name: 'Top Reversible Complete', price: 11500, categories: ['mujer', 'topsReversibles'], img: 'https://picsum.photos/300/300?2' },
  { id: 3, name: 'Top Reversible Rectangle', price: 12500, categories: ['mujer', 'topsReversibles'], img: 'https://picsum.photos/300/300?3' },
  { id: 4, name: 'Top Reversible Mariposa', price: 12500, categories: ['mujer', 'topsReversibles'], img: 'https://picsum.photos/300/300?4' },
  { id: 5, name: 'Twist-Top Reversible', price: 12500, categories: ['mujer', 'topsReversibles'], img: 'https://picsum.photos/300/300?5' },
  { id: 6, name: 'Top Uve', price: 11500, categories: ['mujer', 'tops'], img: 'https://picsum.photos/300/300?6' },
  { id: 7, name: 'Top Curve', price: 12500, categories: ['mujer', 'tops'], img: 'https://picsum.photos/300/300?7' },
  { id: 8, name: 'Top Triangle', price: 12.900, categories: ['mujer', 'tops'], img: 'https://picsum.photos/300/300?8' },
  { id: 9, name: 'Top Asimétrico', price: 12500, categories: ['mujer', 'tops'], img: 'https://picsum.photos/300/300?9' },
  { id: 10, name: 'Top Freedom', price: 10900, categories: ['mujer', 'tops'], img: 'https://picsum.photos/300/300?10' },
  { id: 11, name: 'Top Aura Fit', price: 12900, categories: ['mujer', 'tops'], img: 'https://picsum.photos/300/300?11' },
  { id: 12, name: 'Top Strapless', price: 10500, categories: ['mujer', 'tops'], img: 'https://picsum.photos/300/300?12' },
  { id: 13, name: 'Top PowerFlex', price: 13900, categories: ['mujer', 'tops'], img: 'https://picsum.photos/300/300?13' },
  { id: 14, name: 'Muscle Tank', price: 10000, categories: ['unisex', 'camisas'], img: 'https://picsum.photos/300/300?14' },
  { id: 15, name: 'Tee Basic', price: 11500, categories: ['unisex', 'camisas'], img: 'https://picsum.photos/300/300?15' },
  { id: 16, name: 'Leggings Básico', price: 15500, categories: ['leggings', 'mujer'], img: 'https://picsum.photos/300/300?16' },
  { id: 17, name: 'Leggings Brisa', price: 17900, categories: ['leggings', 'mujer'], img: 'https://picsum.photos/300/300?17' },
  { id: 18, name: 'Leggings Raya', price: 17900, categories: ['leggings', 'mujer'], img: 'https://picsum.photos/300/300?18' },
  { id: 19, name: 'Baby Short', price: 10000, categories: ['shorts', 'mujer'], img: 'https://picsum.photos/300/300?19' },
  { id: 20, name: 'Biker Short', price: 12000, categories: ['shorts', 'mujer'], img: 'https://picsum.photos/300/300?20' },
  { id: 21, name: 'Baby Bag Tela Normal', price: 7500, categories: ['bolsos', 'mujer'], img: 'https://picsum.photos/300/300?21' },
  { id: 22, name: 'Baby Bag Impermeable', price: 9000, categories: ['bolsos', 'mujer'], img: 'https://picsum.photos/300/300?22' },
  { id: 23, name: 'Crop Top Muscle Tank', price: 9000, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?23' },
  { id: 24, name: 'Crop Top Yoga Tank', price: 9900, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?24' },
  { id: 25, name: 'Crop Top Tee Mariposa', price: 9000, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?25' },
  { id: 26, name: 'Crop Top Tee Oversized', price: 9000, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?26' },
  { id: 27, name: 'Sport Crop Top Manga Corta', price: 9500, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?27' },
  { id: 28, name: 'Sport Crop Top Manga Larga', price: 10500, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?28' },
  { id: 29, name: 'Súper Crop Top Manga Corta', price: 5900, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?29' },
  { id: 30, name: 'Súpero Crop Top Manga Larga', price: 6500, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?30' },
  { id: 31, name: 'Blusa Muscle Tank', price: 11000, categories: ['blusas', 'mujer'], img: 'https://picsum.photos/300/300?31' },
  { id: 32, name: 'Blusa Yoga Tank', price: 11900, categories: ['blusas', 'mujer'], img: 'https://picsum.photos/300/300?32' },
  { id: 33, name: 'Blusa Tee Mariposa', price: 10500, categories: ['blusas', 'mujer'], img: 'https://picsum.photos/300/300?33' },
  { id: 34, name: 'Blusa Tee Oversized', price: 10000, categories: ['blusas', 'mujer'], img: 'https://picsum.photos/300/300?34' },
  { id: 35, name: 'Sport Crop Top Largo Manga Corta', price: 9900, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?35' },
  { id: 36, name: 'Sport Crop Top Largo Manga Larga', price: 10900, categories: ['cropTops', 'mujer'], img: 'https://picsum.photos/300/300?36' }
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
        <img className="lg:rounded-xl shadow-md" src="https://picsum.photos/1600/400" alt="" />
      </div>

      {/* Filters for Desktop */}
      <div className="hidden lg:flex gap-5 mx-auto my-15 max-w-[1050px] items-center bg-neutral-300/50 backdrop-blur p-3 rounded-full shadow-md">
        <div className="flex gap-2 mx-auto text-blue">
          <h2 className="text-lg font-semibold">Filtros:</h2>
          <button onClick={() => setFilter('todo')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "todo" ? "bg-pink text-white transition-all duration-300" : ""}`}>Todo</button>
          <button onClick={() => setFilter('unisex')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "unisex" ? "bg-pink text-white transition-all duration-300" : ""}`}>Unisex</button>
          <button onClick={() => setFilter('tops mujer')} className={`w-15 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "tops mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Tops</button>
          <button onClick={() => setFilter('topsReversibles mujer')} className={`w-35 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "topsReversibles mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Tops Reversibles</button>
          <button onClick={() => setFilter('camisas unisex')} className={`w-20 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "camisas unisex" ? "bg-pink text-white transition-all duration-300" : ""}`}>Camisas</button>
          <button onClick={() => setFilter('leggings mujer')} className={`w-23 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "leggings mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Leggings</button>
          <button onClick={() => setFilter('shorts mujer')} className={`w-20 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "shorts mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Shorts</button>
          <button onClick={() => setFilter('bolsos mujer')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "bolsos mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Bolsos</button>
          <button onClick={() => setFilter('cropTops mujer')} className={`w-25 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "cropTops mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Crop Tops</button>
          <button onClick={() => setFilter('blusas mujer')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "blusas mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Blusas</button>
        </div>
      </div>

      {/* Filters for Mobile */}
      <div className="flex lg:hidden">
        <button onClick={() => setIsActive(!isActive)} className="text-lg bg-pink m-5 p-2 text-white font-semibold rounded-lg w-50 mx-auto">Filtros</button>
      </div>

      {isActive && (<div className="fixed bg-black/20 inset-0 z-[900] lg:hidden" onClick={() => setIsActive(false)}></div>)}

      <div className={`absolute z-[1000] shadow-md fixed w-full bottom-0 transition-transform duration-500 ease-in-out ${isActive ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"}`}>
        <div className="flex flex-wrap font-semibold gap-3 mx-auto bg-neutral-300/50 backdrop-blur p-5 shadow-xl p-10 h-[60vh] rounded-t-3xl text-blue">
          <button onClick={() => setFilter('todo')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "todo" ? "bg-pink text-white transition-all duration-300" : ""}`}>Todo</button>
          <button onClick={() => setFilter('unisex')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "unisex" ? "bg-pink text-white transition-all duration-300" : ""}`}>Unisex</button>
          <button onClick={() => setFilter('tops mujer')} className={`w-15 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "tops mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Tops</button>
          <button onClick={() => setFilter('topsReversibles mujer')} className={`w-35 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "topsReversibles mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Tops Reversibles</button>
          <button onClick={() => setFilter('camisas unisex')} className={`w-20 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "camisas unisex" ? "bg-pink text-white transition-all duration-300" : ""}`}>Camisas</button>
          <button onClick={() => setFilter('leggings mujer')} className={`w-23 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "leggings mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Leggings</button>
          <button onClick={() => setFilter('shorts mujer')} className={`w-20 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "shorts mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Shorts</button>
          <button onClick={() => setFilter('bolsos mujer')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "bolsos mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Bolsos</button>
          <button onClick={() => setFilter('cropTops mujer')} className={`w-25 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "cropTops mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Crop Tops</button>
          <button onClick={() => setFilter('blusas mujer')} className={`w-18 h-8 bg-white rounded-lg cursor-pointer hover:bg-neutral-100 transition-all duration-200 ${filter === "blusas mujer" ? "bg-pink text-white transition-all duration-300" : ""}`}>Blusas</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:w-6/7 lg:grid-cols-4 m-2 mt-2 lg:mx-auto justify-center items-center gap-5">
        {filteredProducts.map(product => (
          <NavLink className="block" key={product.id} to={`/p/${product.id}/${product.name}`}>
            <div className="animate-scroll-slide-up flex flex-col group hover:scale-102 transition-all duration-200 max-w-[300px] min-h-[250px] cursor-pointer mx-auto">
              <div className="max-h-[400px] max-w-[400px] relative w-full aspect-[1/1]">
                <img className="absolute inset-0 h-full w-full object-cover rounded-md" src={product.img} alt="Product Image" />
                <div className="absolute bottom-0 text-blue bg-neutral-300/80 font-semibold w-full p-1 text-center opacity-0 group-hover:opacity-100 rounded-b-md transition-all duration-300">Ver Producto</div>
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