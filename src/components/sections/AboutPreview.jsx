import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import ScrollReveal from '../ui/ScrollReveal';
import SectionTitle from '../ui/SectionTitle';
import Counter from '../ui/Counter';
import heroGlasses from '../../assets/images/hero-glasses.png';
import './AboutPreview.css';

const AboutPreview = () => {
  const stats = [
    { end: 50000, suffix: '+', label: 'Customers Served' },
    { end: 10000, suffix: '+', label: 'Products Sold' },
    { end: 14, suffix: '+', label: 'Years Experience' }
  ];

  return (
    <section className="about-preview-section section-padding">
      <div className="container">
        <div className="about-preview-content">
          {/* Left - Image */}
          <ScrollReveal direction="left">
            <div className="about-preview-image-wrapper">
              <div className="about-preview-image-frame">
                <img
                  src={heroGlasses}
                  alt="OPTICA Premium Eyewear"
                  className="about-preview-image"
                />
              </div>
              <div className="about-preview-image-decoration" />
            </div>
          </ScrollReveal>

          {/* Right - Text */}
          <ScrollReveal direction="right">
            <div className="about-preview-text">
              <SectionTitle
                subtitle="About Us"
                title="Crafting Vision Since 2010"
                align="left"
              />

              <p className="about-preview-story">
                At OPTICA, we believe that eyewear is more than just a necessity
                — it&apos;s an expression of your personality. Since our founding in
                2010, we&apos;ve been dedicated to providing premium eyewear that
                combines cutting-edge technology with timeless design.
              </p>

              <p className="about-preview-mission">
                Our mission is to enhance every customer&apos;s vision and style with
                personalized service, expert eye care, and a curated collection
                of the world&apos;s finest optical brands.
              </p>

              <motion.div
                className="about-preview-stats"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
                  }
                }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="about-preview-stat"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8, y: 30 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: {
                          type: 'spring',
                          stiffness: 100,
                          damping: 15,
                          mass: 1
                        }
                      }
                    }}
                  >
                    <span className="about-preview-stat-number">
                      <Counter end={stat.end} suffix={stat.suffix} duration={1.5} />
                    </span>
                    <span className="about-preview-stat-label">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <Link to="/about" className="btn btn-outline-accent">
                Learn More
                <HiArrowRight />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
