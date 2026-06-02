import { motion } from 'framer-motion';
import HeroSection from '../components/sections/HeroSection';
import ServicesSection from '../components/sections/ServicesSection';
import CategoriesSection from '../components/sections/CategoriesSection';
import BestSellers from '../components/sections/BestSellers';
import AboutPreview from '../components/sections/AboutPreview';
import ContactPreview from '../components/sections/ContactPreview';
import ScrollReveal from '../components/ui/ScrollReveal';
import './HomePage.css';

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="home-page"
    >
      <HeroSection />
      
      <ScrollReveal direction="up" duration={0.8}>
        <ServicesSection />
      </ScrollReveal>
      
      <ScrollReveal direction="up" duration={0.8}>
        <CategoriesSection />
      </ScrollReveal>
      
      <ScrollReveal direction="up" duration={0.8}>
        <BestSellers />
      </ScrollReveal>
      
      <ScrollReveal direction="up" duration={0.8}>
        <AboutPreview />
      </ScrollReveal>
      
      <ScrollReveal direction="up" duration={0.8}>
        <ContactPreview />
      </ScrollReveal>
    </motion.div>
  );
}
