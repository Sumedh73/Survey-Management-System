import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import './AdminDashboard.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (!token || role !== 'Admin') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="master-page">
      <div className="top-bar">
        <span>Admin Dashboard</span>
      </div>
      <div className="dashboard-container">
        <div className="button-container">
          <button onClick={() => navigate('/admin/profile')}>Profile</button>
          <button onClick={() => navigate('/admin/employee-profile')}>Employee Profile</button>
          <button onClick={() => navigate('/admin/create-supervisor')}>Create Supervisor</button>
          <button onClick={() => navigate('/admin/add-city')}>Add City</button>
          <button onClick={() => navigate('/admin/assign-city')}>Assign City</button>
          <button onClick={() => navigate('/admin/reset-password')}>Reset Password</button>
          <button onClick={() => navigate('/admin/view-remarks')}>View Remarks</button>
        </div>
        <div className="content-container">
          <Outlet /> {/* This will load the selected admin page dynamically */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
