import { NavLink, Outlet } from "react-router";
import MenuIcon from "../assets/menuIcon.svg?react";
import UserIcon from "../assets/userIcon.svg?react";
import CartIcon from "../assets/cartIcon.svg?react";
import { useState } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar(){
    const [isActive, setIsActive] = useState(false);
    const userInfo = useUserProfile()
    const { currentUser } = useAuth();
    const { getTotalItems } = useCart();

    return(<>
        <div className="navBar sticky top-0 z-100">

            {/* Mobile Display */}
            <div className="relative bg-neutral-300/50 backdrop-blur flex items-center h-18 lg:hidden justify-between px-3 shadow-md">
                <button onClick={() => setIsActive(!isActive)}><MenuIcon className="h-10 w-10 text-pink"/></button>
                <NavLink to='/' className="flex items-center"><header className="text-pink font-bold text-2xl absolute left-1/2 transform -translate-x-1/2">G·ON</header></NavLink>
                <div className="flex gap-3">
                    <NavLink to='/usuario'>{currentUser ? <div className="flex justify-center items-center bg-pink h-8 w-8 rounded-full text-white font-semibold">{userInfo?.name[0]}</div> : <UserIcon className="h-8 w-8 text-pink"/>}</NavLink>
                    <div className="relative">
                        <NavLink to='/micarrito'><CartIcon className="h-7 w-7 text-pink"/></NavLink>
                        <div className={`${getTotalItems === 0 ? 'hidden' : 'flex'} absolute bg-yellow p-1 font-semibold text-blue h-5 w-5 bottom-5 rounded-full left-4 justify-center items-center`}>{getTotalItems}</div>
                    </div>
                </div>
            </div>

            {isActive && (<div className="fixed bg-black/20 inset-0 z-[900] lg:hidden" onClick={() => setIsActive(false)}></div>)}

            <aside className={`fixed top-0 left-0 h-[100vh] rounded-r-2xl w-60 bg-neutral-300/50 backdrop-blur shadow-md z-[1000] flex flex-col transition-transform duration-500 ease-in-out ${isActive ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none"} lg:hidden`}>
                <nav className="flex flex-col gap-2 my-3 text-blue">
                    <NavLink onClick={() => setIsActive(!isActive)} to="/" className="p-3 font-semibold">Tienda</NavLink>
                    <hr className="opacity-50"/>
                    <NavLink onClick={() => setIsActive(!isActive)} to='/masvendidos' className="p-3 font-semibold">Más Vendidos</NavLink>
                    <hr className="opacity-50"/>
                    <NavLink onClick={() => setIsActive(!isActive)} to='sobrenosotros' className="p-3 font-semibold">Sobre Nosotros</NavLink>
                    <hr className="opacity-50"/>
                </nav>
            </aside>

            {/* Desktop Display */}
            <div className="sticky top-0 hidden lg:flex bg-neutral-300/50 backdrop-blur flex items-center h-20 justify-between px-10 shadow-md">
                <NavLink to='/'><header className="text-pink font-bold text-3xl">G·ON</header></NavLink>
                <nav className="text-blue">
                    <NavLink to="/" className="font-semibold p-3 hover:text-pink-600 tranform-all duration-100">Tienda</NavLink>
                    <NavLink to='/sobrenosotros' className="font-semibold p-3 hover:text-pink-600 tranform-all duration-300">Sobre Nosotros</NavLink>
                    <NavLink to='/masvendidos' className="font-semibold p-3 hover:text-pink-600 tranform-all duration-300">Más Vendidos</NavLink>
                </nav>
                <div className="flex gap-5">
                    <NavLink to='/usuario'>{currentUser ? <div className="flex justify-center items-center hover:scale-110 transition-all duration-200 bg-pink h-8 w-8 rounded-full text-white font-semibold">{userInfo?.name[0]}</div> : <UserIcon className="h-8 w-8 text-pink hover:scale-110 transition-all duration-200"/>}</NavLink>
                    <div className="relative">
                        <NavLink to='/micarrito'><CartIcon className="h-7 w-7 hover:scale-110 transition-all duration-200 text-pink"/></NavLink>
                        <div className={`${getTotalItems === 0 ? 'hidden' : 'flex'} absolute bg-yellow text-blue h-5 p-3 w-5 bottom-5 rounded-full left-4 justify-center items-center font-semibold`}>{getTotalItems}</div>
                    </div>
                </div>
            </div>

        </div>
        <Outlet/>
    </>)
}