import { createBrowserRouter } from "react-router";
import Navbar from "../components/Navbar";
import MainPage from "../pages/MainPage";
import ProductPage, { productLoader } from "../pages/ProductPage";

export const router = createBrowserRouter([
    {
        Component: Navbar,
        children: [
            {index : true, Component: MainPage},
            {path: '/p/:productId/:productName', loader: productLoader, Component: ProductPage}
        ]
    }
])