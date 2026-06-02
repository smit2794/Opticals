import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import ScrollReveal from '../ui/ScrollReveal';
import SectionTitle from '../ui/SectionTitle';
import ProductCard from '../ui/ProductCard';
import products from '../../data/products';
import './BestSellers.css';

const BestSellers = () => {
  const bestSellers = products.filter((p) => p.isBestSeller);

  return (
    <section className="bestsellers-section section-padding">
      <div className="bestsellers-bg-accent" />
      <div className="container">
        <ScrollReveal>
          <SectionTitle
            subtitle="Top Picks"
            title="Best Selling Products"
            description="Our most loved eyewear, chosen by thousands of happy customers for their style, comfort, and quality."
          />
        </ScrollReveal>

        {/* Desktop/Tablet Grid */}
        <motion.div
          className="bestsellers-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
        >
          {bestSellers.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: 'easeOut' }
                }
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Horizontal Scroll */}
        <div className="bestsellers-scroll">
          {bestSellers.map((product) => (
            <div key={product.id} className="bestsellers-scroll-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="bestsellers-cta">
            <Link to="/shop" className="btn btn-outline-accent">
              View All Products
              <HiArrowRight />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BestSellers;
