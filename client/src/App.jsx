import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import FreelancerFeed from './pages/FreelancerFeed';
import ClientFeed from './pages/ClientFeed';
import AdminDashboard from './pages/AdminDashboard';
import ExploreJobs from './pages/ExploreJobs';
import MyApplications from './pages/MyApplications';
import CreatePost from './pages/CreatePost';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import MyProjects from './pages/MyProjects';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import MessagesPage from './pages/MessagesPage';
import PreProjectChat from './pages/PreProjectChat';
import FreelancerOnboarding from './pages/FreelancerOnboarding';
import ClientOnboarding from './pages/ClientOnboarding';
import ProjectWorkspace from './pages/ProjectWorkspace';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/signup/:role" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Onboarding Routes */}
          <Route path="/freelancer/onboarding" element={
            <PrivateRoute role="freelancer">
              <FreelancerOnboarding />
            </PrivateRoute>
          } />
          <Route path="/client/onboarding" element={
            <PrivateRoute role="client">
              <ClientOnboarding />
            </PrivateRoute>
          } />
          
          {/* Freelancer Routes */}
          <Route path="/freelancer/dashboard" element={
            <PrivateRoute role="freelancer">
              <FreelancerFeed />
            </PrivateRoute>
          } />
          <Route path="/freelancer/feed" element={
            <PrivateRoute role="freelancer">
              <FreelancerFeed />
            </PrivateRoute>
          } />
          <Route path="/freelancer/jobs" element={
            <PrivateRoute role="freelancer">
              <ExploreJobs />
            </PrivateRoute>
          } />
          <Route path="/freelancer/applications" element={
            <PrivateRoute role="freelancer">
              <MyApplications />
            </PrivateRoute>
          } />
          <Route path="/freelancer/projects/:status" element={
            <PrivateRoute role="freelancer">
              <MyProjects />
            </PrivateRoute>
          } />
          <Route path="/freelancer/create-post" element={
            <PrivateRoute role="freelancer">
              <CreatePost />
            </PrivateRoute>
          } />
          <Route path="/freelancer/profile" element={
            <PrivateRoute role="freelancer">
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/freelancer/messages" element={
            <PrivateRoute role="freelancer">
              <MessagesPage />
            </PrivateRoute>
          } />
          
          {/* Public Profile Route */}
          <Route path="/profile/:userId" element={
            <PrivateRoute>
              <PublicProfilePage />
            </PrivateRoute>
          } />
          
          {/* Pre-Project Chat Route */}
          <Route path="/pre-project-chat/:applicationId" element={
            <PrivateRoute>
              <PreProjectChat />
            </PrivateRoute>
          } />
          
          {/* Project Workspace Route */}
          <Route path="/project/:projectId" element={
            <PrivateRoute>
              <ProjectWorkspace />
            </PrivateRoute>
          } />
          
          {/* Client Routes */}
          <Route path="/client/dashboard" element={
            <PrivateRoute role="client">
              <ClientFeed />
            </PrivateRoute>
          } />
          <Route path="/client/feed" element={
            <PrivateRoute role="client">
              <ClientFeed />
            </PrivateRoute>
          } />
          <Route path="/client/post-job" element={
            <PrivateRoute role="client">
              <PostJob />
            </PrivateRoute>
          } />
          <Route path="/client/create-post" element={
            <PrivateRoute role="client">
              <CreatePost />
            </PrivateRoute>
          } />
          <Route path="/client/jobs" element={
            <PrivateRoute role="client">
              <MyJobs />
            </PrivateRoute>
          } />
          <Route path="/client/projects/:status" element={
            <PrivateRoute role="client">
              <MyProjects />
            </PrivateRoute>
          } />
          <Route path="/client/profile" element={
            <PrivateRoute role="client">
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/client/messages" element={
            <PrivateRoute role="client">
              <MessagesPage />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
