import { useAuth } from "../contexts/AuthContext"
import { useUserProfile } from "../hooks/useUserProfile";


export default function UserPage(){
    const {logOut} = useAuth();
    const userInfo = useUserProfile()

    return (<>
        <div>Pagina de usuario</div>
        <button className="m-10 bg-pink p-2 rounded-md text-white cursor-pointer" onClick={logOut}>Cerrar Sesión</button>
        <div>{userInfo?.name}</div>
        <div>{userInfo?.phone}</div>
        <div>{userInfo?.email}</div>
    </>)
}