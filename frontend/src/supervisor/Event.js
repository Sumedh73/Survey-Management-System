import { useState } from 'react';
import './Event.css'

const Event = () => {
  const [placeOfEvent, setPlaceOfEvent] = useState('');
  const [durationOfEvent, setDurationOfEvent] = useState('');
  const [dateTimeOfEvent, setDateTimeOfEvent] = useState('');
  const [expectedLoad, setExpectedLoad] = useState('');
  const [numOfWorkers, setNumOfWorkers] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!placeOfEvent || !durationOfEvent || !dateTimeOfEvent || !expectedLoad || !numOfWorkers) {
      alert("All fields are required!");
      return;
    }

    const eventData = {
      placeOfEvent,
      durationOfEvent,
      dateTimeOfEvent,
      expectedLoad,
      numOfWorkers,
    };

    console.log(eventData);
    // You can send the eventData to your backend here using an API call (axios, fetch, etc.)
  };

  return (
    <div className="survey-container">
      <h2>Event Survey</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Place of Event:</label>
          <input
            type="text"
            placeholder="Enter place of event"
            value={placeOfEvent}
            onChange={(e) => setPlaceOfEvent(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Duration of Event (in hours):</label>
          <input
            type="text"
            placeholder="Enter duration of event"
            value={durationOfEvent}
            onChange={(e) => setDurationOfEvent(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Date and Time of Event:</label>
          <input
            type="datetime-local"
            value={dateTimeOfEvent}
            onChange={(e) => setDateTimeOfEvent(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Expected Load (in KWH):</label>
          <input
            type="number"
            placeholder="Enter expected load in KWH"
            value={expectedLoad}
            onChange={(e) => setExpectedLoad(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Number of Workers Required:</label>
          <input
            type="number"
            placeholder="Enter number of workers"
            value={numOfWorkers}
            onChange={(e) => setNumOfWorkers(e.target.value)}
            required
          />
        </div>

        <button type="submit">Submit Event Survey</button>
      </form>
    </div>
  );
};

export default Event;
