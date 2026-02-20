import { useState } from 'react';

const SmartMeter = () => {
  const [hasSmartMeter, setHasSmartMeter] = useState(null);
  const [caNumber, setCaNumber] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Collect all survey data
    const surveyData = {
      hasSmartMeter,
      caNumber,
      feedback,
    };
    console.log(surveyData);
  };

  const handleCaNumberChange = (e) => {
    // Ensure CA Number is exactly 9 digits
    const value = e.target.value;
    if (value.length <= 9 && /^[0-9]*$/.test(value)) {
      setCaNumber(value);
    }
  };

  return (
    <div className="survey-container">
      <h2>Smart Meter Survey</h2>
      <form onSubmit={handleSubmit}>
        {/* House has Smart Meter */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={hasSmartMeter === true}
              onChange={() => setHasSmartMeter(true)}
            />
            House has Smart Meter
          </label>
          <label>
            <input
              type="checkbox"
              checked={hasSmartMeter === false}
              onChange={() => setHasSmartMeter(false)}
            />
            House does not have Smart Meter
          </label>

          {/* If House has Smart Meter, show CA Number and Feedback */}
          {hasSmartMeter === true && (
            <div>
              <input
                type="text"
                placeholder="Enter CA Number (9 digits)"
                value={caNumber}
                onChange={handleCaNumberChange}
                maxLength="9"
                required
              />
              <textarea
                placeholder="Enter feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>
          )}

          {/* If House does not have Smart Meter, show only CA Number */}
          {hasSmartMeter === false && (
            <div>
              <input
                type="text"
                placeholder="Enter CA Number (9 digits)"
                value={caNumber}
                onChange={handleCaNumberChange}
                maxLength="9"
                required
              />
            </div>
          )}
        </div>

        <button type="submit">Submit Survey</button>
      </form>
    </div>
  );
};

export default SmartMeter;
