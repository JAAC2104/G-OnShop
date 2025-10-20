import { NavLink } from "react-router";

export default function Footer() {


  return (
    <footer className="mt-10 border-t border-white/10 bg-neutral-300/50 backdrop-blur shadow-lg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <NavLink to='/' className="flex items-center"><header className="text-pink font-bold text-2xl absolute left-1/2 transform -translate-x-1/2">G·on</header></NavLink>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-blue">
        <p>© 2025 G·on</p>
        <a href="" className="mt-2 inline-block text-blue-950 hover:text-pink-500 transition-all duration-200">Back to top ↑</a>
      </div>
    </footer>
  );
}