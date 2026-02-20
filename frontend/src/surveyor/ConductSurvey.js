import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AssignedSurveys.css';

const AssignedSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const surveyorId = 2;  // Replace with dynamic user id from login/session

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedSurveys = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/get-assigned-surveys/${surveyorId}`);
        setSurveys(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching surveys');
        setLoading(false);
      }
    };

    fetchAssignedSurveys();
  }, [surveyorId]);

  const handleFillForm = (surveyId) => {
    navigate(`/fill-survey/${surveyId}`);
  };

  if (loading) {
    return <div>Loading assigned surveys...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="assigned-surveys-container">
      <h1 className="h22">Assigned Surveys</h1>
      {surveys.length === 0 ? (
        <p>No surveys assigned.</p>
      ) : (
        <table className="assigned-surveys-table">
          <thead>
            <tr>
              <th>Survey Name</th>
              <th>Area ID</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey.id}>
                <td>{survey.survey_name}</td>
                <td>{survey.area_id}</td>
                <td>{survey.status}</td>
                <td>{new Date(survey.created_at).toLocaleString()}</td>
                <td>
                  {survey.status === 'pending' ? (
                    <button onClick={() => handleFillForm(survey.id)}>Fill Form</button>
                  ) : (
                    <span>Submitted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AssignedSurveys;
