import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await axios.post('http://localhost:5001/api/login', { employeeCode, password });

      if (data.success) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('name', data.name);
        sessionStorage.setItem('role', data.role);
        sessionStorage.setItem('employeeCode', data.employeeCode);  // ✅ Fix: Store the returned employeeCode
        navigate(`/${data.role.toLowerCase()}/dashboard`);
      } else {
        alert(data.message || 'Invalid Credentials');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="container">
      <div className="form">
        <h2>Login</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Employee Code"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
          />
        </div>
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="show-hide" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>
        <button onClick={handleLogin}>Login</button>
        <p className="forgot-password" onClick={() => navigate('/forgot-password')}>
          Forgot Password?
        </p>
      </div>
    </div>
  );
}

export default Login;
