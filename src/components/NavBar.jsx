import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { NAV_LINKS } from "../lib/routes.js";
import CartWidget from "./CartWidget.jsx";
import { getCategories } from "../lib/api.js";
import logo from "../logos/logo sin fondo 1.png";

export default function NavBar({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    getCategories().then((list) => setCats(Array.isArray(list) ? list : [])).catch(() => setCats([]));
  }, []);

/*Menu de navegación */
  return (
    <header className="navbar">
      <div className="nav-inner">
        <a href="/" className="brand" aria-label="Inicio">
          <span className="brand-mark">
            <img src={logo} alt="Logo Distrimax" className="brand-img" />
          </span>
          <span className="brand-name">DISTRIMAX</span>
        </a>
      {/*Informacion de la navbar */} 
        <nav className={`nav-links ${open ? "is-open" : ""}`}>
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a key={link.href} href={link.href} className="nav-link" target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ) : (
              <a key={link.href} href={link.href} className="nav-link">
                {link.label}
              </a>
            )
          )}
        
          {/* Categorías dinámicas */}
          {(Array.isArray(cats) ? cats : []).map((c) => {
            if (typeof c !== "string" || !c) return null;
            const label = c[0].toUpperCase() + c.slice(1);
            return (
              <NavLink key={c} to={`/category/${encodeURIComponent(c)}`} className="nav-link">
                {label}
              </NavLink>
            );
          })}
        </nav>
      {/* CartWidget */}
        <CartWidget count={cartCount} />
      </div>
    </header>
  );
}
