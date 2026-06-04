import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiStar,
  FiShoppingBag,
  FiHeart,
  FiMinus,
  FiPlus,
  FiTruck,
  FiRotateCcw,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';
import products from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';
import SectionTitle from '../components/ui/SectionTitle';
import ScrollReveal from '../components/ui/ScrollReveal';
import Button from '../components/ui/Button';
import DeepARTryOn from '../components/DeepARTryOn';
import './ProductPage.css';

const LENS_OPTIONS = [
  { id: 'single-vision', name: 'Single Vision', price: 0 },
  { id: 'progressive', name: 'Progressive', price: 80 },
  { id: 'blue-light', name: 'Blue-Light Filtering', price: 30 },
  { id: 'polarized', name: 'Polarized Sun', price: 50 },
];

const FRAME_SIZES = ['S', 'M', 'L'];

// Mock reviews to populate reviews tab
const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Eleanor Vance',
    rating: 5,
    date: 'May 12, 2026',
    comment: 'The craftsmanship on these frames is outstanding. They are so light and comfortable, I forget I am wearing them. Highly recommend the blue light coating!',
  },
  {
    id: 2,
    name: 'Marcus Brody',
    rating: 4,
    date: 'April 28, 2026',
    comment: 'Exceptional look and feel. The gold accents are subtle but add a premium luxury vibe. Shipping was fast and the packaging was beautiful.',
  },
  {
    id: 3,
    name: 'Seraphina Sterling',
    rating: 5,
    date: 'March 15, 2026',
    comment: 'Absolutely gorgeous glasses. I get compliments every single day. The progressive lenses are perfect, transition is smooth.',
  },
];

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleCart, toggleWishlist, isInWishlist } = useCart();

  // Find current product
  const product = useMemo(() => {
    return products.find((p) => p.id === parseInt(id)) || null;
  }, [id]);

  // If product not found
  useEffect(() => {
    if (!product && products.length > 0) {
      navigate('/shop');
    }
  }, [product, navigate]);

  if (!product) return null;

  // Selected item states
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(product.selectedColor || (product.colors && product.colors[0]) || '');
  const [selectedLens, setSelectedLens] = useState('single-vision');
  const [selectedSize, setSelectedSize] = useState(product.frameSize || 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  // Update selected image when product changes
  useEffect(() => {
    setSelectedImage(product.image);
    setSelectedColor(product.selectedColor || (product.colors && product.colors[0]) || '');
    setSelectedSize(product.frameSize || 'M');
    setQuantity(1);
  }, [product]);

  const wishlisted = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQtyChange = (val) => {
    if (val >= 1) {
      setQuantity(val);
    }
  };

  const handleAddToCart = () => {
    // Add product to cart with custom configurations
    const configuredProduct = {
      ...product,
      id: `${product.id}-${selectedColor}-${selectedLens}-${selectedSize}`, // Unique key for cart items based on selection
      productId: product.id, // reference to original product
      selectedColor,
      selectedLens: LENS_OPTIONS.find((l) => l.id === selectedLens).name,
      frameSize: selectedSize,
      price: product.price + LENS_OPTIONS.find((l) => l.id === selectedLens).price, // Adjust price for lens
    };

    // Since our CartContext handles standard product item addition, we pass custom-configured properties.
    // If the cart checks item by ID, configuring ID makes it a unique line item!
    // Let's pass this configured product to context.
    addToCart(configuredProduct);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    toggleCart(); // opens cart sidebar
  };

  // Image zoom effect
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${selectedImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Related products
  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`product-star ${i <= Math.round(rating) ? 'filled' : ''}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="product-page page">
      {/* Breadcrumbs */}
      <div className="product-breadcrumbs-row">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to="/shop">Shop</Link>
            <span className="separator">/</span>
            <span className="current">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main product columns */}
      <section className="product-details-section">
        <div className="container">
          <div className="product-detail-grid">
            {/* Left Image Gallery */}
            <div className="product-gallery-pane">
              <ScrollReveal direction="left">
                <div className="main-image-frame glass-card">
                  <div
                    className="image-zoom-container"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="product-main-img"
                    />
                    <div className="zoom-overlay" style={zoomStyle} />
                  </div>

                  {discount && (
                    <div className="product-detail-discount-badge">
                      SAVE {discount}%
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="thumbnail-strip">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`thumb-btn glass-card ${selectedImage === img ? 'active' : ''}`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} alt={`${product.name} gallery ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </ScrollReveal>
            </div>

            {/* Right Product Options */}
            <div className="product-info-pane">
              <ScrollReveal direction="right">
                <span className="product-brand-tag">{product.brand}</span>
                <h1 className="product-title-heading">{product.name}</h1>

                {/* Review summary */}
                <div className="product-reviews-summary">
                  <div className="stars-row">{renderStars(product.rating)}</div>
                  <span className="reviews-count-text">
                    {product.rating} ({product.reviews || product.reviewCount || 0} customer reviews)
                  </span>
                </div>

                {/* Pricing and Stock */}
                <div className="price-stock-row">
                  <div className="price-container">
                    <span className="current-price">${product.price}</span>
                    {product.originalPrice && (
                      <span className="original-price">${product.originalPrice}</span>
                    )}
                  </div>
                  <div className="stock-badge">
                    <FiCheckCircle />
                    <span>{product.availability || 'In Stock'}</span>
                  </div>
                </div>

                <p className="product-short-desc">{product.shortDescription}</p>

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="selection-group">
                    <span className="selection-label">Frame Color:</span>
                    <div className="color-selectors">
                      {product.colors.map((colorHex) => (
                        <button
                          key={colorHex}
                          className={`color-selector-btn ${selectedColor === colorHex ? 'active' : ''}`}
                          style={{ backgroundColor: colorHex }}
                          onClick={() => setSelectedColor(colorHex)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Lens Selection */}
                <div className="selection-group">
                  <span className="selection-label">Lens Type:</span>
                  <div className="lens-grid">
                    {LENS_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        className={`lens-pill-btn glass-card ${selectedLens === opt.id ? 'active' : ''}`}
                        onClick={() => setSelectedLens(opt.id)}
                      >
                        <span className="lens-name">{opt.name}</span>
                        {opt.price > 0 && <span className="lens-add-price">+${opt.price}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Size Selection */}
                {product.frameSize !== 'N/A' && (
                  <div className="selection-group">
                    <span className="selection-label">Frame Size:</span>
                    <div className="size-selectors">
                      {FRAME_SIZES.map((sz) => (
                        <button
                          key={sz}
                          className={`size-selector-btn glass-card ${selectedSize === sz ? 'active' : ''}`}
                          onClick={() => setSelectedSize(sz)}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qty and Cart Actions */}
                <div className="purchase-controls">
                  <div className="quantity-adjuster glass-card">
                    <button
                      className="qty-btn"
                      onClick={() => handleQtyChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span className="qty-number">{quantity}</span>
                    <button className="qty-btn" onClick={() => handleQtyChange(quantity + 1)}>
                      <FiPlus />
                    </button>
                  </div>

                  <button
                    className={`wishlist-toggle-btn glass-card ${wishlisted ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product.id)}
                    title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FiHeart />
                  </button>
                </div>

                <div className="action-buttons-row">
                  <Button variant="primary" size="lg" className="purchase-btn" onClick={handleAddToCart}>
                    <FiShoppingBag /> Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" className="purchase-btn" onClick={handleBuyNow}>
                    Buy It Now
                  </Button>
                </div>

                {/* Shipping info items */}
                <div className="shipping-info-grid">
                  <div className="info-item">
                    <FiTruck />
                    <div>
                      <h5>Free Shipping</h5>
                      <p>Complimentary overnight shipping</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiRotateCcw />
                    <div>
                      <h5>Easy Returns</h5>
                      <p>30-day money-back guarantee</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiShield />
                    <div>
                      <h5>1-Year Warranty</h5>
                      <p>Full protection on frame & lens</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs description section */}
      <section className="product-tabs-section">
        <div className="container">
          <div className="tabs-header-border">
            <div className="tabs-buttons-row">
              <button
                className={`tab-toggle-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`tab-toggle-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button
                className={`tab-toggle-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({MOCK_REVIEWS.length})
              </button>
            </div>
          </div>

          <div className="tab-content-pane glass-card">
            {activeTab === 'description' && (
              <div className="tab-description-content">
                <h3>Product Overview</h3>
                <p>{product.description}</p>
                <div className="key-highlights-list">
                  <h4>Key Highlights</h4>
                  <ul>
                    <li>Hand-crafted premium frame engineered for optimal durability</li>
                    <li>Ergonomically designed temples with non-slip adjustable nose pads</li>
                    <li>Precision-engineered optical hinges for fluid folding motion</li>
                    <li>Advanced lens anti-scratch, dust, and fingerprint coatings</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-specs-content">
                <h3>Technical Specifications</h3>
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.specifications || {}).map(([key, val]) => (
                      <tr key={key}>
                        <td className="spec-key">{key}</td>
                        <td className="spec-value">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-reviews-content">
                <h3>Customer Reviews</h3>
                <div className="reviews-list">
                  {MOCK_REVIEWS.map((rev) => (
                    <div key={rev.id} className="review-card">
                      <div className="review-card-header">
                        <div>
                          <h4 className="reviewer-name">{rev.name}</h4>
                          <span className="review-date">{rev.date}</span>
                        </div>
                        <div className="review-stars">{renderStars(rev.rating)}</div>
                      </div>
                      <p className="reviewer-comment">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="container">
            <ScrollReveal>
              <SectionTitle
                subtitle="Exclusive Collection"
                title="You May Also Like"
                description="Complement your style with other curated products from our premium catalog."
              />
            </ScrollReveal>
            <div className="related-products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
