import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import Button from './Button';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="cart-drawer__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="cart-drawer"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="cart-drawer__header">
              <div className="cart-drawer__header-left">
                <h2 className="cart-drawer__title">Shopping Cart</h2>
                <span className="cart-drawer__count">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              </div>
              <button className="cart-drawer__close" onClick={onClose} aria-label="Close cart">
                <FiX />
              </button>
            </div>

            {/* Items */}
            <div className="cart-drawer__items">
              {items.length === 0 ? (
                <div className="cart-drawer__empty">
                  <div className="cart-drawer__empty-icon">
                    <FiShoppingBag />
                  </div>
                  <h3 className="cart-drawer__empty-title">Your cart is empty</h3>
                  <p className="cart-drawer__empty-text">
                    Discover our premium eyewear collection and find your perfect pair.
                  </p>
                  <Button variant="outline" size="md" onClick={onClose}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    className="cart-drawer__item"
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="cart-drawer__item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-drawer__item-details">
                      <h4 className="cart-drawer__item-name">{item.name}</h4>
                      <span className="cart-drawer__item-price">${item.price}</span>
                      <div className="cart-drawer__item-controls">
                        <div className="cart-drawer__quantity">
                          <button
                            className="cart-drawer__qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus />
                          </button>
                          <span className="cart-drawer__qty-value">{item.quantity}</span>
                          <button
                            className="cart-drawer__qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <button
                          className="cart-drawer__remove"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-drawer__total-row">
                  <span className="cart-drawer__total-label">Subtotal</span>
                  <span className="cart-drawer__total-value">${cartTotal.toFixed(2)}</span>
                </div>
                <p className="cart-drawer__shipping-note">
                  Shipping & taxes calculated at checkout
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="cart-drawer__checkout-btn"
                  icon={FiShoppingBag}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
