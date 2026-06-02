import { motion } from 'framer-motion';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...rest
}) {
  return (
    <motion.button
      className={`btn btn--${variant} btn--${size} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...rest}
    >
      {Icon && <span className="btn__icon"><Icon /></span>}
      {children && <span className="btn__text">{children}</span>}
    </motion.button>
  );
}
