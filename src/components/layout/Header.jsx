import { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiMenu, FiX, FiEye } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import useScrollPosition from '../../hooks/useScrollPosition';
import SearchModal from '../ui/SearchModal';
import CartDrawer from '../ui/CartDrawer';
import { VirtualTryOnModal } from '../VirtualTryOnModal';
import './Header.css';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/shop', label: 'Shop' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export default function Header() {
  const scrollY = useScrollPosition();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll < 50) {
        setVisible(true);
      } else if (currentScroll > lastScrollY.current) {
        // Scrolling down -> hide header
        setVisible(false);
      } else if (currentScroll < lastScrollY.current) {
        // Scrolling up -> show header
        setVisible(true);
      }
      lastScrollY.current = currentScroll;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollY > 50;

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className={`header ${isScrolled ? 'header--scrolled' : ''} ${visible ? 'header--visible' : 'header--hidden'}`}
      >
        <div className="header__container">
          {/* Logo */}
          <Link to="/" className="header__logo" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo1.png" alt="Divyang Opticals Logo" style={{ height: '42px', width: 'auto', borderRadius: '50%' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Divyang Opticals</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header__nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`
                }
                end={link.path === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="header__actions">
            <button
              className="header__tryon-btn"
              onClick={() => setTryOnOpen(true)}
              aria-label="Launch Virtual Try-On"
            >
              <FiEye />
              <span className="header__tryon-text">Try-On</span>
            </button>

            <button
              className="header__action-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <FiSearch />
            </button>
            <button
              className="header__action-btn header__cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
            >
              <FiShoppingBag />
              {cartCount > 0 && (
                <motion.span
                  className="header__cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartCount}
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              className="header__hamburger"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiX />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiMenu />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="mobile-menu__backdrop"
              onClick={closeMobileMenu}
            />
            <nav className="mobile-menu__nav">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`
                    }
                    onClick={closeMobileMenu}
                    end={link.path === '/'}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <VirtualTryOnModal isOpen={tryOnOpen} onClose={() => setTryOnOpen(false)} />
    </>
  );
}
