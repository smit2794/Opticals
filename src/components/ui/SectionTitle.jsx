import { motion } from 'framer-motion';
import './SectionTitle.css';

export default function SectionTitle({
  subtitle,
  title,
  description,
  align = 'center',
}) {
  return (
    <motion.div
      className={`section-title section-title--${align}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {subtitle && (
        <div className="section-title__subtitle-wrapper">
          <span className="section-title__subtitle">{subtitle}</span>
          <motion.span
            className="section-title__accent-line"
            initial={{ width: 0 }}
            whileInView={{ width: '40px' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
      )}
      {title && <h2 className="section-title__heading">{title}</h2>}
      {description && (
        <p className="section-title__description">{description}</p>
      )}
    </motion.div>
  );
}
