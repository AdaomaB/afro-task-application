import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle, X } from 'lucide-react';
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
      
      // Auto-dismiss if 100% complete
      if (response.data.profileCompletionPercentage === 100) {
        setDismissed(true);
      }
    } catch (error) {
      console.error('Failed to fetch profile status');
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed || !profileStatus) return null;
  if (profileStatus.profileCompletionPercentage === 100) return null;

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'elite':
        return 'text-purple-600 bg-purple-100';
      case 'professional':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-6 relative"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 p-1 hover:bg-white/50 rounded-full transition"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Complete Your Professional Profile
          </h3>
          
          <p className="text-gray-700 mb-4">
            {profileStatus.profileCompletionPercentage < 100 
              ? `Your profile is ${profileStatus.profileCompletionPercentage}% complete. Complete it to unlock all features!`
              : 'Your profile is complete! 🎉'
            }
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Progress</span>
              <span className="font-bold text-yellow-600">
                {profileStatus.profileCompletionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${profileStatus.profileCompletionPercentage}%` }}
              />
            </div>
          </div>

          {/* Profile Strength Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-700">Profile Strength:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStrengthColor(profileStatus.profileStrength)}`}>
              {profileStatus.profileStrength.charAt(0).toUpperCase() + profileStatus.profileStrength.slice(1)}
            </span>
          </div>

          {/* Missing Fields */}
          {profileStatus.missingFields && profileStatus.missingFields.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Missing:</p>
              <div className="flex flex-wrap gap-2">
                {profileStatus.missingFields.map((field, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white border border-yellow-300 text-gray-700 rounded-full text-sm"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => navigate(`/${userRole}/onboarding`)}
            className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCompletionWidget;
