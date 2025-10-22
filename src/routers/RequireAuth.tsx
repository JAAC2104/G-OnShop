import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";



export default function RequireAuth(){
    const { currentUser, initializing} = useAuth();
    const location = useLocation();

    if (initializing) return null;

    return currentUser ? <Outlet/> : <Navigate to="/iniciarsesion" replace state={{from: location}}/>;
}