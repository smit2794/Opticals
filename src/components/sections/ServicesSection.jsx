import { useRef } from 'react';
import ScrollReveal from '../ui/ScrollReveal';
import SectionTitle from '../ui/SectionTitle';
import ServiceCard from '../ui/ServiceCard';
import services from '../../data/services';
import './ServicesSection.css';

const ServicesSection = () => {
  const sectionRef = useRef(null);
  
  return (
    <section className="services-section section-padding" ref={sectionRef}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <ScrollReveal>
          <SectionTitle
            subtitle="Our Services"
            title="Expert Eye Care Services"
            description="From comprehensive eye exams to custom lens fittings, our team of experienced professionals provides exceptional care for your vision needs."
          />
        </ScrollReveal>

        <div className="services-grid">
          {services.map((service, index) => (
            <ScrollReveal 
              key={service.id} 
              direction="up" 
              duration={0.5} 
              delay={index * 0.1}
            >
              <ServiceCard service={service} index={index} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
