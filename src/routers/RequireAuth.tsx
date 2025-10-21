import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";



export default function RequireAuth(){
    const { currentUser} = useAuth();
    const location = useLocation();


    return currentUser ? <Outlet/> : <Navigate to="/iniciarsesion" replace state={{from: location}}/>;
}