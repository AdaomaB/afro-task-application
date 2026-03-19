import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import api from '../services/api';

const ProfileCompletionWidget = ({ userRole }) => {
  const navigate = useNavigate();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    try {
      const response = await api.get('/onboarding/status');
      setProfileStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch profile status');
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed || !profileStatus) return null;
  if (profileStatus.profileCompleted) return null;

  const pct = profileStatus.profileCompletionPercentage || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6 relative"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1 hover:bg-white/60 rounded-full transition"
          title="Dismiss (will show again next visit)"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm mb-1">
              Your profile is {pct}% complete
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Complete your profile to unlock all features and get discovered faster.
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <motion.div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>

            {/* Missing fields */}
            {profileStatus.missingFields?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profileStatus.missingFields.slice(0, 4).map((field, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-amber-200 text-gray-600 rounded-full text-xs">
                    {field}
                  </span>
                ))}
                {profileStatus.missingFields.length > 4 && (
                  <span className="px-2 py-0.5 text-gray-400 text-xs">+{profileStatus.missingFields.length - 4} more</span>
                )}
              </div>
            )}

            <button
              onClick={() => navigate(`/${userRole}/onboarding`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileCompletionWidget;
