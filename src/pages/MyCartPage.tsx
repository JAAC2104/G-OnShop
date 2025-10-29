import { useCart } from "../contexts/CartContext"


export default function MyCartPage(){
    const {cartItems} = useCart();

    return (<>
        <div>Carrito Pagina</div>
        {cartItems.map(item => (
            <div key={item.id}>
                <div>{item.name}</div>
                <div>{item.price}</div>
                <div>{item.quantity}</div>
            </div>
        ))}
    </>)
}