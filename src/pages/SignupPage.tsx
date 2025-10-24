import { type FormEvent, useEffect, useRef, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { NavLink, useNavigate } from "react-router";

export default function SignupPage(){
    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp, initializing, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!initializing && currentUser) {
            navigate("/usuario", { replace: true });
        }
    }, [initializing, currentUser, navigate]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();

        if(!emailRef.current || !passwordRef.current || !nameRef.current || !phoneRef.current || !addressRef.current ) return

        const signupInfo = {email: emailRef.current?.value, password: passwordRef.current?.value, name: nameRef.current?.value, phone: phoneRef.current?.value, address: addressRef.current?.value}
        
        try{
            setError("")
            setLoading(true);
            await signUp(signupInfo);
            navigate("/usuario", { replace: true})
        } catch{
            setError("Error al crear usuario")
        }

        setLoading(false);
    }
    
    return (<>
        <div className="mt-5 lg:mt-20 mx-auto bg-neutral-300/50 backdrop-blur w-[300px] lg:w-lg p-5 rounded-lg shadow-md">
            <h2 className="text-center text-2xl text-blue">Registrarse</h2>
            {error && <div className="text-center bg-red-200 border-2 border-red-500 rounded-md p-2 mt-5 w-[200px] mx-auto">{error}</div>}
            <form className="flex flex-col p-5 gap-3" onSubmit={handleSubmit}>
                <label className="text-blue" htmlFor="name">Nombre: </label>
                <input type="text" id="name" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={nameRef} />
                <label className="text-blue" htmlFor="email">Correo: </label>
                <input type="email" id="email" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={emailRef} />
                <label className="text-blue" htmlFor="phone">Teléfono: </label>
                <input type="number" id="phone" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={phoneRef} />
                <label className="text-blue" htmlFor="address">Dirección: </label>
                <input type="text" id="address" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={addressRef} />
                <label className="text-blue" htmlFor="password">Contraseña: </label>
                <input type="password" id="password" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={passwordRef} />
                <button type="submit" disabled={loading} className={`mt-5 mx-auto w-[220px] h-10 rounded-md text-md ${loading ? "bg-neutral-400" : "bg-pink text-white cursor-pointer"}`}>Registrarse</button>
            </form>
        </div>
        <div className="m-2 mx-auto w-[300px] lg:w-lg p-5 flex justify-center gap-1">
            <span className="text-blue">Ya tienes una cuenta?</span>
            <NavLink to="/iniciarsesion" className="underline text-blue-950 hover:text-pink-500">Iniciar Sesión</NavLink>
        </div>
    </>)
}