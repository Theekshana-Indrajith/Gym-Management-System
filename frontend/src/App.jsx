import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WorkoutDiet from './pages/WorkoutDiet';
import Offers from './pages/Offers';
import Location from './pages/Location';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsersAdmin from './pages/ManageUsersAdmin';
import ManageTrainersAdmin from './pages/ManageTrainersAdmin';
import EquipmentMaintenance from './pages/EquipmentMaintenance';
import InventoryStoreAdmin from './pages/InventoryStoreAdmin';
import WorkoutPlanManagement from './pages/WorkoutPlanManagement';
import MealPlanManagement from './pages/MealPlanManagement';
import AdminOrderHistory from './pages/AdminOrderHistory';

// Trainer Pages
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerSchedule from './pages/TrainerSchedule';
import MyMembers from './pages/MyMembers';
import AttendanceMarking from './pages/AttendanceMarking';
import EquipmentStatus from './pages/EquipmentStatus';
import AssignWorkouts from './pages/AssignWorkouts';

// Member Pages
import MemberDashboard from './pages/MemberDashboard';
import MyProfile from './pages/MyProfile';
import TrainerSessions from './pages/TrainerSessions';
import SupplementStore from './pages/SupplementStore';
import MyProgress from './pages/MyProgress';
import MembershipManagementAdmin from './pages/MembershipManagementAdmin';
import MembershipSelection from './pages/MembershipSelection';

// Components
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full">
        <main className="flex-1 w-full flex flex-col group/main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/workout-diet" element={<WorkoutDiet />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/location" element={<Location />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/manage-users" element={<ManageUsersAdmin />} />
            <Route path="/admin/manage-trainers" element={<ManageTrainersAdmin />} />
            <Route path="/admin/equipment" element={<EquipmentMaintenance />} />
            <Route path="/admin/inventory" element={<InventoryStoreAdmin />} />
            <Route path="/admin/workout-plans" element={<WorkoutPlanManagement />} />
            <Route path="/admin/meal-plans" element={<MealPlanManagement />} />
            <Route path="/admin/membership" element={<MembershipManagementAdmin />} />
            <Route path="/admin/orders" element={<AdminOrderHistory />} />

            {/* Trainer Routes */}
            <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/schedule" element={<TrainerSchedule />} />
            <Route path="/trainer/members" element={<MyMembers />} />
            <Route path="/trainer/attendance" element={<AttendanceMarking />} />
            <Route path="/trainer/equipment-status" element={<EquipmentStatus />} />
            <Route path="/trainer/assign-workouts" element={<AssignWorkouts />} />
            <Route path="/trainer/workout-plans" element={<WorkoutPlanManagement />} />
            <Route path="/trainer/meal-plans" element={<MealPlanManagement />} />

            {/* Member Routes */}
            <Route path="/member-dashboard" element={<MemberDashboard />} />
            <Route path="/member/profile" element={<MyProfile />} />
            <Route path="/member/trainer" element={<TrainerSessions />} />
            <Route path="/member/store" element={<SupplementStore />} />
            <Route path="/member/progress" element={<MyProgress />} />
            <Route path="/member/workout-plans" element={<WorkoutPlanManagement />} />
            <Route path="/member/meal-plans" element={<MealPlanManagement />} />
            <Route path="/member/membership" element={<MembershipSelection />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
