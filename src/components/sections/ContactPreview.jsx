import { HiLocationMarker, HiPhone, HiMail, HiClock } from 'react-icons/hi';
import ScrollReveal from '../ui/ScrollReveal';
import SectionTitle from '../ui/SectionTitle';
import ContactForm from '../ui/ContactForm';
import './ContactPreview.css';

const ContactPreview = () => {
  const contactInfo = [
    {
      icon: <HiLocationMarker />,
      title: 'Visit Us',
      details: ['123 Vision Boulevard', 'New York, NY 10001']
    },
    {
      icon: <HiPhone />,
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543']
    },
    {
      icon: <HiMail />,
      title: 'Email Us',
      details: ['info@optica.com', 'support@optica.com']
    },
    {
      icon: <HiClock />,
      title: 'Working Hours',
      details: ['Mon - Fri: 9AM - 8PM', 'Sat: 10AM - 6PM']
    }
  ];

  return (
    <section className="contact-preview-section section-padding">
      <div className="contact-preview-bg" />
      <div className="container">
        <ScrollReveal>
          <SectionTitle
            subtitle="Get In Touch"
            title="Visit Our Store"
            description="We'd love to hear from you. Visit our store or reach out to our team for personalized assistance."
          />
        </ScrollReveal>

        <div className="contact-preview-content">
          {/* Left - Contact Info */}
          <ScrollReveal direction="left">
            <div className="contact-preview-info">
              {contactInfo.map((item, index) => (
                <div key={index} className="contact-info-card glass-card">
                  <div className="contact-info-icon">{item.icon}</div>
                  <div className="contact-info-text">
                    <h4 className="contact-info-title">{item.title}</h4>
                    {item.details.map((detail, i) => (
                      <p key={i} className="contact-info-detail">{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right - Contact Form */}
          <ScrollReveal direction="right">
            <div className="contact-preview-form-wrapper glass-card">
              <h3 className="contact-form-heading">Send a Message</h3>
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ContactPreview;
