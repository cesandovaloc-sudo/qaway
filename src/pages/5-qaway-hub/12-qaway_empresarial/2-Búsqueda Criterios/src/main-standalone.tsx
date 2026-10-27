/**
 * Bootstrap standalone del módulo Búsqueda de Criterios (solo para dev/preview).
 * En producción el módulo se consume vía el Hub (CriteriosAppPage.jsx), donde el
 * router lo envuelve; aquí se replica ese contexto para el arranque autónomo.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import CriteriosApp from "./CriteriosApp";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <CriteriosApp />
  </BrowserRouter>
);
