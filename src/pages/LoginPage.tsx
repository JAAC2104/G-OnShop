import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleButton } from "../components/GoogleBtn";

function isIOS() {
  const ua = (navigator.userAgent || "").toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}
function isWebView() {
  const ua = (navigator.userAgent || "").toLowerCase();
  return /(fbav|fban|instagram|line\/|twitter|tiktok|snapchat|; wv;|webview|duckduckgo|gsa)/.test(ua);
}
function isStandalonePWA() {
  // iOS: window.navigator.standalone; otros: display-mode
  return (navigator as any).standalone === true ||
         window.matchMedia?.("(display-mode: standalone)").matches === true;
}

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { logIn, initializing, currentUser, signInWithGoogle, signInWithGoogleRedirect } = useAuth();
  const navigate = useNavigate();

  // Detecta entornos “hostiles” para popup (iOS, PWA, webviews)
  const mustUseRedirect = useMemo(
    () => isIOS() || isStandalonePWA() || isWebView(),
    []
  );

  // 🔒 No hagas nada hasta que Auth termine de iniciar
  useEffect(() => {
    if (!initializing && currentUser) {
      navigate("/usuario", { replace: true });
    }
  }, [initializing, currentUser, navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailRef.current || !passwordRef.current) return;

    try {
      setError("");
      setLoading(true);
      await logIn(emailRef.current.value, passwordRef.current.value);
      navigate("/usuario", { replace: true });
    } catch {
      setError("Credenciales inválidos");
    } finally {
      setLoading(false);
    }
  }

  // Mientras Auth inicializa en Safari/iOS, evita parpadeos/loops de navegación
  if (initializing) {
    return (
      <div className="mt-20 mx-auto w-[300px] lg:w-lg p-5 text-center text-blue">
        Cargando…
      </div>
    );
  }

  return (
    <>
      <div className="mt-20 mx-auto bg-neutral-300/50 backdrop-blur w-[300px] lg:w-lg p-5 rounded-lg shadow-md">
        <h2 className="text-center text-2xl text-blue">Iniciar Sesión</h2>

        {error && (
          <div className="text-center bg-red-200 border-2 border-red-500 rounded-md p-2 mt-5 w-[220px] mx-auto">
            {error}
          </div>
        )}

        <form className="flex flex-col p-5 gap-3" onSubmit={handleSubmit}>
          <label className="text-blue" htmlFor="email">Correo: </label>
          <input type="email" id="email" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={emailRef} />

          <label className="text-blue" htmlFor="password">Contraseña: </label>
          <input type="password" id="password" className="border-2 border-pink rounded-md p-1 bg-neutral-200" ref={passwordRef} />

          <button
            type="submit"
            disabled={loading}
            className={`mt-10 mx-auto w-[220px] h-10 rounded-md text-md ${loading ? "bg-neutral-400" : "bg-pink text-white cursor-pointer"}`}
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="flex mt-3">
          <GoogleButton
            disabled={loading}
            onClick={async () => {
              try {
                setError("");
                setLoading(true);
                // 🍎 iPhone / PWA / WebView → usa redirect sí o sí
                if (mustUseRedirect && typeof signInWithGoogleRedirect === "function") {
                  await signInWithGoogleRedirect();
                } else {
                  await signInWithGoogle();
                }
                // No navegamos aquí: el AuthProvider hará navigate cuando
                // currentUser exista (useEffect de arriba).
              } catch {
                setError("No se pudo iniciar sesión con Google");
              } finally {
                setLoading(false);
              }
            }}
            label="Continuar con Google"
          />
        </div>

        {isWebView() && (
          <div className="mt-3 text-center text-sm text-blue bg-yellow-100 border border-yellow-300 rounded-md p-2">
            Estás usando un navegador dentro de una app (Instagram/Facebook/TikTok).
            Para iniciar sesión con Google, abre esta página en Safari o Chrome.
          </div>
        )}
      </div>

      <div className="m-2 mx-auto w-[300px] lg:w-lg p-5 flex justify-center gap-3">
        <span className="text-blue">¿No tienes una cuenta?</span>
        <NavLink to="/registrarse" className="underline text-blue-950 hover:text-pink-500">Regístrate</NavLink>
      </div>
    </>
  );
}
