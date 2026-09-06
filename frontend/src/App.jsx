import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import CommunityDashboard from "./pages/CommunityDashboard";
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import NotFound from './pages/NotFound';

function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/register" element={<Register />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/community/:communityId" element={<CommunityDashboard />} />
    <Route path="/community/:communityId/announcements" element={<Announcements />} />
    <Route path="/community/:communityId/events" element={<Events />} />
    <Route path="/community/:communityId/members" element={<Members />} />
    <Route path="/community/:communityId/attendance" element={<Attendance />} />
    <Route path="*" element={<NotFound />} />



  </Routes></BrowserRouter>;
}

export default App;