
import "./Footer.mobile.css";
import Footer from "./Footer";
import "./Footer.mobile.desktop.css";

export default function FooterMobile() {
  return (
    <div className="footer-mobile-main">
      {/* Mobile-specific footer spacing if needed */}
      <div style={{ minHeight: 16 }} />
      {/* Desktop footer reused for mobile, with mobile-specific class */}
      <div className="ft-mobile">
        <Footer />
      </div>
    </div>
  );
}
