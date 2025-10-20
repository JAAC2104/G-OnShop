import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/style.css'
import { RouterProvider } from 'react-router'
import { router } from './routers/routes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
