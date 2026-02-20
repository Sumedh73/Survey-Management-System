import { useState, useEffect } from 'react';
import axios from 'axios';
import './EProfile.css';
import { FaUser, FaEnvelope, FaPhone, FaIdBadge, FaCity, FaBriefcase } from 'react-icons/fa';

const ViewEmployeeProfile = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5001/roles')
      .then(res => {
        const filteredRoles = res.data.filter(role => role.role === "Supervisor" || role.role === "Surveyor");
        setRoles(filteredRoles);
      })
      .catch(err => console.error(err));
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSelectedEmployee('');
    setProfile(null);

    axios.get(`http://localhost:5001/employees?role=${role}`)
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
  };

  const handleEmployeeChange = (employee_code) => {
    setSelectedEmployee(employee_code);
    setLoading(true);

    axios.get(`http://localhost:5001/employee-profile/${employee_code}`)
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="view-profile-container">
      <h2 className='h22'>View Employee Profile</h2>
      
      <div className="dropdown-container">
        <select className="styled-dropdown" onChange={(e) => handleRoleChange(e.target.value)} value={selectedRole}>
          <option value="">Select Role</option>
          {roles.map((role, index) => (
            <option key={index} value={role.role}>{role.role}</option>
          ))}
        </select>

        <select className="styled-dropdown" onChange={(e) => handleEmployeeChange(e.target.value)} value={selectedEmployee} disabled={!selectedRole}>
          <option value="">Select Employee</option>
          {employees.map(emp => (
            <option key={emp.employee_code} value={emp.employee_code}>{emp.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="loading-text">Loading employee details...</p>}

      {profile && (
        <div className="profile-card">
          <h3><FaUser /> {profile.name}</h3>
          <p><FaBriefcase /> <strong>Role:</strong> {profile.role}</p>
          <p><FaIdBadge /> <strong>Employee Code:</strong> {profile.employee_code}</p>
          <p><FaEnvelope /> <strong>Email:</strong> {profile.email}</p>
          <p><FaPhone /> <strong>Phone:</strong> {profile.phone}</p>
          <p><FaCity /> <strong>Assigned City:</strong> {profile.assigned_city || 'Not Assigned'}</p>
        </div>
      )}
    </div>
  );
};

export default ViewEmployeeProfile;
