import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Building, Target, Camera, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ClientOnboarding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Company Information
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    companyWebsite: '',
    industry: '',
    linkedIn: ''
  });

  // Step 2: Hiring Preferences
  const [hiringPreferences, setHiringPreferences] = useState({
    lookingFor: '',
    budgetRange: '',
    experienceLevel: '',
    projectDuration: '',
    location: ''
  });

  // Step 3: Profile Photo
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const response = await api.get('/onboarding/status');
      if (response.data.profileCompleted) {
        navigate('/client/feed');
      }
    } catch (error) {
      console.error('Failed to check profile status');
    }
  };

  const handleSkip = () => {
    navigate('/client/feed');
  };

  const handleStep1Submit = async () => {
    if (!companyInfo.companyName) {
      toast.error('Company name is required');
      return;
    }

    if (!companyInfo.companyWebsite && !companyInfo.linkedIn) {
      toast.error('Please provide either company website or LinkedIn profile');
      return;
    }

    setLoading(true);
    try {
      // Update company info in profile
      await api.put('/profile/update', {
        companyName: companyInfo.companyName,
        companyWebsite: companyInfo.companyWebsite,
        industry: companyInfo.industry
      });

      // Update LinkedIn in social links if provided
      if (companyInfo.linkedIn) {
        await api.put('/onboarding/social-links', {
          linkedin: companyInfo.linkedIn
        });
      }

      toast.success('Company information saved!');
      setCurrentStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!hiringPreferences.lookingFor || !hiringPreferences.budgetRange) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.put('/onboarding/hiring-preferences', hiringPreferences);
      toast.success('Hiring preferences saved!');
      setCurrentStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!profileImage && !user?.profileImage) {
      toast.error('Please upload a profile photo');
      return;
    }

    setLoading(true);
    try {
      if (profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        await api.put('/profile/update', formData);
      }

      // Complete onboarding
      await api.post('/onboarding/complete');
      toast.success('🎉 Profile completed! Welcome to Afro Task!');
      setTimeout(() => {
        navigate('/client/feed');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const getProgress = () => {
    return (currentStep / 3) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete Your Hiring Profile
          </h1>
          <p className="text-gray-600">
            Let's set up your profile to start hiring talent
          </p>
          <button
            onClick={handleSkip}
            className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline transition"
          >
            Skip for now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
            <span className="text-sm font-medium text-yellow-600">{Math.round(getProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-yellow-500 to-orange-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {[
            { num: 1, icon: Building, label: 'Company' },
            { num: 2, icon: Target, label: 'Preferences' },
            { num: 3, icon: Camera, label: 'Photo' }
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentStep >= step.num
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.num ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs mt-2 text-gray-600">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyInfo.companyName}
                  onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  value={companyInfo.companyWebsite}
                  onChange={(e) => setCompanyInfo({...companyInfo, companyWebsite: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile {!companyInfo.companyWebsite && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="url"
                  value={companyInfo.linkedIn}
                  onChange={(e) => setCompanyInfo({...companyInfo, linkedIn: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Required if no company website provided
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={companyInfo.industry}
                  onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                onClick={handleStep1Submit}
                disabled={loading}
                className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : 'Next Step'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Hiring Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Hiring Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of freelancer are you looking for? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hiringPreferences.lookingFor}
                  onChange={(e) => setHiringPreferences({...hiringPreferences, lookingFor: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., Full Stack Developers, Graphic Designers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range <span className="text-red-500">*</span>
                </label>
                <select
                  value={hiringPreferences.budgetRange}
                  onChange={(e) => setHiringPreferences({...hiringPreferences, budgetRange: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Budget Range</option>
                  <option value="$500-$1,000">$500 - $1,000</option>
                  <option value="$1,000-$5,000">$1,000 - $5,000</option>
                  <option value="$5,000-$10,000">$5,000 - $10,000</option>
                  <option value="$10,000+">$10,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Experience Level
                </label>
                <select
                  value={hiringPreferences.experienceLevel}
                  onChange={(e) => setHiringPreferences({...hiringPreferences, experienceLevel: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Experience Level</option>
                  <option value="Entry Level">Entry Level (0-2 years)</option>
                  <option value="Intermediate">Intermediate (2-5 years)</option>
                  <option value="Expert">Expert (5+ years)</option>
                  <option value="Any">Any Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Duration
                </label>
                <select
                  value={hiringPreferences.projectDuration}
                  onChange={(e) => setHiringPreferences({...hiringPreferences, projectDuration: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Duration</option>
                  <option value="Short-term">Short-term (Less than 1 month)</option>
                  <option value="Medium-term">Medium-term (1-3 months)</option>
                  <option value="Long-term">Long-term (3+ months)</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Preference
                </label>
                <select
                  value={hiringPreferences.location}
                  onChange={(e) => setHiringPreferences({...hiringPreferences, location: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Location</option>
                  <option value="Remote Only">Remote Only</option>
                  <option value="Africa">Africa</option>
                  <option value="Specific Country">Specific Country</option>
                  <option value="Any Location">Any Location</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleStep2Submit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving...' : 'Next Step'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Profile Photo */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Photo</h2>
              
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <img
                    src={profileImagePreview || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.fullName}`}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-yellow-200"
                  />
                  <label className="absolute bottom-0 right-0 p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full cursor-pointer transition">
                    <Camera className="w-6 h-6" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Upload a professional photo.<br />
                  This will be visible to freelancers.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleStep3Submit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Complete Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientOnboarding;
