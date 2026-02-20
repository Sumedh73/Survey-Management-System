import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import your individual survey form components
import MaintenanceSurveyForm from '../supervisor/Maintenance';
import SmartMeterConnectionSurveyForm from '../supervisor/SmartMeter';
import PublicEventSurveyForm from '../supervisor/Event';
import ElectrificationSurveyForm from '../supervisor/Electrification';

const FillSurveyPage = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5001/get-survey/${surveyId}`)
      .then(res => setSurvey(res.data))
      .catch(err => alert('Error fetching survey details'));
  }, [surveyId]);

  if (!survey) return <div>Loading...</div>;

  const onSubmit = (formData) => {
    // API call to submit form data
    axios.post('http://localhost:5001/submit-survey', {
      surveyId: survey.id,
      surveyorId: survey.surveyor_id,
      formData,
      status: 'pending'
    }).then(() => {
      alert('Survey submitted successfully');
      navigate('/assigned-surveys');
    }).catch(() => alert('Failed to submit survey'));
  };

  switch (survey.survey_name) {
    case 'Maintenance Survey':
      return <MaintenanceSurveyForm initialData={survey.form_data} onSubmit={onSubmit} />;
    case 'Smart Meter Connection Survey':
      return <SmartMeterConnectionSurveyForm initialData={survey.form_data} onSubmit={onSubmit} />;
    case 'Public Event Survey':
      return <PublicEventSurveyForm initialData={survey.form_data} onSubmit={onSubmit} />;
    case 'Electrification Survey':
      return <ElectrificationSurveyForm initialData={survey.form_data} onSubmit={onSubmit} />;
    default:
      return <div>Unknown survey type</div>;
  }
};

export default FillSurveyPage;
