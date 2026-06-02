import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import ContactForm from '../components/ui/ContactForm';
import SectionTitle from '../components/ui/SectionTitle';
import ScrollReveal from '../components/ui/ScrollReveal';
import './ContactPage.css';

const FAQ_ITEMS = [
  {
    q: 'How do I submit my prescription?',
    a: 'You can easily submit your prescription during checkout by uploading an image or PDF of the Rx. Alternatively, you can email it to rx@optica.com after placing your order, or provide your doctor\'s contact info, and we will verify it for you.',
  },
  {
    q: 'What is your shipping & delivery timeline?',
    a: 'All orders include complimentary overnight shipping. Single-vision glasses are typically delivered within 3-5 business days. Progressive or highly customized prescription lenses require 7-10 business days for hand-crafting and testing.',
  },
  {
    q: 'Do you offer a warranty on frames & lenses?',
    a: 'Yes, every purchase is protected by our 1-year manufacturing warranty. This covers any defects in materials or workmanship for both frames and lenses. We also offer a one-time lens replacement for scratch damage within the first 6 months.',
  },
  {
    q: 'What is your return policy?',
    a: 'We want you to love your eyewear. If you are not completely satisfied, you can return your glasses within 30 days of receipt for a full refund or exchange. We even cover the return shipping costs.',
  },
  {
    q: 'Can I book an eye test online?',
    a: 'Absolutely. You can schedule a comprehensive eye exam with our licensed optometrists using the booking button in our header, or visit the Contact page to send a request. Exams take about 30 minutes.',
  },
  {
    q: 'Do you accept vision insurance?',
    a: 'Yes. We accept most major vision insurance providers as an out-of-network provider. We will supply a detailed itemized receipt and invoice for you to submit to your provider for direct reimbursement.',
  },
];

export default function ContactPage() {
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    if (activeFaqIndex === index) {
      setActiveFaqIndex(null);
    } else {
      setActiveFaqIndex(index);
    }
  };

  return (
    <div className="contact-page page">
      {/* Banner */}
      <div className="contact-banner">
        <div className="container">
          <div className="contact-banner-content">
            <h1 className="contact-banner-title gradient-text">Contact Us</h1>
            <p className="contact-banner-subtitle">
              We are here to assist you with frame selections, custom lens fittings, and prescription services.
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <section className="contact-cards-section">
        <div className="container">
          <div className="contact-cards-grid">
            <ScrollReveal direction="up" delay={0.1} className="contact-card-col">
              <div className="contact-card-item glass-card">
                <div className="contact-card-icon">
                  <FiMapPin />
                </div>
                <h3>Our Location</h3>
                <p>123 Vision Boulevard</p>
                <p>New York, NY 10001</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2} className="contact-card-col">
              <div className="contact-card-item glass-card">
                <div className="contact-card-icon">
                  <FiPhone />
                </div>
                <h3>Call Us</h3>
                <p>+1 (555) 123-4567</p>
                <p>+1 (555) 987-6543</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3} className="contact-card-col">
              <div className="contact-card-item glass-card">
                <div className="contact-card-icon">
                  <FiMail />
                </div>
                <h3>Email Us</h3>
                <p>info@optica.com</p>
                <p>support@optica.com</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4} className="contact-card-col">
              <div className="contact-card-item glass-card">
                <div className="contact-card-icon">
                  <FiClock />
                </div>
                <h3>Hours</h3>
                <p>Mon - Fri: 9AM - 8PM</p>
                <p>Sat: 10AM - 6PM</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="contact-form-columns">
            <ScrollReveal direction="left" className="contact-form-text-col">
              <span className="section-label">Send a Message</span>
              <h2>How Can We Assist Your Eyes?</h2>
              <p>
                Our optical stylists and prescription lens specialists are ready to answer your questions. Drop us a line using the form, and we will get back to you within 24 hours.
              </p>
              <p>
                Need to book an exam immediately? Our optometrists are available daily. Feel free to call us directly during working hours for urgent prescription support.
              </p>
              
              <div className="hours-table-wrapper glass-card">
                <h4>Store Hours</h4>
                <table className="hours-table">
                  <tbody>
                    <tr>
                      <td className="day">Monday - Friday</td>
                      <td className="hours">9:00 AM - 8:00 PM</td>
                    </tr>
                    <tr>
                      <td className="day">Saturday</td>
                      <td className="hours">10:00 AM - 6:00 PM</td>
                    </tr>
                    <tr>
                      <td className="day">Sunday</td>
                      <td className="hours text-muted">Closed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="contact-form-wrapper-col">
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map-section">
        <div className="container">
          <ScrollReveal>
            <div className="map-glass-container glass-card">
              <div className="map-gradient-placeholder">
                <div className="map-overlay-text">
                  <h3>Visit Our Flagship Experience Store</h3>
                  <p>123 Vision Boulevard, New York, NY 10001</p>
                  <p className="text-secondary font-sm">
                    Interactive diagnostic clinic, styling lounges, and full collection showcases await.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="contact-faq-section">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              subtitle="Common Questions"
              title="Frequently Asked Questions"
              description="Learn more about our customized lens craft, shipping processes, and clinical optical policies."
            />
          </ScrollReveal>

          <div className="faq-accordion-list">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = activeFaqIndex === index;
              return (
                <ScrollReveal
                  key={index}
                  direction="up"
                  delay={index * 0.05}
                  className="faq-reveal-wrapper"
                >
                  <div className={`faq-accordion-item glass-card ${isOpen ? 'active' : ''}`}>
                    <button
                      className="faq-question-btn"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="faq-answer-container"
                        >
                          <p className="faq-answer-text">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
