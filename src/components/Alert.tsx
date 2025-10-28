import { useEffect } from "react";

type AlertProps = {
  message: string;
  open: boolean;
  onClose: () => void;
  duration?: number;
};

export default function Alert({message, open, onClose, duration = 1500}: AlertProps) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  return (
    <div className={`fixed left-1/2 top-15 -translate-x-1/2 z-[1000] transition-all duration-300 ease-out ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}`} aria-live="polite" role="status">
      <div className={`bg-pink-400/30 backdrop-blur text-blue rounded-md shadow-md p-5 text-md font-semibold max-w-[90vw] sm:max-w-md text-center`}>
        {message}
      </div>
    </div>
  );
}