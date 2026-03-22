import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled, className = '' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600',
    secondary: 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500',
    outline: 'border-2 border-white hover:bg-white hover:text-green-600'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button;
