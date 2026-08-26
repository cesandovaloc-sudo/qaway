import { useState } from "react";
import { ChevronDown, Globe, ShoppingCart, User, Zap } from "lucide-react";

export function HostingerNavbar() {
  return (
    <header className="h-navbar">
      <div className="hostinger-container h-navbar-wrapper">
        <a href="#inicio" className="h-logo-wrap">
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#673de6" />
            <path d="M9 8H14V24H9V8Z" fill="white" />
            <path d="M18 8H23V24H18V8Z" fill="white" />
            <path d="M14 14H18V18H14V14Z" fill="white" />
          </svg>
          <span>Hostinger</span>
        </a>

        <ul className="h-nav-links">
          <li className="h-nav-item">
            <a href="#precios" className="h-nav-link">
              Hosting WordPress <ChevronDown size={14} />
            </a>
          </li>
          <li className="h-nav-item">
            <a href="#features" className="h-nav-link">
              WordPress con IA <span className="h-nav-badge">NUEVO</span>
            </a>
          </li>
          <li className="h-nav-item">
            <a href="#herramientas" className="h-nav-link">
              Herramientas IA <ChevronDown size={14} />
            </a>
          </li>
          <li className="h-nav-item">
            <a href="#precios" className="h-nav-link">
              Precios
            </a>
          </li>
        </ul>

        <div className="h-nav-right">
          <a href="#precios" className="h-btn-login">
            Ingresar
          </a>
          <a href="#precios" className="h-btn-primary">
            <ShoppingCart size={16} />
            <span>Comprar ahora</span>
          </a>
        </div>
      </div>
    </header>
  );
}
