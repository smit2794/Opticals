import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCheck } from 'react-icons/fi';
import Button from './Button';
import './ContactForm.css';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="contact-form-wrapper">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            className="contact-form__success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="contact-form__success-icon">
              <FiCheck />
            </div>
            <h3 className="contact-form__success-title">Message Sent!</h3>
            <p className="contact-form__success-text">
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="contact-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="contact-form__row">
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="name">
                  Full Name <span className="contact-form__required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`contact-form__input ${errors.name ? 'contact-form__input--error' : ''}`}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="contact-form__error">{errors.name}</span>}
              </div>
              <div className="contact-form__field">
                <label className="contact-form__label" htmlFor="email">
                  Email Address <span className="contact-form__required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`contact-form__input ${errors.email ? 'contact-form__input--error' : ''}`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="contact-form__error">{errors.email}</span>}
              </div>
            </div>

            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="contact-form__input"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="message">
                Your Message <span className="contact-form__required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                className={`contact-form__input contact-form__textarea ${errors.message ? 'contact-form__input--error' : ''}`}
                placeholder="Tell us how we can help you..."
                rows={5}
                value={formData.message}
                onChange={handleChange}
              />
              {errors.message && <span className="contact-form__error">{errors.message}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={FiSend}
              className="contact-form__submit"
            >
              Send Message
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
