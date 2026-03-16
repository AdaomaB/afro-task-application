import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Bell, Briefcase, MessageCircle } from "lucide-react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { IoSearch } from "react-icons/io5";

const WhiteNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      const notifs = response.data.notifications || [];
      setNotifications(notifs.slice(0, 10)); // Show last 10
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);

    // Navigate based on notification type
    if (notification.type === "job_match") {
      navigate("/freelancer/explore-jobs");
    } else if (notification.type === "new_post") {
      navigate(`/${user.role}/feed`);
    } else if (notification.type === "message") {
      navigate("/messages");
    } else if (notification.type === "application") {
      navigate("/client/my-jobs");
    } else if (
      notification.type === "like" ||
      notification.type === "comment"
    ) {
      navigate(`/${user.role}/feed`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "job_match":
      case "application":
        return <Briefcase className="w-5 h-5 text-yellow-600" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-green-600" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case "job_match":
        return `New job matches your skills: ${notification.data?.jobTitle || "Check it out"}`;
      case "new_post":
        return `${notification.fromUser?.fullName || "Someone"} posted something new`;
      case "like":
        return `${notification.fromUser?.fullName || "Someone"} liked your post`;
      case "comment":
        return `${notification.fromUser?.fullName || "Someone"} commented on your post`;
      case "application":
        return `New application for your job`;
      case "message":
        return `New message from ${notification.fromUser?.fullName || "someone"}`;
      default:
        return notification.message || "New notification";
    }
  };

  return (
    <nav className="bg-white text-black py-4 px-6 shadow-lg">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-3 items-center">
        {/* Left: Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(user ? `/${user.role}/dashboard` : "/")}
        >
          <img
            src="/img/afro-task-logo.png"
            alt="Afro Task"
            className="h-10 w-auto"
          />
        </div>

        {/* Center: Post Project & Search (hidden on mobile) */}
        <div className="flex items-center gap-3 justify-center col-start-2 col-end-3 invisible md:visible md:flex">
          <button
            onClick={() => navigate(user ? "/post-project" : "/login")}
            className="bg-[#00564C] text-white hover:bg-[#027568] px-4 py-2 rounded-lg transition"
          >
            Post Project
          </button>
          <button
            onClick={() => navigate("/search")}
            className="bg-gray-300 text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center gap-2 justify-center"
          >
            <IoSearch />
            Search
          </button>
        </div>

        {/* Right: User / Auth Section */}
        <div className="flex items-center justify-end gap-6">
          {user ? (
            <>
              {/* Notifications Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
                    >
                      {/* ...notifications content... */}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span className="text-black/90">Welcome, {user.fullName}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/welcome")}
                className="hover:text-green-700 transition font-medium"
              >
                Explore
              </button>
              <button
                onClick={() => navigate("/login")}
                className="hover:text-green-700 transition font-medium"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/welcome")}
                className="bg-[#00564C] text-white hover:bg-[#027568] px-6 py-2 rounded-lg transition"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default WhiteNavbar;
