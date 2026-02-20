import { useEffect, useState } from 'react';
import axios from 'axios';
import './RemoveArea.css'

const API_URL = 'http://localhost:5001';

const RemoveAssignedArea = () => {
  const [surveyors, setSurveyors] = useState([]);
  const [selectedSurveyor, setSelectedSurveyor] = useState('');
  const [assignedAreas, setAssignedAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [isAreaDisabled, setIsAreaDisabled] = useState(true); 

  useEffect(() => {
    const fetchSurveyors = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const employeeCode = sessionStorage.getItem('employeeCode');
        const supervisorResponse = await axios.get(`${API_URL}/get-supervisor-id/${employeeCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const supervisorId = supervisorResponse.data.id;
        const response = await axios.get(`${API_URL}/get-surveyors-by-supervisor/${supervisorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setSurveyors(response.data);
      } catch (error) {
        console.error('Error fetching surveyors:', error);
      }
    };

    fetchSurveyors();
  }, []);

  const fetchAssignedAreas = async (surveyorId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/supervisor/assigned-areas/${surveyorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.length > 0) {
        setAssignedAreas(response.data);
        setIsAreaDisabled(false); 
      } else {
        setAssignedAreas([]);
        setIsAreaDisabled(true); 
      }
    } catch (error) {
      console.error('Error fetching assigned areas:', error);
    }
  };

  const handleSurveyorChange = (e) => {
    const surveyorId = e.target.value;
    setSelectedSurveyor(surveyorId);
    setSelectedArea('');
    fetchAssignedAreas(surveyorId);
  };

  const handleRemove = async () => {
    if (!selectedSurveyor || !selectedArea) return;

    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_URL}/supervisor/remove-assigned-area`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { surveyor_id: selectedSurveyor, area_id: selectedArea }
      });

      alert('Area assignment removed successfully!');
      setAssignedAreas(assignedAreas.filter(area => area.id !== parseInt(selectedArea)));
      setSelectedArea('');
      setIsAreaDisabled(true);
    } catch (error) {
      console.error('Error removing assigned area:', error);
      alert('Failed to remove assigned area.');
    }
  };

  return (
    <div className="remove-area-container">
      <h2>Remove Assigned Area</h2>

      <div className="dropdowns">
        <select value={selectedSurveyor} onChange={handleSurveyorChange}>
          <option value="">Select Surveyor</option>
          {surveyors.map((surveyor) => (
            <option key={surveyor.id} value={surveyor.id}>
              {surveyor.name}
            </option>
          ))}
        </select>
      </div>

      <div className="dropdowns">
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          disabled={isAreaDisabled}
        >
          <option value="">Select Assigned Area</option>
          {assignedAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.area_name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleRemove} disabled={!selectedSurveyor || !selectedArea}>
        Remove Assignment
      </button>
    </div>
  );
};

export default RemoveAssignedArea;
