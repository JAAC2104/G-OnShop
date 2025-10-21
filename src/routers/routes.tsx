import { createBrowserRouter } from "react-router";
import Navbar from "../components/Navbar";
import MainPage from "../pages/MainPage";
import ProductPage, { productLoader } from "../pages/ProductPage";
import RequireAuth from "./RequireAuth";
import UserPage from "../pages/UserPage";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import MyCartPage from "../pages/MyCartPage";
import RootLayout from "../layouts/RootLayout";
import AboutUsPage from "../pages/AboutUsPage";
import BestSellersPage from "../pages/BestSellersPage";


export const router = createBrowserRouter([
    {
        Component: Navbar,
        children: [
            {path: '/', Component: RootLayout, children: [
                {index : true, Component: MainPage},
                {path: '/p/:productId/:productName', loader: productLoader, Component: ProductPage},
                {
                    Component: RequireAuth,
                    children: [{path: '/usuario', Component: UserPage}]
                },
                {path: "/micarrito", Component: MyCartPage},
                {path: "/sobrenosotros", Component: AboutUsPage},
                {path: "/masvendidos", Component: BestSellersPage},
                {path: "/registrarse", Component: SignupPage},
                {path: "/iniciarsesion", Component: LoginPage}
            ]}
        ]
    }
])