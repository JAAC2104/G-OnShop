import { type FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NavLink, useNavigate } from "react-router";
import { GoogleButton } from "../components/GoogleBtn";

export default function LoginPage(){
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { logIn, initializing, currentUser, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [isEmbedded, setIsEmbedded] = useState(false);

    function detectEmbeddedBrowser() {
        try{
            const ua = (navigator.userAgent || "").toLowerCase();
            const patterns = [
                "fbav", "fban", "instagram", "line/", "twitter", "tiktok", "snapchat",
                "; wv;", "webview", "duckduckgo", "gsa", "miuibrowser", "heytapbrowser", "oppobrowser", "opxbrowser"
            ];
            return patterns.some(p => ua.includes(p));
        } catch { return false; }
    }

    useEffect(() => {
        if (!initializing && currentUser) {
            navigate("/usuario", { replace: true });
        }
    }, [initializing, currentUser, navigate]);

    useEffect(() => {
        setIsEmbedded(detectEmbeddedBrowser());
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();

        if(!emailRef.current || !passwordRef.current) return
        
        try{
            setError("")
            setLoading(true);
            await logIn(emailRef.current?.value, passwordRef.current?.value);
            navigate("/usuario", { replace: true})
        } catch{
            setError("Credenciales InvA�lidos")
        }

        setLoading(false);
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
                        try {
                            setError("");
                            setLoading(true);
                            await signInWithGoogle();
                        } catch (e) {
                            setError("No se pudo iniciar sesión con Google");
                        } finally {
                            setLoading(false);
                        }
                    }} label="Continuar con Google"/>
                </div>
                {isEmbedded && (
                    <div className="mt-3 text-center text-sm text-blue bg-yellow-100 border border-yellow-300 rounded-md p-2">
                        Estas usando un navegador dentro de una app (por ejemplo, Instagram/Facebook/TikTok). Para iniciar sesion con Google, abre esta pagina en tu navegador (Safari o Chrome) y vuelve a intentarlo.
                    </div>
                )}
            </form>
        </div>
        <div className="m-2 mx-auto w-[300px] lg:w-lg p-5 flex justify-center gap-3">
            <span className="text-blue">No tienes una cuenta?</span>
            <NavLink to="/registrarse" className="underline text-blue-950 hover:text-pink-500">Regístrate</NavLink>
        </div>
    </>)
}
