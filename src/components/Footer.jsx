import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const serviceNotes = [
  "Quality checked pieces",
  "Free shipping on select orders",
  "Secure payments",
  "Client support",
];

const storeLinks = [
  { label: "Home", to: "/" },
  { label: "Collection", to: "/collection/oversized" },
  { label: "Contact", to: "/contact" },
  { label: "About", to: "/about" },
];

const quickLinks = [
  { label: "Contact Support", to: "/contact" },
  { label: "About Brand", to: "/about" },
  { label: "Shop Collection", to: "/collection/oversized" },
  { label: "Orders", to: "/orders" },
];

const navigationSections = [
  {
    title: "Our Store",
    links: storeLinks,
  },
  {
    title: "Quick Links",
    links: quickLinks,
  },
];


function Footer({ customerProfile, onSignOut, onSignUp }) {
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  return (
    <footer className="lt-footer">
      <div className="lt-footer__container">
        <div className="lt-footer__service-rail" aria-label="Store highlights">
          {serviceNotes.map((note) => (
            <span key={note} className="lt-footer__service-note">{note}</span>
          ))}
        </div>

        <div className="lt-footer__main">
          <section className="lt-footer__brand">
            <p className="lt-footer__brand-label">LeosTrend</p>
            <h2 className="lt-footer__headline">
              Modern essentials with a sharper luxury edge.
            </h2>
            <p className="lt-footer__description">
              LeosTrend creates elevated everyday clothing with premium fabrics, cleaner silhouettes, and a refined streetwear point of view.
            </p>

            <div className="lt-footer__contact">
              <a href="tel:+918121234560">+91 81212 34560</a>
              <a href="mailto:support@leotrend.com">support@leotrend.com</a>
            </div>
          </section>

          <div className="lt-footer__aside">
            {navigationSections.map((section) => (
              <nav key={section.title}>
                <h3 className="lt-footer__section-title">{section.title}</h3>
                <ul className="lt-footer__nav-list">
                  {section.links.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <section className="lt-footer__newsletter">
              <h3 className="lt-footer__section-title">Newsletter</h3>
              <p className="lt-footer__newsletter-text">
                Get first access to new drops, restocks, and limited releases.
              </p>

              {newsletterSuccess ? (
                <div className="lt-footer__newsletter-success">Thanks for subscribing!</div>
              ) : !newsletterSuccess && (
                <form
                  className="lt-footer__form"
                  onSubmit={e => { e.preventDefault(); setNewsletterSuccess(true); }}
                >
                  <div className="lt-footer__form-fields">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="lt-footer__input"
                      disabled={!!customerProfile}
                    />
                    {customerProfile ? (
                      <button
                        type="button"
                        className="lt-footer__button"
                        onClick={onSignOut}
                      >
                        Sign Out
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="lt-footer__button"
                      >
                        Sign Up
                      </button>
                    )}
                  </div>
                </form>
              )}
              <p className="lt-footer__fineprint">
                By signing up, you agree to receive LeosTrend updates and occasional launch emails.
              </p>
            </section>
          </div>
        </div>

        <div className="lt-footer__bottom">
          <p>© 2026 LeosTrend. All rights reserved.</p>
          <p>Crafted for premium everyday wear.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
