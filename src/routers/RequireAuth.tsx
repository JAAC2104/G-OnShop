import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth(){
    const { currentUser, initializing } = useAuth();
  if (initializing) return null;
  return currentUser ? <Outlet /> : <Navigate to="/iniciarsesion" replace />;
}