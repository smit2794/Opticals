import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import useScrollPosition from '../../hooks/useScrollPosition';
import SearchModal from '../ui/SearchModal';
import CartDrawer from '../ui/CartDrawer';
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

  const isScrolled = scrollY > 50;

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <motion.header
        className={`header ${isScrolled ? 'header--scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="header__container">
          {/* Logo */}
          <Link to="/" className="header__logo" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Divyang Opticals Logo" style={{ height: '40px', width: 'auto' }} />
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
      </motion.header>

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
    </>
  );
}
