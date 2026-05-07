import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaChevronDown } from "react-icons/fa";
import { FiSearch, FiX } from "react-icons/fi";
import useRipple from "../utils/useRipple";

export default function MobileNavbar({
  menuOpen,
  openMobileMenu,
  closeMobileMenu,
  mobileMenuTab,
  setMobileMenuTab,
  megaOpen,
  toggleMegaMenu,
  setMegaOpen,
  megaTriggerRef,
  cartItemsCount,
  badgePulse,
  openCartPage,
  openSearchOverlay,
  openWishlistPage,
}) {
  const location = useLocation();
  const showCartWishlist = location.pathname !== "/";
  const ripple = useRipple();

  const mainLinks = [
    { to: "/",        label: "Home"       },
    { to: "/contact", label: "Contact"    },
    { to: "/about",   label: "About"      },
    { to: "/orders",  label: "Orders"     },
  ];

  const categories = [
    { group:"T-Shirts",    items:[
      { to:"/collection/oversized", label:"Oversized"  },
      { to:"/collection/street",    label:"Streetwear" },
      { to:"/collection/graphic",   label:"Graphic"    },
    ]},
    { group:"Sweatshirts", items:[
      { to:"/collection/sweatshirts", label:"Crew" },
      { to:"/collection/zip",         label:"Zip"  },
    ]},
    { group:"Hoodies",     items:[
      { to:"/collection/hoodies", label:"Premium" },
      { to:"/collection/minimal", label:"Minimal" },
    ]},
  ];

  return (
    <>
      {/* ── TOP BAR ── */}
      <div className="mobile-navbar-bar">
        <button
          type="button"
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => (menuOpen ? closeMobileMenu() : openMobileMenu())}
          onPointerDown={ripple}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="hamburger-lines" aria-hidden="true">
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </span>
        </button>

        <Link to="/" className="mobile-brand" aria-label="LeosTrend home">
          <span className="brand-title">LEOS TREND</span>
        </Link>

        <div className="mobile-nav-right">
          <button type="button" className="mobile-search-btn" aria-label="Search" onClick={openSearchOverlay} onPointerDown={ripple}>
            <FiSearch />
          </button>
        </div>
      </div>

      {/* ── FULLSCREEN MENU ── */}
      {menuOpen && (
        <div className="pmenu-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">

          {/* close strip */}
          <div className="pmenu-head">
            <span className="pmenu-brand">LEOS TREND</span>
            <button className="pmenu-close" onClick={closeMobileMenu} aria-label="Close menu" onPointerDown={ripple}>
              <FiX />
            </button>
          </div>

          {/* main nav list */}
          <nav className="pmenu-nav">
            {mainLinks.map(({ to, label }, i) => (
              <Link
                key={to}
                to={to}
                className="pmenu-link"
                style={{ "--i": i }}
                onClick={closeMobileMenu}
                onPointerDown={ripple}
              >
                <span>{label}</span>
                <span className="pmenu-link-num">0{i + 1}</span>
              </Link>
            ))}

            {/* Collection accordion */}
            <button
              type="button"
              className="pmenu-link pmenu-link-collection"
              style={{ "--i": mainLinks.length }}
              onClick={toggleMegaMenu}
              onPointerDown={ripple}
            >
              <span>Collection</span>
              <FaChevronDown className={`pmenu-chevron${megaOpen ? " open" : ""}`} />
            </button>

            {megaOpen && (
              <div className="pmenu-collection">
                {categories.map(({ group, items }) => (
                  <div key={group} className="pmenu-group">
                    <p className="pmenu-group-label">{group}</p>
                    <div className="pmenu-group-items">
                      {items.map(({ to, label }) => (
                        <Link key={to} to={to} className="pmenu-group-link" onClick={closeMobileMenu} onPointerDown={ripple}>
                          {label}
                          <span className="pmenu-group-arrow">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="pmenu-link"
              style={{ "--i": mainLinks.length + 1 }}
              onClick={() => { openSearchOverlay(); closeMobileMenu(); }}
              onPointerDown={ripple}
            >
              <span>Search</span>
              <span className="pmenu-link-num">0{mainLinks.length + 2}</span>
            </button>
          </nav>

          {/* footer strip */}
          <div className="pmenu-footer">
            <span>© 2025 Leos Trend</span>
            <span>Premium Streetwear</span>
          </div>
        </div>
      )}
    </>
  );
}
