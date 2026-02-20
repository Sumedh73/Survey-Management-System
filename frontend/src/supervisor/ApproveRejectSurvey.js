import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApprovalPage.css'; // Make sure to import the CSS file

const ApprovalPage = () => {
  const [assignedSurveys, setAssignedSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const employeeCode = sessionStorage.getItem('employeeCode');

    if (employeeCode) {
      axios.get(`http://localhost:5001/get-supervisor-id/${employeeCode}`)
        .then(res => {
          const supervisorId = res.data.id;
          if (supervisorId) {
            axios.get(`http://localhost:5001/get-assigned-surveys/${supervisorId}`)
              .then(res => {
                setAssignedSurveys(res.data);
                setLoading(false);
              })
              .catch(err => {
                console.error("Error fetching assigned surveys:", err);
                setError("Error fetching assigned surveys");
                setLoading(false);
              });
          } else {
            console.error("Supervisor ID not found for employee code:", employeeCode);
            setError("Supervisor ID not found");
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Error fetching supervisor ID:", err);
          setError("Error fetching supervisor ID");
          setLoading(false);
        });
    } else {
      console.error("Employee code not found in sessionStorage");
      setError("Employee code not found");
      setLoading(false);
    }
  }, []);

  const handleApproveSurvey = (surveyId) => {
    axios.post('http://localhost:5001/approve-survey', { surveyId })
      .then(() => {
        setAssignedSurveys(prevSurveys => prevSurveys.map(survey =>
          survey.id === surveyId ? { ...survey, status: 'approved' } : survey
        ));
      })
      .catch(() => alert('Error approving survey'));
  };

  const handleRejectSurvey = (surveyId) => {
    axios.post('http://localhost:5001/reject-survey', { surveyId })
      .then(() => {
        setAssignedSurveys(prevSurveys => prevSurveys.map(survey =>
          survey.id === surveyId ? { ...survey, status: 'rejected' } : survey
        ));
      })
      .catch(() => alert('Error rejecting survey'));
  };

  if (loading) return <p>Loading surveys...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="approval-page-container">
      <h2>Assigned Surveys</h2>
      <table>
        <thead>
          <tr>
            <th>Survey Name</th>
            <th>Surveyor</th>
            <th>Area</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignedSurveys.map(survey => (
            <tr key={survey.id}>
              <td>{survey.survey_name || 'N/A'}</td>
              <td>{survey.surveyor_name || 'N/A'}</td>
              <td>{survey.area_name || 'N/A'}</td>
              <td>{survey.status || 'N/A'}</td>
              <td>
                <button
                  className="approveBtn"
                  onClick={() => handleApproveSurvey(survey.id)}
                  disabled={survey.status !== 'pending'}
                >
                  Approve
                </button>
                <button
                  className="rejectBtn"
                  onClick={() => handleRejectSurvey(survey.id)}
                  disabled={survey.status !== 'pending'}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovalPage;
