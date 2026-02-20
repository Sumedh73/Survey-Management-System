import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function ForgotPassword() {
  const [ecode, setEcode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const { data } = await axios.post('http://localhost:5001/api/forgot-password', { ecode, oldPassword, newPassword });
      alert(data.message);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Reset Failed');
    }
  };
  
  return (
    <div className="container">
      <div className="form">
        <h2>Reset Password</h2>
        <div className="input-group">
          <input type="text" placeholder="Employee Code" value={ecode} onChange={(e) => setEcode(e.target.value)} />
        </div>
        <div className="input-group">
          <input
            type={showOld ? 'text' : 'password'}
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <span className="show-hide" onClick={() => setShowOld(!showOld)}>
            {showOld ? 'Hide' : 'Show'}
          </span>
        </div>
        <div className="input-group">
          <input
            type={showNew ? 'text' : 'password'}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <span className="show-hide" onClick={() => setShowNew(!showNew)}>
            {showNew ? 'Hide' : 'Show'}
          </span>
        </div>
        <button onClick={handleReset}>Reset Password</button>
        <p className="back-to-login" onClick={() => navigate('/')}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
