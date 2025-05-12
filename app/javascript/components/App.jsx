import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from '../routes/index.jsx';
import React from "react";
import { StrictMode } from "react";

export default function App(){
  const router = createBrowserRouter(routes)

  return(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
  )
}
