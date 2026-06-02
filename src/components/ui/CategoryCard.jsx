import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import eyeglassesImg from '../../assets/images/glasses-1.png';
import sunglassesImg from '../../assets/images/sunglasses-1.png';
import contactsImg from '../../assets/images/glasses-2.png';
import computerImg from '../../assets/images/glasses-3.png';
import kidsImg from '../../assets/images/glasses-kids.png';
import premiumImg from '../../assets/images/glasses-sport.png';
import './CategoryCard.css';

const imageMap = {
  'eyeglasses': eyeglassesImg,
  'sunglasses': sunglassesImg,
  'contacts': contactsImg,
  'computer': computerImg,
  'kids': kidsImg,
  'premium': premiumImg
};

export default function CategoryCard({ category, index = 0 }) {
  const imageSrc = imageMap[category.image] || category.image;

  return (
    <motion.div
      className="category-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
    >
      <Link to={`/shop?category=${category.slug}`} className="category-card__link">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={category.name}
            className="category-card__image"
            loading="lazy"
          />
        ) : (
          <div className="category-card__gradient-bg" />
        )}
        <div className="category-card__overlay" />
        <div className="category-card__content">
          <span className="category-card__count">{category.productCount || category.count || 0} Products</span>
          <h3 className="category-card__name">{category.name}</h3>
          <span className="category-card__explore">
            Explore <FiChevronRight />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
