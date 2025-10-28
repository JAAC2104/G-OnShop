import { type FormEvent, useEffect, useRef, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { NavLink, useNavigate } from "react-router";
import { GoogleButton } from "../components/GoogleBtn";
import { getRedirectResult, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function LoginPage(){
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { logIn, initializing, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!initializing && currentUser) {
            navigate("/usuario", { replace: true });
        }
    }, [initializing, currentUser, navigate]);

    function shouldUseRedirect() {
        const ua = navigator.userAgent || "";
        const inApp = /(FBAN|FBAV|Instagram|Line|MicroMessenger|OkHttp|Twitter|TikTok|Pinterest)/i.test(ua);
        const iOS = /iPhone|iPad|iPod/i.test(ua);
        return inApp || iOS;
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();

        if(!emailRef.current || !passwordRef.current) return
        
        try{
            setError("")
            setLoading(true);
            await logIn(emailRef.current?.value, passwordRef.current?.value);
            navigate("/usuario", { replace: true})
        } catch{
            setError("Credenciales Inválidos")
        }

        setLoading(false);

        useEffect(() => {
  console.log("[auth] initializing:", initializing, "user:", currentUser?.uid);
}, [initializing, currentUser]);

useEffect(() => {
  getRedirectResult(auth)
    .then((r) => console.log("[auth] redirect result user:", r?.user?.uid ?? null))
    .catch((e) => console.error("[auth] redirect error:", e?.code, e?.message));
}, []);
    }
    
    return (<>
        <div className="mt-20 mx-auto bg-neutral-300/50 backdrop-blur w-[300px] lg:w-lg p-5 rounded-lg shadow-md">
            <h2 className="text-center text-2xl text-blue">Iniciar Sesión</h2>
            {error && <div className="text-center bg-red-200 border-2 border-red-500 rounded-md p-2 mt-5 w-[200px] mx-auto">{error}</div>}
            <form className="flex flex-col p-5 gap-3" onSubmit={handleSubmit}>
                <label className="text-blue" htmlFor="email">Correo: </label>
                <input type="email" id="email" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={emailRef} />
                <label className="text-blue" htmlFor="password">Contraseña: </label>
                <input type="password" id="password" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={passwordRef} />
                <button type="submit" disabled={loading} className={`mt-10 mx-auto w-[220px] h-10 rounded-md text-md ${loading ? "bg-neutral-400" : "bg-pink text-white cursor-pointer"}`}>Iniciar Sesión</button>
                <div className="flex">
                    <GoogleButton onClick={async () => {
                        const provider = new GoogleAuthProvider().setCustomParameters({ prompt: "select_account" });
                        if (shouldUseRedirect()) await signInWithRedirect(auth, provider);
                        else await signInWithPopup(auth, provider);
                        }} label="Continuar con Google"/>
                </div>
            </form>
        </div>
        <div className="m-2 mx-auto w-[300px] lg:w-lg p-5 flex justify-center gap-3">
            <span className="text-blue">No tienes una cuenta?</span>
            <NavLink to="/registrarse" className="underline text-blue-950 hover:text-pink-500">Regístrate</NavLink>
        </div>
    </>)
}