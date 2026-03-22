import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0E27] relative overflow-hidden">
      {/* Public Navbar */}
      <nav className="bg-[#00564C] text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/img/afro-task-logo.png" 
              alt="Afro Task" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="hover:text-green-200 transition">Explore</button>
            <button onClick={() => navigate('/login')} className="hover:text-green-200 transition">Log in</button>
            <button 
              onClick={() => navigate('/')} 
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg transition"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>
      
      {/* Animated Light Trails Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Additional glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00564C]/20 to-[#FB9E01]/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 lg:px-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Welcome Text and Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              WELCOME
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-300 mb-4"
            >
              Connecting African Talent to
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl text-gray-300 mb-12"
            >
              Global Opportunities
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-4 max-w-md mx-auto lg:mx-0"
            >
              <button
                onClick={() => navigate('/signup/freelancer')}
                className="w-full bg-gradient-to-r from-[#00564C] to-[#008B7D] hover:from-[#004438] hover:to-[#00564C] text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Sign Up as Freelancer
              </button>
              
              <button
                onClick={() => navigate('/signup/client')}
                className="w-full bg-gradient-to-r from-[#FB9E01] to-[#CC8102] hover:from-[#CC8102] hover:to-[#FB9E01] text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Hire a Talent
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-8 text-gray-400"
            >
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#FB9E01] hover:text-[#CC8102] font-semibold underline transition"
              >
                Log in
              </button>
            </motion.p>
          </motion.div>

          {/* Right Side - 3D Floating Geometric Shapes */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-[600px] h-[600px]">
              
              {/* Large Sphere - Center */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-[#00564C] to-[#008B7D] shadow-2xl"
                animate={{
                  rotateY: 360,
                  y: [0, -20, 0],
                }}
                transition={{
                  rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-white/30 blur-xl"></div>
              </motion.div>

              {/* Cube - Top Left */}
              <motion.div
                className="absolute top-16 left-20 w-32 h-32 bg-gradient-to-br from-[#FB9E01] to-[#CC8102] shadow-xl"
                animate={{
                  rotateX: 360,
                  rotateZ: 360,
                  y: [0, 15, 0],
                }}
                transition={{
                  rotateX: { duration: 20, repeat: Infinity, ease: "linear" },
                  rotateZ: { duration: 25, repeat: Infinity, ease: "linear" },
                  y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ 
                  transformStyle: "preserve-3d",
                  transform: "rotateX(25deg) rotateY(25deg)"
                }}
              ></motion.div>

              {/* Small Sphere - Top Right */}
              <motion.div
                className="absolute top-12 right-24 w-20 h-20 rounded-full bg-gradient-to-br from-[#008B7D] to-[#00564C] shadow-lg"
                animate={{
                  y: [0, -25, 0],
                  x: [0, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/40 blur-lg"></div>
              </motion.div>

              {/* Torus/Ring - Left */}
              <motion.div
                className="absolute top-1/3 left-8 w-28 h-28 rounded-full border-[20px] border-[#00564C] shadow-xl"
                animate={{
                  rotateY: 360,
                  rotateX: [0, 180, 360],
                  y: [0, 20, 0],
                }}
                transition={{
                  rotateY: { duration: 18, repeat: Infinity, ease: "linear" },
                  rotateX: { duration: 12, repeat: Infinity, ease: "linear" },
                  y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ transformStyle: "preserve-3d" }}
              ></motion.div>

              {/* Cone/Triangle - Bottom Left */}
              <motion.div
                className="absolute bottom-24 left-32 w-0 h-0 border-l-[50px] border-r-[50px] border-b-[100px] border-l-transparent border-r-transparent border-b-[#FB9E01] shadow-xl"
                animate={{
                  rotateZ: 360,
                  y: [0, -15, 0],
                }}
                transition={{
                  rotateZ: { duration: 22, repeat: Infinity, ease: "linear" },
                  y: { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ 
                  transformStyle: "preserve-3d",
                  filter: "drop-shadow(0 10px 20px rgba(251, 158, 1, 0.3))"
                }}
              ></motion.div>

              {/* Medium Sphere - Bottom Right */}
              <motion.div
                className="absolute bottom-20 right-16 w-36 h-36 rounded-full bg-gradient-to-br from-[#FB9E01] via-[#CC8102] to-[#00564C] shadow-2xl"
                animate={{
                  rotateY: -360,
                  y: [0, 18, 0],
                }}
                transition={{
                  rotateY: { duration: 16, repeat: Infinity, ease: "linear" },
                  y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/30 blur-xl"></div>
                {/* Striped pattern */}
                <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-full h-2 bg-white" style={{ top: `${i * 12}%` }}></div>
                  ))}
                </div>
              </motion.div>

              {/* Small Cube - Right */}
              <motion.div
                className="absolute top-2/3 right-32 w-20 h-20 bg-gradient-to-br from-[#00564C] to-[#004438] shadow-lg"
                animate={{
                  rotateX: -360,
                  rotateY: 360,
                  y: [0, -12, 0],
                }}
                transition={{
                  rotateX: { duration: 18, repeat: Infinity, ease: "linear" },
                  rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
                  y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ transformStyle: "preserve-3d" }}
              ></motion.div>

              {/* Tiny Sphere - Top Center */}
              <motion.div
                className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#CC8102] to-[#FB9E01] shadow-md"
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/50 blur-sm"></div>
              </motion.div>

              {/* Ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00564C]/10 via-transparent to-[#FB9E01]/10 rounded-full blur-3xl"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
