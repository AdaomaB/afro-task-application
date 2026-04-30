import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { AuthContext } from "../context/AuthContext";
import { useDarkMode } from "../context/DarkModeContext";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar";
import ReviewModal from "../components/ReviewModal";
import EnhancedPostCard from "../components/EnhancedPostCard";
import {
  MapPin,
  Briefcase,
  Award,
  ExternalLink,
  Mail,
  Phone,
  ArrowLeft,
  MessageCircle,
  X,
  DollarSign,
  Clock,
  Upload,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import ProfileCompletionWidget from "../components/ProfileCompletionWidget";

const PROJECT_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Video Editing",
  "Digital Marketing",
  "Writing",
  "Data Science",
  "AI / Machine Learning",
  "Cybersecurity",
  "DevOps",
  "Game Development",
  "Others",
];

const emptyProjectForm = {
  title: "",
  description: "",
  category: "",
  customCategory: "",
  projectLink: "",
  technologies: "",
  completionDate: "",
  image: null,
};

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { user: currentUser } = useContext(AuthContext);
  const adminStored = (() => { try { return JSON.parse(localStorage.getItem('adminUser')); } catch { return null; } })();
  const { dark } = useDarkMode();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    link: "",
    image: "",
  });
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] =
    useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showcaseProjects, setShowcaseProjects] = useState([]);
  const [loadingShowcase, setLoadingShowcase] = useState(false);

  // Create/Edit project modal
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const isOwnProfile = user?.id === userId;

  const isFreelancer = profile?.role === "freelancer";
  const isClient = profile?.role === "client";

  const tabs = isFreelancer
    ? ["about", "portfolio", "services", "projects", "posts", "reviews"]
    : ["about", "active-jobs", "completed-jobs", "posts"];

  const tabLabels = {
    about: "About",
    portfolio: "Projects",
    services: "Services",
    projects: "Active Jobs",
    posts: "Posts",
    reviews: "Reviews",
    "active-jobs": "Active Jobs",
    "completed-jobs": "Completed Jobs",
  };

  useEffect(() => {
    fetchProfile();
    if (!isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId]);

useEffect(() => {
    if (userId) {
      fetchShowcaseProjects(userId);
    }
  }, [userId]);

  // Edit profile handlers
// Profile image upload handlers - CROP STATES
  const [showProfileImageUpload, setShowProfileImageUpload] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  
  // Cropper states
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const inputRef = useRef(null);

  // Cover photo upload handlers
  const [showCoverPhotoUpload, setShowCoverPhotoUpload] = useState(false);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);

  const openEditProfile = () => {
    setEditForm({
      fullName: profile?.fullName || '',
      country: profile?.country || '',
      professionalTitle: profile?.professionalTitle || '',
      yearsOfExperience: profile?.yearsOfExperience || '',
      hourlyRate: profile?.hourlyRate || '',
      availability: profile?.availability || '',
      bio: profile?.bio || profile?.about?.bio || '',
      skills: profile?.skills?.join(', ') || profile?.about?.skills?.join(', ') || '',
      languages: profile?.languages?.join(', ') || '',
      whatsapp: profile?.whatsapp || '',
      companyName: profile?.companyName || '',
      industry: profile?.industry || '',
      hiringLookingFor: profile?.hiringPreferences?.lookingFor || '',
      hiringBudgetRange: profile?.hiringPreferences?.budgetRange || '',
      socialLinkedin: profile?.socialLinks?.linkedin || profile?.linkedIn || '',
      socialGithub: profile?.socialLinks?.github || '',
      socialPortfolio: profile?.socialLinks?.portfolio || profile?.portfolioWebsite || '',
    });
    setShowEditModal(true);
  };

  const openProfileImageUpload = () => {
    setShowProfileImageUpload(true);
    setShowImageModal(false);
  };

  // Cropper handlers
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setSelectedImage(reader.result));
      reader.readAsDataURL(file);
      setProfileImageFile(file);
    }
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (error) => reject(error));
      img.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 256;
    canvas.height = 256;

    const safeArea = Math.floor(256 * 4 / 3);
    const safeAreaMargin = Math.floor(safeArea / 2);
    const safeAreaSize = Math.floor(safeArea - safeAreaMargin * 2);

    const cropX = -pixelCrop.x + pixelCrop.width / 2 - safeAreaSize / 2;
    const cropY = -pixelCrop.y + pixelCrop.height / 2 - safeAreaSize / 2;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      safeAreaSize,
      safeAreaSize,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const compressedFile = await imageCompression(blob, {
          maxSizeMB: 1,
          maxWidthOrHeight: 512,
          useWebWorker: true,
          fileType: 'image/webp',
        });
        resolve(compressedFile);
      }, 'image/webp');
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleProfileImageUpload = async () => {
    if (!profileImageFile || !croppedAreaPixels) {
      toast.error("Please crop and select an image");
      return;
    }

    try {
      const croppedImageFile = await getCroppedImg(selectedImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append('profileImage', croppedImageFile);

      await api.put(`/profile/${userId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Profile picture updated successfully!");
      setShowProfileImageUpload(false);
      setSelectedImage(null);
      setProfileImageFile(null);
      setProfileImagePreview(null);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to upload profile picture");
    }
  };

  const openCoverPhotoUpload = () => {
    setShowCoverPhotoUpload(true);
    setShowImageModal(false);
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPhotoPreview(previewUrl);
    }
  };

  const handleCoverPhotoUpload = async () => {
    if (!coverPhotoFile) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append('coverPhoto', coverPhotoFile);

    try {
      await api.put(`/profile/${userId}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Cover photo updated successfully!");
      setShowCoverPhotoUpload(false);
      setCoverPhotoFile(null);
      setCoverPhotoPreview(null);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to upload cover photo");
    }
  };

  const handleSaveProfile = async () => {
    const skillsArray = editForm.skills.split(',').map(s => s.trim()).filter(Boolean);
    const languagesArray = editForm.languages.split(',').map(s => s.trim()).filter(Boolean);
    const socialLinksObj = {
      linkedin: editForm.socialLinkedin || '',
      github: editForm.socialGithub || '',
      portfolio: editForm.socialPortfolio || '',
    };

    const formData = new FormData();
    formData.append('fullName', editForm.fullName);
    formData.append('country', editForm.country);
    formData.append('professionalTitle', editForm.professionalTitle);
    formData.append('yearsOfExperience', editForm.yearsOfExperience);
    formData.append('hourlyRate', editForm.hourlyRate);
    formData.append('availability', editForm.availability);
    formData.append('bio', editForm.bio);
    formData.append('skills', JSON.stringify(skillsArray));
    formData.append('languages', JSON.stringify(languagesArray));
    formData.append('whatsapp', editForm.whatsapp);
    formData.append('companyName', editForm.companyName);
    formData.append('industry', editForm.industry);
    formData.append('hiringPreferences', JSON.stringify({
      lookingFor: editForm.hiringLookingFor,
      budgetRange: editForm.hiringBudgetRange,
    }));
    formData.append('socialLinks', JSON.stringify(socialLinksObj));

    setSavingProfile(true);
    try {
      await api.put(`/profile/${userId}`, formData);
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };


  const fetchShowcaseProjects = async (uid) => {
    setLoadingShowcase(true);
    try {
      const res = await api.get(
        `/profile/showcase-projects?freelancerId=${uid}&limit=50`,
      );
      setShowcaseProjects(res.data.projects || []);
    } catch (err) {
      console.error("Failed to fetch showcase projects:", err);
      setShowcaseProjects([]);
    } finally {
      setLoadingShowcase(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/profile/public/${userId}`);
      const profileData = response.data.profile;

      // Redirect admin profiles to the dedicated admin profile page
      if (profileData.role === 'admin') {
        navigate(`/admin/profile/${userId}`, { replace: true });
        return;
      }

      // Fetch reviews if freelancer
      if (profileData.role === "freelancer") {
        try {
          const reviewsResponse = await api.get(`/reviews/${userId}`);
          profileData.reviews = reviewsResponse.data.reviews || [];
          profileData.averageRating = reviewsResponse.data.averageRating || 0;
          profileData.totalReviews = reviewsResponse.data.totalReviews || 0;
        } catch (err) {
          console.error("Failed to fetch reviews:", err);
          profileData.reviews = [];
        }
      }

      // Fetch jobs if client
      if (profileData.role === "client") {
        try {
          const jobsResponse = await api.get(`/jobs/my-jobs`);
          const allJobs = jobsResponse.data.jobs || [];
          profileData.activeJobs = allJobs.filter(
            (job) => job.status === "open" || job.status === "ongoing",
          );
          profileData.completedJobs = allJobs.filter(
            (job) => job.status === "completed" || job.status === "closed",
          );
        } catch (err) {
          console.error("Failed to fetch jobs:", err);
          profileData.activeJobs = [];
          profileData.completedJobs = [];
        }
      }

      // Fetch posts
      try {
        const postsResponse = await api.get(`/posts/user/${userId}`);
        profileData.posts = postsResponse.data.posts || [];
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        profileData.posts = [];
      }

      // Fetch projects if freelancer
      if (profileData.role === "freelancer") {
        try {
          const projectsResponse = await api.get(
            `/profile/showcase-projects?freelancerId=${userId}&limit=50`,
          );
          profileData.projects = projectsResponse.data.projects || [];
        } catch (err) {
          console.error("Failed to fetch projects:", err);
          profileData.projects = [];
        }
      }

      setProfile(profileData);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/follows/${userId}/status`);
      setFollowing(response.data.following);
    } catch (error) {
      console.error("Failed to check follow status");
    }
  };

  const handleFollow = async () => {
    if (loadingFollow) return;

    try {
      setLoadingFollow(true);
      const response = await api.post(`/follows/${userId}`);
      setFollowing(response.data.following);
      toast.success(response.data.following ? "Following!" : "Unfollowed");
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${postToDelete}`);
      toast.success("Post deleted!");
      setShowDeleteModal(false);
      setPostToDelete(null);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleAddPortfolio = async () => {
    if (!portfolioForm.title || !portfolioForm.description) {
      toast.error("Please fill in title and description");
      return;
    }
    try {
      await api.post("/profile/portfolio", portfolioForm);
      toast.success("Portfolio item added!");
      setShowPortfolioModal(false);
      setPortfolioForm({ title: "", description: "", link: "", image: "" });
      fetchProfile();
    } catch (error) {
      toast.error("Failed to add portfolio item");
    }
  };

  const handleAddService = async () => {
    if (!serviceForm.title || !serviceForm.description || !serviceForm.price) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await api.post("/profile/services", serviceForm);
      toast.success("Service added!");
      setShowServiceModal(false);
      setServiceForm({ title: "", description: "", price: "" });
      fetchProfile();
    } catch (error) {
      toast.error("Failed to add service");
    }
  };

  const handleContactUser = async () => {
    try {
      const response = await api.post("/pre-project-chats/create-direct", {
        otherUserId: userId,
      });

      if (response.data.success) {
        const role = adminStored ? 'admin' : user?.role;
        const messagesPath = `/${role}/messages?chatId=${response.data.chatId}`;
        navigate(messagesPath);
        toast.success(`Opening chat with ${profile?.fullName}`);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to open chat");
    }
  };

  // ── Showcase project handlers ─────────────────────────────────────────────
  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm(emptyProjectForm);
    setImagePreview(null);
    setUploadProgress(0);
    setShowProjectModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProjectForm((f) => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProject = async () => {
    const {
      title,
      description,
      category,
      customCategory,
      projectLink,
      technologies,
      completionDate,
      image,
    } = projectForm;
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Title, description and category are required");
      return;
    }
    const finalCategory =
      category === "Others" && customCategory.trim()
        ? customCategory.trim()
        : category;
    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", title.trim());
      data.append("description", description.trim());
      data.append("category", finalCategory);
      data.append("projectLink", projectLink.trim());
      data.append("technologies", technologies);
      data.append("completionDate", completionDate || "");
      data.append("freelancerName", profile?.fullName || user.name || "");
      data.append("freelancerProfileImage", profile?.profileImage || "");
      if (image instanceof File) data.append("image", image);

      await api.post("/profile/showcase-projects", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total)
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      toast.success("Project created and published!");
      setShowProjectModal(false);
      setProjectForm(emptyProjectForm);
      setImagePreview(null);
      setUploadProgress(0);
      fetchShowcaseProjects(userId);
    } catch (err) {
      console.error("Save project error:", err);
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {(currentUser?.role === 'client' || currentUser?.role === 'freelancer')
        ? <Sidebar />
        : <AdminSidebar
            user={adminStored}
            tab="profile"
            setTab={(id) => navigate(`/admin/dashboard?tab=${id}`)}
            setSearch={() => {}}
            logout={() => { localStorage.removeItem('token'); localStorage.removeItem('adminUser'); navigate('/admin/login'); }}
            onBroadcast={() => {}}
          />
      }
        <div className="flex-1 lg:ml-64">
          {(currentUser?.role === 'client' || currentUser?.role === 'freelancer') && <Navbar />}
          <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-3xl mb-20"></div>
                <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-b-3xl p-8`}>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {(currentUser?.role === 'client' || currentUser?.role === 'freelancer')
        ? <Sidebar />
        : <AdminSidebar
            user={adminStored}
            tab="profile"
            setTab={(id) => navigate(`/admin/dashboard?tab=${id}`)}
            setSearch={() => {}}
            logout={() => { localStorage.removeItem('token'); localStorage.removeItem('adminUser'); navigate('/admin/login'); }}
            onBroadcast={() => {}}
          />
      }
        <div className="flex-1 lg:ml-64">
          {(currentUser?.role === 'client' || currentUser?.role === 'freelancer') && <Navbar />}
          <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto text-center py-12">
              <p className={`text-lg ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Profile not found</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {(currentUser?.role === 'client' || currentUser?.role === 'freelancer')
        ? <Sidebar />
        : <AdminSidebar
            user={adminStored}
            tab="profile"
            setTab={(id) => navigate(`/admin/dashboard?tab=${id}`)}
            setSearch={() => {}}
            logout={() => { localStorage.removeItem('token'); localStorage.removeItem('adminUser'); navigate('/admin/login'); }}
            onBroadcast={() => {}}
          />
      }

      <div className="w-screen lg:flex-1 lg:ml-64">
        {(currentUser?.role === 'client' || currentUser?.role === 'freelancer') && <Navbar />}
        <div className="py-2 md:p-8">
          <div className="mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className={`mb-4 flex items-center gap-2 transition ${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            {/* Cover Banner */}

<motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setCoverPhotoPreview(true)}
              className={`lg:h-64 md:h-32 h-24 lg:rounded-t-3xl cursor-pointer relative ${
                profile?.coverPhoto
                  ? "bg-cover bg-center bg-no-repeat"
                  : isFreelancer
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500"
              } ${profile?.coverPhoto ? `bg-[url(${profile.coverPhoto})]` : ""}`}
              style={profile?.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})` } : {}}
            >

              <div className="absolute lg:-bottom-16 -bottom-12 lg:left-8 left-4">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile?.fullName}
                    className="lg:w-32 lg:h-32 w-24 h-24 rounded-full object-cover lg:border-8 border-4 border-white shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
                    onClick={() => setShowImageModal(true)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&size=200&background=${isFreelancer ? "10b981" : "eab308"}&color=fff`;
                    }}
                  />
                ) : (
                  <div
                    className={`w-32 h-32 rounded-full cursor-pointer hover:shadow-2xl transition-shadow ${
                      isFreelancer ? "bg-green-500" : "bg-yellow-500"
                    } border-8 border-white flex items-center justify-center text-white text-5xl font-bold shadow-xl`}
                    onClick={() => setShowImageModal(true)}
                  >
                    {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`${dark ? 'bg-gray-800' : 'bg-white'} lg:rounded-b-3xl lg:shadow-lg lg:pt-20 pt-12 px-4 lg:px-6 pb-6 mb-6`}
            >
              <div className="grid grid-rows-1 md:grid-cols-1 justify-between items-end">
                <div>
                  <h1 className={`lg:text-3xl text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {profile?.fullName}
                  </h1>
                  <div className={`flex items-center gap-4 lg:text-base text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {profile?.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.country}</span>
                      </div>
                    )}
                    {isFreelancer && profile?.skillCategory && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{profile.skillCategory}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex items-center justify-start gap-4">
                      <div className="text-center">
                        <p className={`lg:text-2xl text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                          {profile.followersCount || 0}
                        </p>
                        <p className={`lg:text-sm text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Followers
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`lg:text-2xl text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                          {profile.followingCount || 0}
                        </p>
                        <p className={`lg:text-sm text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Following
                        </p>
                      </div>
                      {isFreelancer && (
                        <div className="text-center">
                          <p className={`lg:text-2xl text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                            {profile.projects?.length || 0}
                          </p>
                          <p className={`lg:text-sm text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Projects
                          </p>
                        </div>
                      )}
                    </div>

                    {isOwnProfile && activeTab === "about" && (
                    <div className="flex items-center justify-end">
                      <button
                        onClick={openEditProfile}
                        className={`px-6 py-3 font-medium transition flex items-end justify-end gap-2 mx-auto ${dark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        <svg className="md:w-8 md:h-8 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex justify-end mt-4 gap-3">
                    <button
                      onClick={handleFollow}
                      disabled={loadingFollow}
                      className={`px-6 py-2 rounded-lg font-medium transition ${
                        following
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : isFreelancer
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-yellow-600 hover:bg-yellow-700 text-white"
                      }`}
                    >
                      {loadingFollow
                        ? "..."
                        : following
                          ? "Following"
                          : "Follow"}
                    </button>
                    <button
                      onClick={handleContactUser}
                      className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                        isFreelancer
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Me
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {isOwnProfile && (
              <ProfileCompletionWidget userRole={profile.role} />
            )}

            {/* Tabs */}
            <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg mb-6`}>
              <div className={`border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="overflow-x-auto no-scrollbar pb-2">
                  <div className="flex flex-nowrap gap-3 sm:gap-6 px-6 sm:px-8 min-w-max">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base flex items-center transition whitespace-nowrap relative ${
                          activeTab === tab
                            ? isFreelancer
                              ? "text-green-600"
                              : "text-yellow-600"
                            : dark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {tabLabels[tab]}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                              isFreelancer ? "bg-green-600" : "bg-yellow-600"
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "about" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Intro Video Section - Show for Freelancers */}
                    {isFreelancer && profile.introVideoUrl && (
                      <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl lg:p-6 p-3`}>
                        <h3 className={`lg:text-xl text-sm font-bold mb-4 flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                          <Award className="w-6 h-6 text-green-600" />
                          Introduction Video
                        </h3>
                        <video
                          src={profile.introVideoUrl}
                          controls
                          className="w-full max-h-96 rounded-lg"
                        />
                      </div>
                    )}

                    {/* Professional Info - From Onboarding */}
                    {isFreelancer &&
                      (profile.professionalTitle ||
                        profile.bio ||
                        profile.yearsOfExperience) && (
                        <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6`}>
                          <h3 className={`lg:text-xl text-sm font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
                            Professional Information
                          </h3>
                          {profile.professionalTitle && (
                            <div className="mb-3">
                              <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Title: </span>
                              <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.professionalTitle}</span>
                            </div>
                          )}
                          {profile.yearsOfExperience && (
                            <div className="mb-3">
                              <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Experience: </span>
                              <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.yearsOfExperience} years</span>
                            </div>
                          )}
                          {profile.bio && (
                            <div className="mt-4">
                              <p className={`font-semibold mb-2 ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Bio:</p>
                              <p className={`leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{profile.bio}</p>
                            </div>
                          )}
                          {profile.hourlyRate && (
                            <div className="mt-3">
                              <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Hourly Rate: </span>
                              <span className="text-green-600 font-bold">${profile.hourlyRate}/hr</span>
                            </div>
                          )}
                          {profile.availability && (
                            <div className="mt-3">
                              <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Availability: </span>
                              <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.availability}</span>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Bio Section - Legacy */}
                    {profile.about?.bio && (
                      <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6`}>
                        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>About</h3>
                        <p className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.about.bio}</p>
                        {profile.about.experience && (
                          <div className="mt-3">
                            <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Experience: </span>
                            <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.about.experience}</span>
                          </div>
                        )}
                        {profile.about.education && (
                          <div className="mt-2">
                            <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Education: </span>
                            <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.about.education}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skills - From Onboarding */}
                    {isFreelancer && profile.skills && profile.skills.length > 0 && (
                      <div>
                        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages - From Onboarding */}
                    {isFreelancer && profile.languages && profile.languages.length > 0 && (
                      <div>
                        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Languages</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.languages.map((language, index) => (
                            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Links - From Onboarding */}
                    {isFreelancer && profile.socialLinks && (
                      <div>
                        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Social Links</h3>
                        <div className="space-y-2">
                          {profile.socialLinks.linkedin && (
                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                              <ExternalLink className="w-4 h-4" />LinkedIn
                            </a>
                          )}
                          {profile.socialLinks.github && (
                            <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${dark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}>
                              <ExternalLink className="w-4 h-4" />GitHub
                            </a>
                          )}
                          {profile.socialLinks.portfolio && (
                            <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                              <ExternalLink className="w-4 h-4" />Portfolio
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div>
                      <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`flex items-center gap-3 p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                          <Mail className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <div>
                            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                            <p className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{profile?.email}</p>
                          </div>
                        </div>
                        {profile?.whatsapp && (
                          <div className={`flex items-center gap-3 p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                            <Phone className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-600'}`} />
                            <div>
                              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>WhatsApp</p>
                              <p className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{profile.whatsapp}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Legacy Skills */}
                    {isFreelancer && profile.about?.skills && profile.about.skills.length > 0 && !profile.skills && (
                      <div>
                        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.about.skills.map((skill, index) => (
                            <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legacy Links */}
                    {isFreelancer && (profile?.portfolioWebsite || profile?.linkedIn) && !profile.socialLinks && (
                      <div>
                        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Links</h3>
                        <div className="space-y-2">
                          {profile?.portfolioWebsite && (
                            <a href={profile.portfolioWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                              <ExternalLink className="w-4 h-4" />Portfolio Website
                            </a>
                          )}
                          {profile?.linkedIn && (
                            <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                              <ExternalLink className="w-4 h-4" />LinkedIn Profile
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Company Info */}
                    {isClient && profile?.companyName && (
                      <div>
                        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Company Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                            <p className={`text-sm mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Company Name</p>
                            <p className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{profile.companyName}</p>
                          </div>
                          {profile.companyWebsite && (
                            <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                              <p className={`text-sm mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Website</p>
                              <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-700">{profile.companyWebsite}</a>
                            </div>
                          )}
                          {profile.industry && (
                            <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                              <p className={`text-sm mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Industry</p>
                              <p className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{profile.industry}</p>
                            </div>
                          )}
                        </div>
                        {profile.hiringPreferences && (
                          <div className={`mt-4 p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                            <p className={`text-sm mb-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Hiring Preferences</p>
                            <div className={`space-y-1 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {profile.hiringPreferences.lookingFor && (
                                <p><span className="font-medium">Looking for:</span> {profile.hiringPreferences.lookingFor}</p>
                              )}
                              {profile.hiringPreferences.budgetRange && (
                                <p><span className="font-medium">Budget:</span> {profile.hiringPreferences.budgetRange}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "portfolio" && isFreelancer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {isOwnProfile && (
                      <button
                        onClick={openCreateProject}
                        className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        + Create Project
                      </button>
                    )}
                    {loadingShowcase ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`${dark ? 'bg-gray-700' : 'bg-white'} rounded-xl overflow-hidden shadow-md animate-pulse`}>
                            <div className="w-full h-48 bg-gray-200" />
                            <div className="p-6 space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                              <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : showcaseProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {showcaseProjects.map((item) => (
                          <div key={item.id} className={`${dark ? 'bg-gray-700' : 'bg-white'} rounded-xl overflow-hidden shadow-md hover:shadow-xl transition`}>
                            {item.projectImage ? (
                              <img src={item.projectImage} alt={item.title} className="w-full h-48 object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <Briefcase className="w-16 h-16 text-green-600" />
                              </div>
                            )}
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full ml-2 shrink-0">{item.category}</span>
                              </div>
                              <p className={`text-sm mb-3 line-clamp-3 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                              {item.technologies?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {item.technologies.map((t, i) => (
                                    <span key={i} className={`text-xs px-2 py-0.5 rounded ${dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{t}</span>
                                  ))}
                                </div>
                              )}
                              {item.projectLink && (
                                <a href={item.projectLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium mb-4">
                                  <ExternalLink className="w-4 h-4" />View Project
                                </a>
                              )}
                              {!isOwnProfile && (
                                <button onClick={handleContactUser} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center justify-center gap-2">
                                  <MessageCircle className="w-4 h-4" />Contact Me
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No projects yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "services" && isFreelancer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {isOwnProfile && (
                      <button
                        onClick={() => setShowServiceModal(true)}
                        className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        + Add Service
                      </button>
                    )}
                    {profile.services && profile.services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {profile.services.map((service) => (
                          <div key={service.id} className={`${dark ? 'bg-gray-700' : 'bg-white'} rounded-xl p-6 shadow-md hover:shadow-xl transition`}>
                            <h4 className={`font-bold text-lg mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>{service.title}</h4>
                            <p className={`text-sm mb-4 line-clamp-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{service.description}</p>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-2xl font-bold text-green-600">{service.price}</span>
                              <Briefcase className="w-6 h-6 text-green-600" />
                            </div>
                            {isOwnProfile ? (
                              <button onClick={() => { setItemToDelete(service); setShowDeleteServiceModal(true); }} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition">
                                Delete Service
                              </button>
                            ) : (
                              <button onClick={handleContactUser} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center justify-center gap-2">
                                <MessageCircle className="w-4 h-4" />Contact Me
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No services listed yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "active-jobs" && isClient && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {profile.activeJobs && profile.activeJobs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {profile.activeJobs.map((job) => (
                          <div key={job.id} className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h4>
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{job.status?.toUpperCase() || "ACTIVE"}</span>
                              </div>
                              {job.budgetRange && <p className="text-xl font-bold text-yellow-600">{job.budgetRange}</p>}
                            </div>
                            {job.description && <p className={`mb-3 line-clamp-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{job.description}</p>}
                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map((skill, idx) => (
                                  <span key={idx} className={`px-3 py-1 rounded-full text-sm ${dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{skill}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No active jobs</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "completed-jobs" && isClient && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {profile.completedJobs && profile.completedJobs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {profile.completedJobs.map((job) => (
                          <div key={job.id} className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h4>
                                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">COMPLETED</span>
                              </div>
                              {job.budgetRange && <p className={`text-xl font-bold ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{job.budgetRange}</p>}
                            </div>
                            {job.description && <p className={`mb-3 line-clamp-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{job.description}</p>}
                            {job.completedAt && <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Completed on {new Date(job.completedAt).toLocaleDateString()}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No completed jobs yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "projects" && isFreelancer && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {(() => {
                      const activeJobs = (profile.projects || []).filter(
                        (p) => p.status === "ongoing" || p.status === "awaiting_confirmation" || p.status === "active",
                      );
                      return activeJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeJobs.map((project) => (
                            <div key={project.id} className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className={`font-bold text-lg mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{project.job?.title || "Project"}</h4>
                                  <p className={`text-sm line-clamp-2 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{project.job?.description}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${project.status === "awaiting_confirmation" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                                  {project.status === "awaiting_confirmation" ? "Pending" : "Ongoing"}
                                </span>
                              </div>
                              <div className={`flex items-center gap-4 text-sm mb-3 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /><span>{project.job?.budget || project.job?.budgetRange || "N/A"}</span></div>
                                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{new Date(project.startedAt).toLocaleDateString()}</span></div>
                              </div>
                              <div className={`flex items-center gap-3 pt-3 border-t ${dark ? 'border-gray-600' : 'border-gray-100'}`}>
                                <img src={project.client?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client?.fullName || "Client")}`} alt={project.client?.fullName} className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{project.client?.fullName}</p>
                                  <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{project.client?.companyName || "Client"}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No active jobs at the moment</p>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {activeTab === "posts" && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {profile.posts && profile.posts.length > 0 ? (
                      <div className="space-y-4">
                        {profile.posts.map((post) => (
                          <EnhancedPostCard
                            key={post.id}
                            post={post}
                            profile={profile}
                            isOwnProfile={isOwnProfile}
                            onDelete={(postId) => { setPostToDelete(postId); setShowDeleteModal(true); }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No posts yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "reviews" && isFreelancer && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {!isOwnProfile && (
                      <button onClick={() => setShowReviewModal(true)} className="mb-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium">
                        ⭐ Leave a Review
                      </button>
                    )}
                    {profile.reviews && profile.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {profile.reviews.map((review) => (
                          <div key={review.id} className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                            <div className="flex items-start gap-4">
                              <img
                                src={
                                  review.reviewer?.profileImage ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.fullName || "User")}`
                                }
                                alt={review.reviewer?.fullName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h5 className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>
                                      {review.reviewer?.fullName || "Anonymous"}
                                    </h5>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>⭐</span>
                                      ))}
                                      <span className={`text-sm ml-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  {user?.id === review.reviewerId && (
                                    <button
                                      onClick={() => {
                                        if (confirm("Delete this review?")) {
                                          api
                                            .delete(`/reviews/${review.id}`)
                                            .then(() => {
                                              toast.success("Review deleted!");
                                              fetchProfile();
                                            })
                                            .catch(() =>
                                              toast.error(
                                                "Failed to delete review",
                                              ),
                                            );
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                                <p className={dark ? 'text-gray-300' : 'text-gray-700'}>
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No reviews yet</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        freelancerName={profile?.fullName}
        onSubmit={async (reviewData) => {
          try {
            await api.post(`/reviews/${userId}`, reviewData);
            toast.success("Review added!");
            fetchProfile();
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Failed to add review",
            );
            throw error;
          }
        }}
      />

      {/* Delete Post Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Post
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePost}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Portfolio Modal */}
      <AnimatePresence>
        {showPortfolioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Add Portfolio Item
                </h3>
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setPortfolioForm({
                      title: "",
                      description: "",
                      link: "",
                      image: "",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={portfolioForm.title}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., E-commerce Website"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={portfolioForm.description}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Link (optional)
                  </label>
                  <input
                    type="url"
                    value={portfolioForm.link}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        link: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={portfolioForm.image}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        image: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500">Or upload an image:</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // For now, just show a message that image upload needs backend support
                        toast.info(
                          "Image upload feature coming soon. Please use image URL for now.",
                        );
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setPortfolioForm({
                      title: "",
                      description: "",
                      link: "",
                      image: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPortfolio}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Add Portfolio Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Service</h3>
                <button
                  onClick={() => {
                    setShowServiceModal(false);
                    setServiceForm({ title: "", description: "", price: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Logo Design"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your service..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., $50 or $50-$100"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowServiceModal(false);
                    setServiceForm({ title: "", description: "", price: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Add Service
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Portfolio Modal */}
      <AnimatePresence>
        {showDeletePortfolioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Portfolio Item?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{itemToDelete?.title}"? This
                action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeletePortfolioModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/profile/portfolio/${itemToDelete.id}`);
                      toast.success("Portfolio item deleted!");
                      setShowDeletePortfolioModal(false);
                      setItemToDelete(null);
                      fetchProfile();
                    } catch (error) {
                      toast.error("Failed to delete portfolio item");
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Service Modal */}
      <AnimatePresence>
        {showDeleteServiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Service?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{itemToDelete?.title}"? This
                action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteServiceModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/profile/services/${itemToDelete.id}`);
                      toast.success("Service deleted!");
                      setShowDeleteServiceModal(false);
                      setItemToDelete(null);
                      fetchProfile();
                    } catch (error) {
                      toast.error("Failed to delete service");
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Profile Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 lg:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${dark ? 'bg-gray-800' : 'bg-white'} lg:rounded-3xl w-full lg:max-w-2xl w-screen lg:max-h-[90vh] h-screen overflow-y-auto shadow-2xl`}
            >
              <div className={`sticky top-0 flex items-center justify-between lg:p-6 p-3 border-b ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} z-10`}>
                <h3 className={`lg:text-2xl text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  Edit Profile
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-2 rounded-xl transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-6 h-6 ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Info - Freelancer */}
                {isFreelancer && (
                  <div className="bg-emerald-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Professional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Professional Title
                        </label>
                        <input
                          type="text"
                          value={editForm.professionalTitle}
                          onChange={(e) => setEditForm({...editForm, professionalTitle: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., Full Stack Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          value={editForm.yearsOfExperience}
                          onChange={(e) => setEditForm({...editForm, yearsOfExperience: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.hourlyRate}
                          onChange={(e) => setEditForm({...editForm, hourlyRate: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Availability
                        </label>
                        <select
                          value={editForm.availability}
                          onChange={(e) => setEditForm({...editForm, availability: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Select availability</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* About/Bio */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    About
                  </h4>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    placeholder="Tell us about yourself and your experience..."
                  />
                </div>

                {/* Skills & Languages */}
                {isFreelancer && (
                  <>
                    <div className="bg-emerald-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                        Skills (comma separated)
                      </h4>
                      <input
                        type="text"
                        value={editForm.skills}
                        onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="React, Node.js, Python, AWS..."
                      />
                      <p className="text-xs text-emerald-700 mt-2">Enter skills separated by commas</p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                        Languages (comma separated)
                      </h4>
                      <input
                        type="text"
                        value={editForm.languages}
                        onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="English, Spanish, French..."
                      />
                      <p className="text-xs text-blue-700 mt-2">Enter languages separated by commas</p>
                    </div>
                  </>
                )}

                {/* Contact */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Contact Information
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.whatsapp}
                      onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-indigo-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Social Links
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={editForm.socialLinkedin}
                        onChange={(e) => setEditForm({...editForm, socialLinkedin: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={editForm.socialGithub}
                        onChange={(e) => setEditForm({...editForm, socialGithub: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio
                      </label>
                      <input
                        type="url"
                        value={editForm.socialPortfolio}
                        onChange={(e) => setEditForm({...editForm, socialPortfolio: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                {isClient && (
                  <div className="bg-yellow-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Company Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={editForm.companyName}
                          onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={editForm.industry}
                          onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="e.g., Technology, Finance"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What you're looking for
                        </label>
                        <textarea
                          value={editForm.hiringLookingFor}
                          onChange={(e) => setEditForm({...editForm, hiringLookingFor: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Full stack developers, mobile app experts..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Range
                        </label>
                        <input
                          type="text"
                          value={editForm.hiringBudgetRange}
                          onChange={(e) => setEditForm({...editForm, hiringBudgetRange: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="e.g., $1,000 - $5,000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="md:px-8 p-3 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-medium transition flex-1 md:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="md:px-8 p-3 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-medium transition flex-1 md:flex-none flex items-center justify-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Profile Image Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showImageModal && profile && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className=" backdrop-blur-sm xl:rounded-3xl max-w-screen xl:max-w-2xl w-full max-h-[100vh] overflow-hidden relative shadow-2xl"
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute z-20 top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition shadow-lg"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
              
              <div className="flex flex-col items-center gap-6 pt-8 pb-12">
                <div className="relative">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.fullName}
    className="max-w-screen max-h-screen w-auto h-auto object-cover"

                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&size=320&background=${isFreelancer ? "10b981" : "eab308"}&color=fff`;
                      }}
                    />
                  ) : (
                    <div
                      className={`w-64 h-64 lg:w-80 lg:h-80 rounded-full border-8 border-white shadow-2xl flex items-center justify-center text-6xl font-bold mx-auto ${isFreelancer ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}
                    >
                      {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                  <h2 className="absolute translate-y-1/2 h-screen text-sm lg:text-2xl font-semibold text-white/30 text-center">
                  {profile.fullName} <span className="text-xs lg:text-lg font-normal">@AFRO TASK</span>
                  </h2>
                
                
                <div className="absolute flex flex-col justify-between gap-3  z-20">
                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        setShowImageModal(false);
                        openProfileImageUpload();
                      }}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition shadow-lg flex items-center gap-2 z-20 w-max self-end"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile Picture
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Profile Image Upload Modal with Crop ───────────────────────────── */}
      <AnimatePresence>
        {showProfileImageUpload && isOwnProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 md:p-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white md:rounded-2xl p-6 max-w-3xl w-full md:max-h-[90vh] overflow-y-auto h-full overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4 ">
                <h3 className="md:text-lg text-base font-bold text-gray-900">Crop Profile Picture (1:1)</h3>
                <button
                  onClick={() => {
                    setShowProfileImageUpload(false);
                    setSelectedImage(null);
                    setProfileImageFile(null);
                    setProfileImagePreview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedImage ? (
                <div className="space-y-4 h-auto flex flex-col">
                  <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                    <Cropper
                      image={selectedImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 text-xs text-gray-500">
                      Zoom: {Math.round(zoom * 100)}% | Drag to reposition
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setZoom(zoom - 0.1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(zoom + 0.1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="md:text-sm text-xs flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowProfileImageUpload(false);
                        setSelectedImage(null);
                        setProfileImageFile(null);
                      }}
                      className="flex-1 md:py-3 md:px-4 p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={inputRef.current?.click()}
                      className="flex-1 md:py-3 md:px-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={handleProfileImageUpload}
                      disabled={!croppedAreaPixels || !profileImageFile}
                      className="flex-1 md:py-3 md:px-4 p-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
                    >
                    Upload
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">Choose profile picture</h4>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onSelectFile}
                  />
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Select Image
                  </button>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onSelectFile}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Cover Photo Upload Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showCoverPhotoUpload && isOwnProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Update Cover Photo</h3>
                <button
                  onClick={() => setShowCoverPhotoUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {coverPhotoPreview && (
                  <div>
                    <img src={coverPhotoPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCoverPhotoUpload(false);
                    setCoverPhotoFile(null);
                    setCoverPhotoPreview(null);
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCoverPhotoUpload}
                  disabled={!coverPhotoFile}
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create Project Modal ──────────────────────────────────────────── */}
      {showProjectModal && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Create Project
              </h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., E-commerce Website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description *
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe what you built, the problem it solves, and your role..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={projectForm.category}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      category: e.target.value,
                      customCategory: "",
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {projectForm.category === "Others" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Category *
                  </label>
                  <input
                    type="text"
                    value={projectForm.customCategory}
                    onChange={(e) =>
                      setProjectForm((f) => ({
                        ...f,
                        customCategory: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Blockchain Development"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 w-full h-48 object-cover rounded-lg"
                  />
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Link
                </label>
                <input
                  type="url"
                  value={projectForm.projectLink}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      projectLink: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://github.com/... or live URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={projectForm.technologies}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      technologies: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="React, Node.js, MongoDB (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={projectForm.completionDate}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      completionDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowProjectModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium transition"
              >
                {saving ? "Saving..." : "Publish Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
