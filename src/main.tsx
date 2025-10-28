import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/style.css'
import { RouterProvider } from 'react-router'
import { router } from './routers/routes.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import CartProvider from './contexts/CartContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router}></RouterProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
