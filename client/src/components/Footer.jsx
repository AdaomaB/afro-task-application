import { useNavigate } from 'react-router-dom';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#0F1419] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/img/afro-task.png" alt="Afro Task" className="h-10 w-auto" />
              <span className="text-xl font-bold">Afro Task</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting African freelancers with clients worldwide. Build, grow, and succeed together.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-5">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#00564C] rounded-full flex items-center justify-center transition">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#00564C] rounded-full flex items-center justify-center transition">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#00564C] rounded-full flex items-center justify-center transition">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting African talent to global opportunities. Build, grow,
              and thrive.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition text-xl"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition text-xl"
              >
                <FaXTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition text-xl"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition text-left">Home</button></li>
              <li><button onClick={() => navigate('/explore-projects')} className="hover:text-white transition text-left">Explore Projects</button></li>
              <li><button onClick={() => navigate('/why-afro-task')} className="hover:text-white transition text-left">About</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white transition text-left">Contact Us</button></li>
            </ul>
          </div>

          {/* Auth & Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Account</h3>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition text-left">Login</button></li>
              <li><button onClick={() => navigate('/welcome')} className="hover:text-white transition text-left">Sign Up</button></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Afro Task. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
