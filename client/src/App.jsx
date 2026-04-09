import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import PrivateRoute from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppBubble from './components/WhatsAppBubble';

// Pages
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import Blogs from './pages/Blogs';
import BlogPage from './pages/BlogPage';
import PolicyPage from './pages/PolicyPage';
import TermsPage from './pages/TermsPage';
import SearchResults from './pages/SearchResults';
import FreelancersPage from './pages/FreelancersPage';
import ExploreProjects from './pages/ExploreProjects';
import NotFound from './pages/NotFound';

// Auth / Onboarding
import FreelancerOnboarding from './pages/FreelancerOnboarding';
import ClientOnboarding from './pages/ClientOnboarding';

// Freelancer
import FreelancerFeed from './pages/FreelancerFeed';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ExploreJobs from './pages/ExploreJobs';
import MyApplications from './pages/MyApplications';
import MyProjects from './pages/MyProjects';
import CreatePost from './pages/CreatePost';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';

// Client
import ClientFeed from './pages/ClientFeed';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';

// Shared
import PublicProfilePage from './pages/PublicProfilePage';
import PreProjectChat from './pages/PreProjectChat';
import ProjectWorkspace from './pages/ProjectWorkspace';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className='overflow-x-hidden'>
      <Router>
        <DarkModeProvider>
          <AuthProvider>
            <ScrollToTop />
            <Toaster position="top-right" />
            <WhatsAppBubble />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/signup/:role" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:slug" element={<BlogPage />} />
              <Route path="/privacy-policy" element={<PolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/freelancers" element={<FreelancersPage />} />
              <Route path="/explore-projects" element={<ExploreProjects />} />

              {/* Onboarding */}
              <Route path="/freelancer/onboarding" element={
                <PrivateRoute role="freelancer"><FreelancerOnboarding /></PrivateRoute>
              } />
              <Route path="/client/onboarding" element={
                <PrivateRoute role="client"><ClientOnboarding /></PrivateRoute>
              } />

              {/* Freelancer routes */}
              <Route path="/freelancer/dashboard" element={
                <PrivateRoute role="freelancer"><FreelancerDashboard /></PrivateRoute>
              } />
              <Route path="/freelancer/feed" element={
                <PrivateRoute role="freelancer"><FreelancerFeed /></PrivateRoute>
              } />
              <Route path="/freelancer/jobs" element={
                <PrivateRoute role="freelancer"><ExploreJobs /></PrivateRoute>
              } />
              <Route path="/freelancer/applications" element={
                <PrivateRoute role="freelancer"><MyApplications /></PrivateRoute>
              } />
              <Route path="/freelancer/projects/:status" element={
                <PrivateRoute role="freelancer"><MyProjects /></PrivateRoute>
              } />
              <Route path="/freelancer/create-post" element={
                <PrivateRoute role="freelancer"><CreatePost /></PrivateRoute>
              } />
              <Route path="/freelancer/profile" element={
                <PrivateRoute role="freelancer"><ProfilePage /></PrivateRoute>
              } />
              <Route path="/freelancer/messages" element={
                <PrivateRoute role="freelancer"><MessagesPage /></PrivateRoute>
              } />

              {/* Client routes */}
              <Route path="/client/dashboard" element={
                <PrivateRoute role="client"><ClientFeed /></PrivateRoute>
              } />
              <Route path="/client/feed" element={
                <PrivateRoute role="client"><ClientFeed /></PrivateRoute>
              } />
              <Route path="/client/post-job" element={
                <PrivateRoute role="client"><PostJob /></PrivateRoute>
              } />
              <Route path="/client/create-post" element={
                <PrivateRoute role="client"><CreatePost /></PrivateRoute>
              } />
              <Route path="/client/jobs" element={
                <PrivateRoute role="client"><MyJobs /></PrivateRoute>
              } />
              <Route path="/client/projects/:status" element={
                <PrivateRoute role="client"><MyProjects /></PrivateRoute>
              } />
              <Route path="/client/profile" element={
                <PrivateRoute role="client"><ProfilePage /></PrivateRoute>
              } />
              <Route path="/client/messages" element={
                <PrivateRoute role="client"><MessagesPage /></PrivateRoute>
              } />

              {/* Shared protected */}
              <Route path="/profile/:userId" element={
                <PrivateRoute><PublicProfilePage /></PrivateRoute>
              } />
              <Route path="/pre-project-chat/:applicationId" element={
                <PrivateRoute><PreProjectChat /></PrivateRoute>
              } />
              <Route path="/project/:projectId" element={
                <PrivateRoute><ProjectWorkspace /></PrivateRoute>
              } />

              {/* Admin */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </DarkModeProvider>
      </Router>
    </div>
  );
}

export default App;
