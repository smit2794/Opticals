import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ui/ScrollReveal';
import SectionTitle from '../ui/SectionTitle';
import CategoryCard from '../ui/CategoryCard';
import categories from '../../data/categories';
import { HiArrowRight } from 'react-icons/hi';
import './CategoriesSection.css';

const CategoriesSection = () => {
  const sectionRef = useRef(null);
  
  // Track scroll progress
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Calculate parallax offsets for columns on scroll
  const yCol1 = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const yCol2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yCol3 = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  // Divide 6 categories into 3 columns
  const col1 = [categories[0], categories[3]];
  const col2 = [categories[1], categories[4]];
  const col3 = [categories[2], categories[5]];

  return (
    <section className="categories-section section-padding" ref={sectionRef}>
      <div className="container" style={{ position: 'relative', zIndex: 3 }}>
        <ScrollReveal>
          <SectionTitle
            subtitle="Browse Collection"
            title="Featured Categories"
            description="Explore our carefully curated collections designed for every style, need, and occasion."
          />
        </ScrollReveal>

        {/* Parallax Responsive Grid */}
        <div className="categories-grid-container">
          <motion.div className="categories-grid-column" style={{ y: yCol1 }}>
            {col1.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </motion.div>
          <motion.div className="categories-grid-column" style={{ y: yCol2 }}>
            {col2.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index + 2} />
            ))}
          </motion.div>
          <motion.div className="categories-grid-column" style={{ y: yCol3 }}>
            {col3.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index + 4} />
            ))}
          </motion.div>
        </div>

        <div className="categories-cta">
          <ScrollReveal delay={0.2}>
            <Link to="/shop" className="btn btn-outline-accent">
              View All Categories
              <HiArrowRight />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
