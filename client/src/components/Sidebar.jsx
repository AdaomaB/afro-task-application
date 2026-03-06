import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Briefcase, FileText, FolderOpen, CheckCircle, 
  User, PlusCircle, Search, MessageSquare, X 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isFreelancer = user?.role === 'freelancer';

  const freelancerMenu = [
    { name: 'Feed', path: '/freelancer/feed', icon: Home },
    { name: 'Explore Jobs', path: '/freelancer/jobs', icon: Search },
    { name: 'My Applications', path: '/freelancer/applications', icon: FileText },
    { name: 'Ongoing Projects', path: '/freelancer/projects/ongoing', icon: FolderOpen },
    { name: 'Completed Projects', path: '/freelancer/projects/completed', icon: CheckCircle },
    { name: 'Create Post', path: '/freelancer/create-post', icon: PlusCircle },
    { name: 'Messages', path: '/freelancer/messages', icon: MessageSquare },
    { name: 'Profile', path: '/freelancer/profile', icon: User }
  ];

  const clientMenu = [
    { name: 'Feed', path: '/client/feed', icon: Home },
    { name: 'Post Job', path: '/client/post-job', icon: PlusCircle },
    { name: 'Create Post', path: '/client/create-post', icon: PlusCircle },
    { name: 'My Jobs', path: '/client/jobs', icon: Briefcase },
    { name: 'Ongoing Projects', path: '/client/projects/ongoing', icon: FolderOpen },
    { name: 'Completed Projects', path: '/client/projects/completed', icon: CheckCircle },
    { name: 'Messages', path: '/client/messages', icon: MessageSquare },
    { name: 'Profile', path: '/client/profile', icon: User }
  ];

  const menuItems = isFreelancer ? freelancerMenu : clientMenu;
  const activeColor = isFreelancer ? 'bg-green-600' : 'bg-yellow-600';
  const hoverColor = isFreelancer ? 'hover:bg-green-50' : 'hover:bg-yellow-50';

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/')}>
            <img 
              src="/img/afro-task-logo.png" 
              alt="Afro Task" 
              className="h-10 w-auto"
            />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? `${activeColor} text-white shadow-lg` 
                    : `text-gray-700 ${hoverColor}`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.fullName}`}
            alt={user?.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
        <SidebarContent />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Button - Export for use in Navbar */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 p-3 bg-green-600 text-white rounded-lg shadow-lg z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
};

export default Sidebar;
