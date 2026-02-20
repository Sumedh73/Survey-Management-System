import React, { useState, useEffect } from 'react';
import './ResetPassword.css';

const ResetPassword = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/employees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error('Error fetching employees:', err));
  }, []);

  const fetchProfile = (employeeCode) => {
    if (!employeeCode) return;

    fetch(`http://localhost:5001/employee-profile/${employeeCode}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setMessage('');
      })
      .catch(err => console.error('Error fetching profile:', err));
  };

  const handleResetPassword = () => {
    if (!selectedEmployee) {
      setMessage('Please select an employee.');
      return;
    }

    fetch('http://localhost:5001/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_code: selectedEmployee })
    })
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error('Error resetting password:', err);
        setMessage('Faile to reset password.');
      });
  };

  return (
    <div className="reset-password-container">
      <h2 className='h22'>Reset Employee Password</h2>

      <select 
        onChange={(e) => { 
          setSelectedEmployee(e.target.value); 
          setMessage('');
          fetchProfile(e.target.value);
        }}
      >
        <option value="">Select Employee</option>
        {employees.map(emp => (
          <option key={emp.employee_code} value={emp.employee_code}>
            {emp.name} ({emp.employee_code})
          </option>
        ))}
      </select>

      {profile && (
        <div className="profile">
          <h3>{profile.name}</h3>
          <p><strong>Role:</strong> {profile.role}</p>
          <button onClick={handleResetPassword}>Reset Password</button>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ResetPassword;
