import { Routes, Route } from 'react-router-dom';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PreparationHub from './pages/PreparationHub';
import InterviewRoom from './pages/InterviewRoom';
import Results from './pages/Results';
import Settings from './pages/Settings';

// HR Pages
import RoleSelector from './pages/RoleSelector';
import HRDashboard from './pages/HRDashboard';
import JobPostingForm from './pages/JobPostingForm';
import HRJobsList from './pages/HRJobsList';
import ApplicationsView from './pages/ApplicationsView';

// Candidate Pages
import JobListings from './pages/JobListings';
import JobDetails from './pages/JobDetails';
import MyApplications from './pages/MyApplications';

export default function App() {
  return (
    <Routes>
      {/* Public Routes (No Sidebar) */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-role" element={<RoleSelector />} />
      </Route>

      {/* Protected Routes (With Sidebar & Navbar) */}
      <Route element={<MainLayout />}>
        {/* Original Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/preparation" element={<PreparationHub />} />
        <Route path="/interview" element={<InterviewRoom />} />
        <Route path="/results/:sessionId?" element={<Results />} />
        <Route path="/settings" element={<Settings />} />

        {/* HR Routes */}
        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/hr/post-job" element={<JobPostingForm />} />
        <Route path="/hr/jobs" element={<HRJobsList />} />
        <Route path="/hr/jobs/:jobId/edit" element={<JobPostingForm />} />
        <Route path="/hr/jobs/:jobId/applications" element={<ApplicationsView />} />

        {/* Candidate Routes */}
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/interview/:jobId/:applicationId" element={<InterviewRoom />} />
      </Route>
    </Routes>
  );
}
