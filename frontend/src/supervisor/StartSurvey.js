import { useState, useEffect } from 'react';
import axios from 'axios';
import './StartSurvey.css';

const StartSurvey = () => {
  const [surveyors, setSurveyors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedSurveyor, setSelectedSurveyor] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [supervisorId, setSupervisorId] = useState(null); // Added state for supervisorId
  const surveyForms = ['Maintenance Survey', 'Electrification Survey', 'Smart Meter Connection Survey', 'Public Event Survey'];

  // Fetch supervisor ID and surveyors when component mounts
  useEffect(() => {
    const employeeCode = sessionStorage.getItem('employeeCode');
  
    if (employeeCode) {
      axios.get(`http://localhost:5001/get-supervisor-id/${employeeCode}`)
        .then(res => {
          const supervisorId = res.data.id;
          if (supervisorId) {
            // Set the supervisorId to state
            setSupervisorId(supervisorId);
            // Fetch surveyors assigned to the supervisor
            axios.get(`http://localhost:5001/get-surveyors-by-supervisor/${supervisorId}`)
              .then(res => setSurveyors(res.data));
          } else {
            console.error("Supervisor ID not found for employee code:", employeeCode);
          }
        })
        .catch(err => {
          console.error("Error fetching supervisor ID:", err);
        });
    } else {
      console.error("Employee code not found in sessionStorage");
    }
  }, []);
  

  // Fetch areas when a surveyor is selected
  useEffect(() => {
    if (selectedSurveyor) {
      axios.get(`http://localhost:5001/get-areas-by-surveyor/${selectedSurveyor}`)
        .then(res => setAreas(res.data));
    }
  }, [selectedSurveyor]);

  // Handle the survey assignment when the button is clicked
  const handleAssignSurvey = () => {
    if (!selectedSurveyor || !selectedArea || !selectedSurvey || !supervisorId) return;

    // Make the POST request to assign the survey
    axios.post('http://localhost:5001/assign-survey', {
      supervisor_id: supervisorId,  // Pass supervisorId
      surveyor_id: selectedSurveyor,
      area_id: selectedArea,
      form_name: selectedSurvey
    })
    .then(() => {
      alert('Survey Assigned');
      setSelectedArea('');
      setSelectedSurveyor('');
      setSelectedSurvey('');
    })
    .catch(() => alert('Assignment Failed'));
  };

  return (
    <div className="start-survey-container">
      <h2 className='h222'>Assign a Survey</h2>

      <select value={selectedSurveyor} onChange={e => setSelectedSurveyor(e.target.value)}>
        <option value="">Select Surveyor</option>
        {surveyors.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} disabled={!selectedSurveyor}>
        <option value="">Select Area</option>
        {areas.map(a => (
          <option key={a.id} value={a.id}>{a.area_name}</option>
        ))}
      </select>

      <select value={selectedSurvey} onChange={e => setSelectedSurvey(e.target.value)}>
        <option value="">Select Survey Form</option>
        {surveyForms.map((form, idx) => (
          <option key={idx} value={form}>{form}</option>
        ))}
      </select>

      <button onClick={handleAssignSurvey}>Assign Survey</button>
    </div>
  );
};

export default StartSurvey;
