import { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext"
import { useUserProfile } from "../hooks/useUserProfile";
import Footer from "../components/Footer";


export default function UserPage(){
    const {logOut, deleteAccount, updateUser} = useAuth();
    const userInfo = useUserProfile();
    const [ currentOption, setCurrentOption ] = useState<string>('info');
    const [isActive, setIsActive] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);

    function handleSubmit(){

        if(!nameRef.current || !phoneRef.current || !addressRef.current ) return

        const updateInfo = { name: nameRef.current?.value, phone: phoneRef.current?.value, address: addressRef.current?.value}
        
        updateUser(updateInfo);
        setIsEditing(!isEditing)
    }

    return (<div>

        {/* Display for desktop */}
        <div className="hidden lg:flex w-2/4 gap-10 mx-auto mt-20 p-5">
            <div className="flex flex-col items-start gap-10 p-5">
                <button className={`cursor-pointer hover:text-pink-600 font-semibold transition-all duration-200 ${currentOption === 'info' ? 'text-pink-600' : 'text-blue-950'}`} onClick={() => setCurrentOption('info')}>Mi información</button>
                <button className={`cursor-pointer hover:text-pink-600 font-semibold transition-all duration-200 ${currentOption === 'options' ? 'text-pink-600' : 'text-blue-950'}`} onClick={() => setCurrentOption('options')}>Opciones de cuenta</button>
            </div>
            <div className="h-inherit border-1 border-blue-950"></div>
            {currentOption === 'info' ? 
            <div className="flex flex-col gap-10 bg-neutral-300/50 backdrop-blur w-3/5 p-5 rounded-lg shadow-md">
                <div>
                    <span className="font-semibold text-blue">Nombre: </span> {isEditing ? <input className="border-2 border-pink rounded-md p-1 bg-neutral-200" defaultValue={userInfo?.name ?? ""} ref={nameRef}/> : <span>{userInfo?.name}</span>}
                </div>
                <div>
                    <span className="font-semibold text-blue">Correo: </span> <span>{userInfo?.email}</span>
                </div>
                <div>
                    <span className="font-semibold text-blue">Número telefónico: </span> {isEditing ? <input className="border-2 border-pink rounded-md p-1 bg-neutral-200" defaultValue={userInfo?.phone ?? ""} ref={phoneRef}/> : <span>{userInfo?.phone}</span>}
                </div>
                <div>
                    <span className="font-semibold text-blue">Dirección: </span> {isEditing ? <input className="border-2 border-pink rounded-md p-1 bg-neutral-200" defaultValue={userInfo?.address ?? ""} ref={addressRef}/> : <span>{userInfo?.address}</span>}
                </div>
                {isEditing ? <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={handleSubmit}>Confirmar edición</button> :
                <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={() => setIsEditing(!isEditing)}>Editar información</button>}
            </div> : 
            
            <div className="bg-neutral-300/50 backdrop-blur w-3/5 p-5 rounded-lg shadow-md flex justify-around items-center gap-10">
                <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={logOut}>Cerrar sesión</button>
                <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={() => setIsActive(true)}>Eliminar cuenta</button>
            </div>}
        </div>

        {/* Display for mobile */}
        <div className="flex flex-col lg:hidden justify-center items-center mt-5">
            <div className="flex items-start gap-10 p-5 justify-center">
                <button className={`cursor-pointer hover:text-pink-600 font-semibold transition-all duration-200 ${currentOption === 'info' ? 'text-pink-600' : 'text-blue-950'}`} onClick={() => setCurrentOption('info')}>Mi información</button>
                <button className={`cursor-pointer hover:text-pink-600 font-semibold transition-all duration-200 ${currentOption === 'options' ? 'text-pink-600' : 'text-blue-950'}`} onClick={() => setCurrentOption('options')}>Opciones de cuenta</button>
            </div>
            <div className="w-[90vw] border-1 border-blue-950 "></div>
            {currentOption === 'info' ? 
            <div className="flex flex-col gap-10 bg-neutral-300/50 backdrop-blur w-[80vw] p-5 mt-10 rounded-lg shadow-md break-words">
                <div>
                    <span className="font-semibold text-blue">Nombre: </span> {isEditing ? <input className="border-2 border-pink rounded-md p-1 bg-neutral-200" defaultValue={userInfo?.name ?? ""} ref={nameRef}/> : <span>{userInfo?.name}</span>}
                </div>
                <div>
                    <span className="font-semibold text-blue">Correo: </span> <span>{userInfo?.email}</span>
                </div>
                <div>
                    <span className="font-semibold text-blue">Número telefónico: </span> {isEditing ? <input className="border-2 border-pink rounded-md p-1 bg-neutral-200" defaultValue={userInfo?.phone ?? ""} ref={phoneRef}/> : <span>{userInfo?.phone}</span>}
                </div>
                <div>
                    <span className="font-semibold text-blue">Dirección: </span> {isEditing ? <input className="border-2 border-pink rounded-md p-1 bg-neutral-200" defaultValue={userInfo?.address ?? ""} ref={addressRef}/> : <span>{userInfo?.address}</span>}
                </div>
                {isEditing ? <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={handleSubmit}>Confirmar edición</button> :
                <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={() => setIsEditing(!isEditing)}>Editar información</button>}
            </div> : 
            
            <div className="bg-neutral-300/50 backdrop-blur w-[80vw] p-5 rounded-lg shadow-md flex justify-around items-center gap-10 mt-10">
                <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={logOut}>Cerrar sesión</button>
                <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={() => setIsActive(true)}>Eliminar cuenta</button>
            </div>}
        </div>


        {isActive && (<div className="fixed bg-black/20 inset-0 z-[900] w-full h-full" onClick={() => setIsActive(false)}></div>)}
                
        <div className={`${isActive ? 'flex' : 'hidden'} flex-col shadow-md absolute bg-neutral-300/50 backdrop-blur w-4/5 lg:w-2/4 z-[1000] top-3/7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 rounded-lg`}>
            <h2 className="text-pink text-3xl text-center font-semibold m-5">Atención</h2>
            <p className="lg:mt-10 lg:ms-20 text-blue text-justify">Al eliminar la cuenta se eliminarán permanentemente los siguientes datos:</p>
            <ul className="lg:m-10 lg:ms-35 list-disc text-blue m-5">
                <li>Nombre</li>
                <li>Correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Dirección</li>
                <li>Contraseña</li>
            </ul>
            <p className="text-center text-blue">Desea continuar?</p>
            <div className="flex justify-around lg:m-10 m-5">
                <button className="bg-neutral-200 text-blue p-2 rounded-md cursor-pointer hover:shadow-md font-semibold" onClick={() => setIsActive(false)}>Cancelar</button>
                <button className="bg-pink text-white p-2 rounded-md cursor-pointer hover:shadow-md" onClick={() => deleteAccount()}>Continuar</button>
            </div>
        </div>
    </div>)
}