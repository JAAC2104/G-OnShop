import { type FormEvent, useRef, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { NavLink, useNavigate } from "react-router";
import { GoogleButton } from "../components/GoogleBtn";

export default function LoginPage(){
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { logIn, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();

        if(!emailRef.current || !passwordRef.current) return
        
        try{
            setError("")
            setLoading(true);
            await logIn(emailRef.current?.value, passwordRef.current?.value);
            navigate("/", { replace: true})
        } catch{
            setError("Invalid credentials")
        }

        setLoading(false);
    }
    
    return (<>
        <div className="mt-20 mx-auto bg-neutral-300/50 backdrop-blur w-[300px] lg:w-lg p-5 rounded-lg shadow-md">
            <h2 className="text-center text-2xl">Iniciar Sesión</h2>
            {error && <div className="text-center bg-red-200 border-2 border-red-500 rounded-md p-2 mt-5 w-[200px] mx-auto">{error}</div>}
            <form className="flex flex-col p-5 gap-3" onSubmit={handleSubmit}>
                <label htmlFor="email">Correo: </label>
                <input type="email" id="email" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={emailRef} />
                <label htmlFor="password">Contraseña: </label>
                <input type="password" id="password" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={passwordRef} />
                <button type="submit" disabled={loading} className={`mt-10 mx-auto w-[220px] h-10 rounded-md text-md ${loading ? "bg-neutral-400" : "bg-pink text-white cursor-pointer"}`}>Iniciar Sesión</button>
                <GoogleButton onClick={async () => {
                    try {const cred = await signInWithGoogle(); 
                        if (cred) {navigate("/", { replace: true });
                        } else {console.log("Redirecting to Google Sign-In...");}
                        } catch (err) {console.error(err); setError("Error al iniciar sesión con Google");}}}label="Continuar con Google"/>
            </form>
        </div>
        <div className="m-2 mx-auto w-[300px] lg:w-lg p-5 flex justify-center gap-3">
            <span>No tienes una cuenta?</span>
            <NavLink to="/registrarse" className="underline hover:text-pink-500">Regístrate</NavLink>
        </div>
    </>)
}