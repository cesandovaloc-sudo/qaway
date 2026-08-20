import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DentalLandingPage } from "./pages/DentalLandingPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DentalLandingPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
