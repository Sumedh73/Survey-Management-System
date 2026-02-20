import { useState } from 'react';

const Maintenance = () => {
  const [polesChecked, setPolesChecked] = useState(false);
  const [transformerChecked, setTransformerChecked] = useState(false);
  const [wiresChecked, setWiresChecked] = useState(false);

  const [poleFaultDescription, setPoleFaultDescription] = useState('');
  const [poleLongitude, setPoleLongitude] = useState('');
  const [poleLatitude, setPoleLatitude] = useState('');

  const [transformerFaultDescription, setTransformerFaultDescription] = useState('');
  const [transformerLongitude, setTransformerLongitude] = useState('');
  const [transformerLatitude, setTransformerLatitude] = useState('');

  const [wireFaultDescription, setWireFaultDescription] = useState('');
  const [wireLongitudeFrom, setWireLongitudeFrom] = useState('');
  const [wireLatitudeFrom, setWireLatitudeFrom] = useState('');
  const [wireLongitudeTo, setWireLongitudeTo] = useState('');
  const [wireLatitudeTo, setWireLatitudeTo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Collect all survey data
    const surveyData = {
      poles: {
        checked: polesChecked,
        faultDescription: poleFaultDescription,
        longitude: poleLongitude,
        latitude: poleLatitude,
      },
      transformer: {
        checked: transformerChecked,
        faultDescription: transformerFaultDescription,
        longitude: transformerLongitude,
        latitude: transformerLatitude,
      },
      wires: {
        checked: wiresChecked,
        faultDescription: wireFaultDescription,
        longitudeFrom: wireLongitudeFrom,
        latitudeFrom: wireLatitudeFrom,
        longitudeTo: wireLongitudeTo,
        latitudeTo: wireLatitudeTo,
      },
    };
    console.log(surveyData);
  };

  return (
    <div className="survey-container">
      <h2>Maintenance Survey</h2>
      <form onSubmit={handleSubmit}>
        {/* Poles */}
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={polesChecked} 
              onChange={(e) => setPolesChecked(e.target.checked)} 
            />
            Poles
          </label>
          {polesChecked && (
            <div>
              <input 
                type="text" 
                placeholder="Describe the fault" 
                value={poleFaultDescription} 
                onChange={(e) => setPoleFaultDescription(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Longitude" 
                value={poleLongitude} 
                onChange={(e) => setPoleLongitude(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Latitude" 
                value={poleLatitude} 
                onChange={(e) => setPoleLatitude(e.target.value)} 
                required 
              />
            </div>
          )}
        </div>

        {/* Transformer */}
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={transformerChecked} 
              onChange={(e) => setTransformerChecked(e.target.checked)} 
            />
            Transformer
          </label>
          {transformerChecked && (
            <div>
              <input 
                type="text" 
                placeholder="Describe the fault" 
                value={transformerFaultDescription} 
                onChange={(e) => setTransformerFaultDescription(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Longitude" 
                value={transformerLongitude} 
                onChange={(e) => setTransformerLongitude(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Latitude" 
                value={transformerLatitude} 
                onChange={(e) => setTransformerLatitude(e.target.value)} 
                required 
              />
            </div>
          )}
        </div>

        {/* Wires */}
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={wiresChecked} 
              onChange={(e) => setWiresChecked(e.target.checked)} 
            />
            Wires
          </label>
          {wiresChecked && (
            <div>
              <input 
                type="text" 
                placeholder="Describe the fault" 
                value={wireFaultDescription} 
                onChange={(e) => setWireFaultDescription(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Longitude From" 
                value={wireLongitudeFrom} 
                onChange={(e) => setWireLongitudeFrom(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Latitude From" 
                value={wireLatitudeFrom} 
                onChange={(e) => setWireLatitudeFrom(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Longitude To" 
                value={wireLongitudeTo} 
                onChange={(e) => setWireLongitudeTo(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                placeholder="Latitude To" 
                value={wireLatitudeTo} 
                onChange={(e) => setWireLatitudeTo(e.target.value)} 
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

export default Maintenance;
