type GoogleButtonProps = {
  onClick?: () => void;
  label?: string; // opcional: por defecto "Sign in with Google"
  className?: string; // para extender estilos si quieres
};

export function GoogleButton({ onClick, label = "Sign in with Google", className = "" }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "inline-flex items-center justify-center gap-3",
        "h-10 w-[220px] mx-auto cursor-pointer",
        "text-sm font-medium text-[#3c4043]",
        "bg-white border border-[#dadce0] rounded-md shadow-sm",
        "hover:bg-[#f7f8f8] hover:shadow-md",
        "active:shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] focus-visible:ring-offset-2",
        "transition-colors",
        className,
      ].join(" ")}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M17.64 9.2045c0-.6389-.0573-1.2518-.1636-1.8364H9v3.4725h4.844c-.209 1.1275-.843 2.0813-1.797 2.7212v2.258h2.908c1.704-1.5707 2.685-3.884 2.685-6.6153z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.955-2.1805l-2.908-2.258c-.806.54-1.837.86-3.047.86-2.343 0-4.327-1.58-5.037-3.708H.962v2.331C2.444 15.982 5.481 18 9 18z" fill="#34A853"/>
        <path d="M3.963 10.713c-.18-.54-.282-1.116-.282-1.713s.102-1.173.282-1.713V4.956H.962A8.996 8.996 0 0 0 0 8.999c0 1.464.35 2.847.962 4.043l3.001-2.329z" fill="#FBBC04"/>
        <path d="M9 3.579c1.321 0 2.508.454 3.445 1.346l2.579-2.579C13.465.896 11.43 0 9 0 5.481 0 2.444 2.018.962 4.956l3.001 2.331C4.673 5.158 6.657 3.579 9 3.579z" fill="#EA4335"/>
      </svg>

      <span>{label}</span>
    </button>
  );
}