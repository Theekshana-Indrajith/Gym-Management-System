import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WorkoutDiet from './pages/WorkoutDiet';
import Offers from './pages/Offers';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsersAdmin from './pages/ManageUsersAdmin';
import ManageTrainersAdmin from './pages/ManageTrainersAdmin';
import UserManagementPage from './pages/UserManagementPage';
import EquipmentMaintenance from './pages/EquipmentMaintenance';
import InventoryStoreAdmin from './pages/InventoryStoreAdmin';
import WorkoutPlanManagement from './pages/WorkoutPlanManagement';
import MealPlanManagement from './pages/MealPlanManagement';
import FeedbackInquiriesAdmin from './pages/FeedbackInquiriesAdmin';

// Trainer Pages
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerSchedule from './pages/TrainerSchedule';
import MyMembers from './pages/MyMembers';
import EquipmentStatus from './pages/EquipmentStatus';

// Optional: Keep MemberInquiries if needed, but the user said replace 5 & 6
// import MemberInquiries from './pages/MemberInquiries';

// Member Pages
import MemberDashboard from './pages/MemberDashboard';
import MyProfile from './pages/MyProfile';
import TrainerSessions from './pages/TrainerSessions';
import SupplementStore from './pages/SupplementStore';
import MemberWorkoutTracking from './pages/MemberWorkoutTracking';
import MyProgress from './pages/MyProgress';
import MembershipManagementAdmin from './pages/MembershipManagementAdmin';
import MembershipSelection from './pages/MembershipSelection';
// import OffersLoyalty from './pages/OffersLoyalty';
// import HelpSupport from './pages/HelpSupport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/workout-diet" element={<WorkoutDiet />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-users" element={<ManageUsersAdmin />} />
        <Route path="/admin/manage-trainers" element={<ManageTrainersAdmin />} />
        <Route path="/admin/manage-members" element={<UserManagementPage role="MEMBER" />} />
        <Route path="/admin/equipment" element={<EquipmentMaintenance />} />
        <Route path="/admin/inventory" element={<InventoryStoreAdmin />} />
        <Route path="/admin/workout-plans" element={<WorkoutPlanManagement />} />
        <Route path="/admin/meal-plans" element={<MealPlanManagement />} />
        <Route path="/admin/membership" element={<MembershipManagementAdmin />} />
        <Route path="/admin/feedback" element={<FeedbackInquiriesAdmin />} />

        {/* Trainer Routes */}
        <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer/schedule" element={<TrainerSchedule />} />
        <Route path="/trainer/members" element={<MyMembers />} />
        <Route path="/trainer/equipment-status" element={<EquipmentStatus />} />

        <Route path="/trainer/workout-plans" element={<WorkoutPlanManagement />} />
        <Route path="/trainer/meal-plans" element={<MealPlanManagement />} />

        {/* Member Routes */}
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/member/profile" element={<MyProfile />} />
        <Route path="/member/trainer" element={<TrainerSessions />} />
        <Route path="/member/store" element={<SupplementStore />} />
        <Route path="/member/progress" element={<MyProgress />} />
        <Route path="/member/workout-plans" element={<MemberWorkoutTracking />} />
        <Route path="/member/meal-plans" element={<MealPlanManagement />} />
        <Route path="/member/membership" element={<MembershipSelection />} />
      </Routes>
    </Router>
  );
}

export default App;
