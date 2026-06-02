import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
} from 'react-icons/fi';
import './Footer.css';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Book Eye Test', path: '/contact' },
];

const categoryLinks = [
  { label: 'Eyeglasses', path: '/shop?category=eyeglasses' },
  { label: 'Sunglasses', path: '/shop?category=sunglasses' },
  { label: 'Contact Lenses', path: '/shop?category=contact-lenses' },
  { label: 'Computer Glasses', path: '/shop?category=computer-glasses' },
];

const socialLinks = [
  { icon: FiInstagram, href: '#', label: 'Instagram' },
  { icon: FiFacebook, href: '#', label: 'Facebook' },
  { icon: FiTwitter, href: '#', label: 'Twitter' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="footer">
      {/* Gold accent line */}
      <div className="footer__accent-line" />

      {/* Newsletter Section */}
      <div className="footer__newsletter">
        <div className="footer__newsletter-content">
          <h3 className="footer__newsletter-title">
            Stay in the Loop
          </h3>
          <p className="footer__newsletter-text">
            Subscribe for exclusive offers, new arrivals, and style inspiration.
          </p>
        </div>
        <form className="footer__newsletter-form" onSubmit={handleNewsletterSubmit}>
          <div className="footer__newsletter-input-wrapper">
            <input
              type="email"
              className="footer__newsletter-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <motion.button
              type="submit"
              className="footer__newsletter-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {subscribed ? 'Subscribed!' : <FiSend />}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Main Footer Columns */}
      <div className="footer__container">
        <div className="footer__grid">
          {/* Column 1: Company */}
          <div className="footer__column">
            <Link to="/" className="footer__brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="Divyang Opticals Logo" style={{ height: '40px', width: 'auto' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Divyang Opticals</span>
            </Link>
            <p className="footer__brand-desc">
              Playful and vibrant eyewear. Redefining how the world sees optics.
            </p>
            <div className="footer__socials">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  className="footer__social-link"
                  aria-label={label}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer__column">
            <h4 className="footer__column-title">Quick Links</h4>
            <ul className="footer__links">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="footer__column">
            <h4 className="footer__column-title">Categories</h4>
            <ul className="footer__links">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="footer__column">
            <h4 className="footer__column-title">Contact</h4>
            <ul className="footer__contact-list">
              <li className="footer__contact-item">
                <FiMapPin className="footer__contact-icon" />
                <span>123 Vision Street, Beverly Hills, CA 90210</span>
              </li>
              <li className="footer__contact-item">
                <FiPhone className="footer__contact-icon" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="footer__contact-item">
                <FiMail className="footer__contact-icon" />
                <span>hello@divyangopticals.com</span>
              </li>
              <li className="footer__contact-item">
                <FiClock className="footer__contact-icon" />
                <span>Mon–Sat: 10AM – 8PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-container">
          <p className="footer__copyright">
            © 2024 Divyang Opticals. All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <Link to="/privacy" className="footer__bottom-link">Privacy Policy</Link>
            <span className="footer__bottom-divider">|</span>
            <Link to="/terms" className="footer__bottom-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
