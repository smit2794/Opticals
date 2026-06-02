import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import { BsStars } from 'react-icons/bs';
import blueRound from '../../assets/images/blue_round.png';
import goldRound from '../../assets/images/gold_round.png';
import roseGoldRound from '../../assets/images/rose_gold_round.png';
import brands from '../../data/brands';
import './HeroSection.css';

const HeroSection = () => {
  const sectionRef = useRef(null);

  // Track scroll position of the hero section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Calculate parallax offsets
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const imageRotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.85, x: 80 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }
    }
  };

  const brandList = [...brands, ...brands, ...brands];

  return (
    <section className="hero-section" ref={sectionRef}>
      {/* Background decorations */}
      <div className="hero-bg-decoration">
        <div className="hero-bg-circle hero-bg-circle-1" />
        <div className="hero-bg-circle hero-bg-circle-2" />
        <div className="hero-bg-circle hero-bg-circle-3" />
        <div className="hero-grid-overlay" />
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          {/* Left side - Text */}
          <motion.div
            className="hero-text"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="hero-badge" variants={itemVariants}>
              <BsStars className="hero-badge-icon" />
              <span>Premium Eyewear Collection</span>
            </motion.div>

            <motion.h1 className="hero-headline" variants={itemVariants}>
              <span className="hero-headline-line">
                SEE <span className="gradient-text">BETTER.</span>
              </span>
              <span className="hero-headline-line">
                LOOK <span className="gradient-text">BETTER.</span>
              </span>
            </motion.h1>

            <motion.p className="hero-subheadline" variants={itemVariants}>
              Discover premium eyeglasses, sunglasses, and advanced lens
              technology crafted for modern lifestyles.
            </motion.p>

            <motion.div className="hero-buttons" variants={itemVariants}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Shop Collection
                <HiArrowRight />
              </Link>
              <Link to="/contact" className="btn btn-outline-accent btn-lg">
                Book Eye Test
              </Link>
            </motion.div>
          </motion.div>

          {/* Right side - Visual */}
          <motion.div
            className="hero-visual"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            style={{ y: imageY }}
          >
            <div className="hero-image-container">
              {/* Concentric Orbital Rings */}
              <div className="hero-orbit-rings">
                <div className="hero-orbit-ring hero-orbit-ring-1" />
                <div className="hero-orbit-ring hero-orbit-ring-2" />
                <div className="hero-orbit-ring hero-orbit-ring-3" />
              </div>

              <div className="hero-glow-circle hero-glow-1" />
              <div className="hero-glow-circle hero-glow-2" />
              <div className="hero-glow-circle hero-glow-3" />

              {/* Overlapping Round Spectacles Stack (Left-Top Half-Circle) */}
              <motion.div className="hero-spectacles-stack" style={{ rotate: imageRotate }}>
                <img
                  src={roseGoldRound}
                  alt="Premium Rose Gold Spectacles"
                  className="hero-stacked-image spectacles-rose-gold"
                />
                <img
                  src={goldRound}
                  alt="Premium Gold Spectacles"
                  className="hero-stacked-image spectacles-gold"
                />
                <img
                  src={blueRound}
                  alt="Premium Blue Spectacles"
                  className="hero-stacked-image spectacles-blue"
                />
              </motion.div>

              {/* Interactive Navigation Brackets Pill */}
              {/* <div className="hero-nav-brackets-pill">
                <span className="bracket-icon">〈</span>
                <span className="bracket-icon">〉</span>
              </div> */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom brand marquee */}
      <motion.div
        className="hero-brands"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="hero-brands-container glass-card">
          <span className="hero-brands-label">Trusted Brands</span>
          <div className="hero-brands-marquee">
            <div className="hero-brands-track">
              {brandList.map((brand, index) => (
                <span key={`${brand.id}-${index}`} className="hero-brand-item">
                  <span className="hero-brand-name">{brand.name}</span>
                  <span className="hero-brand-dot">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
