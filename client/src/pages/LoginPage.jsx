import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      toast.success('Login successful!');
      login(response.data.token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center py-12 px-6 lg:px-12">
        <div className="w-full max-w-6xl flex gap-8 lg:gap-12">
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center p-8"
            >
              <img 
                src="/img/fa1.png" 
                alt="Team collaboration" 
                className="w-full h-auto object-contain max-h-[600px]"
              />
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
            >
            <div className="text-center mb-8">
              <img 
                src="/img/afro-task-logo.png" 
                alt="Afro Task" 
                className="h-16 w-auto mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-sm">
                Log in to continue to your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup/:role')}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign up
              </button>
            </p>
          </motion.div>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
