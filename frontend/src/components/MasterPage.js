import { useNavigate } from 'react-router-dom';
import './MasterPage.css';

const MasterPage = ({ children }) => {
  const navigate = useNavigate();

  const userName = sessionStorage.getItem('name') || 'Guest';
  const userRole = sessionStorage.getItem('role') || 'User';

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="master-page">
      <div className="top-bar">
        <span className="welcome">Welcome</span>
        <div className="right-section">
          <span className="user-info">{userName} ({userRole})</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="content">{children}</div>
    </div>
  );
};

export default MasterPage;
