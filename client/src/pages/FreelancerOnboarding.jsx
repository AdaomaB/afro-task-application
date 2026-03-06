import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Briefcase, Link as LinkIcon, Camera, Video, 
  CheckCircle, ArrowRight, ArrowLeft, Upload 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PREDEFINED_SKILLS = [
  'Full Stack Development', 'Frontend Development', 'Backend Development',
  'React', 'Node.js', 'NestJS', 'MongoDB', 'Firebase',
  'UI/UX Design', 'Graphic Design', 'Web Design',
  'Mobile App Development', 'Flutter', 'React Native',
  'DevOps', 'AWS', 'Cybersecurity',
  'Data Analysis', 'Machine Learning', 'AI Development',
  'Video Editing', 'Motion Graphics',
  'SEO', 'Digital Marketing', 'Content Writing', 'Copywriting',
  'WordPress', 'Shopify Development', '3D Modeling', 'Product Design'
];

const FreelancerOnboarding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [professionalInfo, setProfessionalInfo] = useState({
    professionalTitle: '', yearsOfExperience: '', bio: '',
    languages: '', availability: 'full-time', hourlyRate: ''
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [showCustomSkill, setShowCustomSkill] = useState(false);

  const [socialLinks, setSocialLinks] = useState({
    linkedin: '', github: '', portfolio: '', behance: '', dribbble: '', instagram: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [introVideo, setIntroVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/onboarding/status');
      if (response.data.profileCompleted) {
        navigate('/freelancer/feed');
      }
    } catch (error) {
      console.error('Failed to check status');
    }
  };

  const handleStep1 = async () => {
    if (!professionalInfo.professionalTitle || !professionalInfo.yearsOfExperience || !professionalInfo.bio) {
      toast.error('Please fill all required fields');
      return;
    }
    if (professionalInfo.bio.length < 150) {
      toast.error('Bio must be at least 150 characters');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/professional-info', {
        ...professionalInfo,
        languages: professionalInfo.languages.split(',').map(l => l.trim()).filter(l => l)
      });
      toast.success('Saved!');
      setCurrentStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/skills', { skills: selectedSkills });
      toast.success('Saved!');
      setCurrentStep(3);
    } catch (error) {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    if (!socialLinks.linkedin) {
      toast.error('LinkedIn is required');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/social-links', socialLinks);
      toast.success('Saved!');
      setCurrentStep(4);
    } catch (error) {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4 = async () => {
    if (!profileImage && !user?.profileImage) {
      toast.error('Please upload a photo');
      return;
    }
    if (profileImage) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        await api.put('/profile/update', formData);
        toast.success('Uploaded!');
      } catch (error) {
        toast.error('Failed');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }
    setCurrentStep(5);
  };

  const handleStep5 = async () => {
    if (!introVideo) {
      toast.error('Please upload video');
      return;
    }
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('video', introVideo);
      const response = await api.post('/onboarding/intro-video', formData);
      if (response.data.profileCompleted) {
        await api.post('/onboarding/complete');
        toast.success('🎉 Complete!');
        setTimeout(() => navigate('/freelancer/feed'), 2000);
      }
    } catch (error) {
      toast.error('Failed');
    } finally {
      setUploadingVideo(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
      setShowCustomSkill(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Professional Profile</h1>
          <p className="text-gray-600">Let's set up your profile</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of 5</span>
            <span className="text-sm font-medium text-green-600">{Math.round((currentStep / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-green-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between mb-8">
          {[
            { num: 1, icon: User, label: 'Info' },
            { num: 2, icon: Briefcase, label: 'Skills' },
            { num: 3, icon: LinkIcon, label: 'Links' },
            { num: 4, icon: Camera, label: 'Photo' },
            { num: 5, icon: Video, label: 'Video' }
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentStep >= step.num ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.num ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
              </div>
              <span className="text-xs mt-2">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Professional Information</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Professional Title *</label>
                <input
                  type="text"
                  value={professionalInfo.professionalTitle}
                  onChange={(e) => setProfessionalInfo({...professionalInfo, professionalTitle: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Full Stack Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience *</label>
                <input
                  type="number"
                  value={professionalInfo.yearsOfExperience}
                  onChange={(e) => setProfessionalInfo({...professionalInfo, yearsOfExperience: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio * (min 150 characters)</label>
                <textarea
                  value={professionalInfo.bio}
                  onChange={(e) => setProfessionalInfo({...professionalInfo, bio: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-sm text-gray-500 mt-1">{professionalInfo.bio.length}/150</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Languages (comma separated)</label>
                <input
                  type="text"
                  value={professionalInfo.languages}
                  onChange={(e) => setProfessionalInfo({...professionalInfo, languages: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="English, French"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <select
                  value={professionalInfo.availability}
                  onChange={(e) => setProfessionalInfo({...professionalInfo, availability: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hourly Rate (USD)</label>
                <input
                  type="number"
                  value={professionalInfo.hourlyRate}
                  onChange={(e) => setProfessionalInfo({...professionalInfo, hourlyRate: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <button
                onClick={handleStep1}
                disabled={loading}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : 'Next Step'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Select Your Skills</h2>
              <div className="flex flex-wrap gap-3">
                {PREDEFINED_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full font-medium ${
                      selectedSkills.includes(skill) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomSkill(!showCustomSkill)}
                  className="px-4 py-2 rounded-full font-medium bg-blue-100 text-blue-700"
                >
                  + Other
                </button>
              </div>
              {showCustomSkill && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                    className="flex-1 px-4 py-2 border rounded-lg"
                    placeholder="Custom skill"
                  />
                  <button onClick={addCustomSkill} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                    Add
                  </button>
                </div>
              )}
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Selected ({selectedSkills.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(1)} className="flex-1 px-6 py-3 border rounded-lg">
                  <ArrowLeft className="w-5 h-5 inline mr-2" /> Back
                </button>
                <button
                  onClick={handleStep2}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Next'} <ArrowRight className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Social Links</h2>
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn *</label>
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">GitHub</label>
                <input
                  type="url"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Portfolio</label>
                <input
                  type="url"
                  value={socialLinks.portfolio}
                  onChange={(e) => setSocialLinks({...socialLinks, portfolio: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(2)} className="flex-1 px-6 py-3 border rounded-lg">
                  <ArrowLeft className="w-5 h-5 inline mr-2" /> Back
                </button>
                <button
                  onClick={handleStep3}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Next'} <ArrowRight className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Profile Photo</h2>
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <img
                    src={profileImagePreview || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.fullName}`}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-green-200"
                  />
                  <label className="absolute bottom-0 right-0 p-3 bg-green-600 text-white rounded-full cursor-pointer">
                    <Camera className="w-6 h-6" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfileImage(file);
                          setProfileImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(3)} className="flex-1 px-6 py-3 border rounded-lg">
                  <ArrowLeft className="w-5 h-5 inline mr-2" /> Back
                </button>
                <button
                  onClick={handleStep4}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Next'} <ArrowRight className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Introduction Video</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Record a 30-90 second video introducing yourself.
                </p>
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {videoPreview ? (
                  <div>
                    <video src={videoPreview} controls className="w-full max-h-96 rounded-lg mb-4" />
                    <button
                      onClick={() => {
                        setIntroVideo(null);
                        setVideoPreview(null);
                      }}
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload video</p>
                    <p className="text-sm text-gray-500">Max 100MB</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 100 * 1024 * 1024) {
                            toast.error('Video must be less than 100MB');
                            return;
                          }
                          setIntroVideo(file);
                          setVideoPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(4)} className="flex-1 px-6 py-3 border rounded-lg">
                  <ArrowLeft className="w-5 h-5 inline mr-2" /> Back
                </button>
                <button
                  onClick={handleStep5}
                  disabled={uploadingVideo || !introVideo}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {uploadingVideo ? 'Uploading...' : 'Complete'} <CheckCircle className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerOnboarding;
