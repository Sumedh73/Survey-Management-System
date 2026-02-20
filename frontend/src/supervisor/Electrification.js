import { useState } from 'react';

const Electrification = () => {
  const [areaElectrified, setAreaElectrified] = useState(null);
  const [houseElectrified, setHouseElectrified] = useState(null);

  const [areaName, setAreaName] = useState('');
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [houseNotElectrifiedReason, setHouseNotElectrifiedReason] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Collect all survey data
    const surveyData = {
      areaElectrified,
      houseElectrified,
      areaName,
      customerFeedback,
      houseNotElectrifiedReason,
      longitude,
      latitude,
    };
    console.log(surveyData);
  };

  return (
    <div className="survey-container">
      <h2>Electrification Survey</h2>
      <form onSubmit={handleSubmit}>
        {/* Area is Electrified */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={areaElectrified === true}
              onChange={() => setAreaElectrified(true)}
            />
            Area is Electrified
          </label>
          <label>
            <input
              type="checkbox"
              checked={areaElectrified === false}
              onChange={() => setAreaElectrified(false)}
            />
            Area is Not Electrified
          </label>

          {/* If Area is Not Electrified, show area name input */}
          {areaElectrified === false && (
            <div>
              <input
                type="text"
                placeholder="Enter the area name"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                required
              />
            </div>
          )}

          {/* If Area is Electrified, show the house electrified checkbox */}
          {areaElectrified === true && (
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={houseElectrified === true}
                  onChange={() => setHouseElectrified(true)}
                />
                House is Electrified
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={houseElectrified === false}
                  onChange={() => setHouseElectrified(false)}
                />
                House is Not Electrified
              </label>

              {/* If House is Electrified, show customer feedback input */}
              {houseElectrified === true && (
                <div>
                  <textarea
                    placeholder="Enter customer feedback"
                    value={customerFeedback}
                    onChange={(e) => setCustomerFeedback(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* If House is Not Electrified, show reason, longitude, and latitude inputs */}
              {houseElectrified === false && (
                <div>
                  <textarea
                    placeholder="Why is the house not electrified?"
                    value={houseNotElectrifiedReason}
                    onChange={(e) => setHouseNotElectrifiedReason(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <button type="submit">Submit Survey</button>
      </form>
    </div>
  );
};

export default Electrification;
