import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiStar, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`product-card__star ${i <= Math.round(rating) ? 'product-card__star--filled' : ''}`}
        />
      );
    }
    return stars;
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -10, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
    >
      {/* Image Container */}
      <div className="product-card__image-wrapper">
        <Link to={`/product/${product.id}`} className="product-card__image-link">
          <img
            src={product.image}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
          />
        </Link>



        {/* Wishlist */}
        <button
          className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart />
        </button>

        {/* Quick View Overlay */}
        <Link to={`/product/${product.id}`} className="product-card__quick-view">
          <FiEye />
          <span>Quick View</span>
        </Link>
      </div>

      {/* Details */}
      <div className="product-card__details">
        <Link to={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>

        {/* Rating */}
        <div className="product-card__rating">
          <div className="product-card__stars">{renderStars(product.rating)}</div>
          <span className="product-card__review-count">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="product-card__price-section">
          <span className="product-card__price">${product.price}</span>
          {product.originalPrice && (
            <span className="product-card__original-price">${product.originalPrice}</span>
          )}
        </div>

        {/* Add to Cart */}
        <motion.button
          className="product-card__add-btn"
          onClick={() => addToCart(product)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiShoppingBag />
          <span>Add to Cart</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
