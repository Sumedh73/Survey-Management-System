import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (!token || role !== 'Supervisor') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="master-page">
      <div className="top-bar">
        <span>Supervisor Dashboard</span>
        <div className="right-section"></div>
      </div>
      <div className="dashboard-container">
        <div className="button-container">
          <button onClick={() => navigate('/supervisor/profile')}>Profile</button>
          <button onClick={() => navigate('/supervisor/add-area')}>Add Area</button>
          <button onClick={() => navigate('/supervisor/assign-area')}>Assign Area</button>
          <button onClick={() => navigate('/supervisor/remove-assigned-area')}>Remove Assigned Area</button>
          <button onClick={() => navigate('/supervisor/start-survey')}>Start Survey</button>
          <button onClick={() => navigate('/supervisor/approve-reject-survey')}>Approve/Reject Survey</button>
          <button onClick={() => navigate('/supervisor/view-approved-surveys')}>View Approved Surveys</button>
          {/*<button onClick={() => navigate('/supervisor/maintenance')}>Maintenance</button>
          <button onClick={() => navigate('/supervisor/main')}>Electrification</button>
          <button onClick={() => navigate('/supervisor/mai')}>F3</button>
          <button onClick={() => navigate('/supervisor/ma')}>F4</button>*/}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
