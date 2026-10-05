import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__name">AgroLink</span>
          <p className="footer__tagline">Farm. Connect. Prosper.</p>
          <p className="footer__desc">
            Empowering farmers and connecting markets across Kenya and beyond.
          </p>
        </div>

        <div className="footer__links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/marketplace">Marketplace</Link>
          <a href="/#how-it-works">How It Works</a>
        </div>

        <div className="footer__links">
          <h4>Platform</h4>
          <a href="/#features">Features</a>
          <a href="/#testimonials">Testimonials</a>
          <a href="/#contact">Contact</a>
          <Link to="/register">Sign Up</Link>
        </div>

        <div className="footer__contact">
          <h4>Contact</h4>
          <p>info@agrolink.co.ke</p>
          <p>+254 700 123 456</p>
          <p>Nairobi, Kenya</p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} AgroLink. All rights reserved.</p>
      </div>
    </footer>
  );
}
