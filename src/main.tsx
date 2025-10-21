import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/style.css'
import { RouterProvider } from 'react-router'
import { router } from './routers/routes.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  </StrictMode>,
)
