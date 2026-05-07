import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

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

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Use", to: "/terms" },
];

function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="ft">
      {/* ── top accent line ── */}
      <div className="ft__accent" />

      <div className="ft__inner">

        {/* ── BRAND COLUMN ── */}
        <div className="ft__brand">
          <p className="ft__brand-kicker">LeosTrend</p>
          <h2 className="ft__headline">
            Dress&nbsp;sharp.<br />Live&nbsp;premium.
          </h2>
          <p className="ft__desc">
            Elevated everyday clothing with premium fabrics,
            cleaner silhouettes, and a refined streetwear point of view.
          </p>
          <div className="ft__contact">
            <a href="tel:+918121234560">+91 81212 34560</a>
            <a href="mailto:lt@leotrend.com">lt@leotrend.com</a>
          </div>
        </div>

        {/* ── NAV COLUMNS ── */}
        <nav className="ft__nav-col">
          <h3 className="ft__nav-title">Our Store</h3>
          <ul>
            {storeLinks.map(l => (
              <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav className="ft__nav-col">
          <h3 className="ft__nav-title">Quick Links</h3>
          <ul>
            {quickLinks.map(l => (
              <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* ── NEWSLETTER ── */}
        <div className="ft__newsletter">
          <h3 className="ft__nav-title">Newsletter</h3>
          <p className="ft__nl-text">
            First access to drops, restocks &amp; limited releases.
          </p>

          {done ? (
            <p className="ft__nl-thanks">You're on the list. ✦</p>
          ) : (
            <form className="ft__nl-form" onSubmit={e => { e.preventDefault(); if (email) setDone(true); }}>
              <div className="ft__nl-field">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="ft__nl-input"
                />
                <button type="submit" className="ft__nl-btn">Join</button>
              </div>
              <p className="ft__nl-fine">No spam. Unsubscribe anytime.</p>
            </form>
          )}
        </div>

      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="ft__bottom">
        <p className="ft__copy">© 2026 LeosTrend — All rights reserved.</p>
        <div className="ft__legal">
          {legalLinks.map((l, i) => (
            <React.Fragment key={l.label}>
              {i > 0 && <span className="ft__legal-sep" />}
              <Link to={l.to}>{l.label}</Link>
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
