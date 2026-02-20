import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import AdminDashboard from "./admin/dashboard";
import SupervisorDashboard from "./supervisor/dashboard";
import SurveyorDashboard from "./surveyor/dashboard";
import Profile from "./admin/Profile";
import EmployeeProfile from "./admin/EmployeeProfile";
import CreateSupervisor from "./admin/CreateSupervisor";
import CreateSurveyor from "./admin/CreateSurveyor";
import AddCity from "./admin/AddCity";
import AssignCity from "./admin/AssignCity";
import ResetPassword from "./admin/ResetPassword";
import ViewRemarks from "./admin/ViewRemarks";
import SupervisorProfile from "./supervisor/Profile";
import MasterPage from "./components/MasterPage";
import AddSurveyor from "./supervisor/AddSurveyor";
import AddArea from "./supervisor/AddArea";
import AssignArea from "./supervisor/AssignArea";
import StartSurvey from "./supervisor/StartSurvey";
import ApproveRejectSurvey from "./supervisor/ApproveRejectSurvey";
import ViewApprovedSurveys from "./supervisor/ViewApprovedSurveys";
import RemoveAssign from "./supervisor/RemoveAssign";
import SurveyorProfile from "./surveyor/Profile"; 
import ConductSurvey from "./surveyor/ConductSurvey";
import AddRemarks from "./surveyor/AddRemarks";
import Maintenance from "./supervisor/Maintenance";
import Electrification from "./supervisor/Electrification";
import SmartMeter from "./supervisor/SmartMeter";
import Event from "./supervisor/Event";

// Import the FillSurvey component for dynamic survey forms
import FillSurvey from "./surveyor/FillSurvey";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  return token && allowedRoles.includes(role) ? element : <Navigate to="/" />;
};

const LoginRedirect = () => {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");

  useEffect(() => {
    if (role === "Admin") {
      navigate("/admin/dashboard");
    } else if (role === "Supervisor") {
      navigate("/supervisor/dashboard");
    } else if (role === "Surveyor") {
      navigate("/surveyor/dashboard");
    }
  }, [role, navigate]);

  return null;
};

const AdminLayout = () => (
  <MasterPage>
    <div className="admin-container">
      <AdminDashboard />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  </MasterPage>
);

const SupervisorLayout = () => (
  <MasterPage>
    <div className="supervisor-container">
      <SupervisorDashboard />
      <div className="supervisor-content">
        <Outlet />
      </div>
    </div>
  </MasterPage>
);

const SurveyorLayout = () => (
  <MasterPage>
    <div className="surveyor-container">
      <SurveyorDashboard />
      <div className="surveyor-content">
        <Outlet />
      </div>
    </div>
  </MasterPage>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/redirect" element={<LoginRedirect />} />

        <Route element={<ProtectedRoute element={<AdminLayout />} allowedRoles={["Admin"]} />}>
          <Route path="/admin/dashboard" element={<Profile />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/admin/employee-profile" element={<EmployeeProfile />} />
          <Route path="/admin/create-supervisor" element={<CreateSupervisor />} />
          <Route path="/admin/create-surveyor" element={<CreateSurveyor />} />
          <Route path="/admin/add-city" element={<AddCity />} />
          <Route path="/admin/assign-city" element={<AssignCity />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin/view-remarks" element={<ViewRemarks />} />
        </Route>

        <Route element={<ProtectedRoute element={<SupervisorLayout />} allowedRoles={["Supervisor"]} />}>
          <Route path="/supervisor/dashboard" element={<SupervisorProfile />} />
          <Route path="/supervisor/profile" element={<SupervisorProfile />} />
          <Route path="/supervisor/add-surveyor" element={<AddSurveyor />} />
          <Route path="/supervisor/add-area" element={<AddArea />} />
          <Route path="/supervisor/assign-area" element={<AssignArea />} />
          <Route path="/supervisor/remove-assigned-area" element={<RemoveAssign />} />
          <Route path="/supervisor/start-survey" element={<StartSurvey />} />
          <Route path="/supervisor/approve-reject-survey" element={<ApproveRejectSurvey />} />
          <Route path="/supervisor/view-approved-surveys" element={<ViewApprovedSurveys />} />
          <Route path="/supervisor/maintenance" element={<Maintenance />} />
          <Route path="/supervisor/main" element={<Electrification />} />
          <Route path="/supervisor/mai" element={<SmartMeter />} />
          <Route path="/supervisor/ma" element={<Event />} />
        </Route>

        <Route element={<ProtectedRoute element={<SurveyorLayout />} allowedRoles={["Surveyor"]} />}>
          <Route path="/surveyor/dashboard" element={<SurveyorProfile />} />
          <Route path="/surveyor/profile" element={<SurveyorProfile />} />
          <Route path="/surveyor/conduct-survey" element={<ConductSurvey />} />
          <Route path="/surveyor/add-remarks" element={<AddRemarks />} />

          {/* Route to load the survey form dynamically by surveyId */}
          <Route path="/surveyor/fill-survey/:surveyId" element={<FillSurvey />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
