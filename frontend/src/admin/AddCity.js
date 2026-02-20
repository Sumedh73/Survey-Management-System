import { useState } from 'react';
import './AddCity.css';

const AddCity = () => {
    const [cityName, setCityName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!cityName.trim()) {
            setMessage('City name cannot be empty');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/add-city', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cityName }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`City "${cityName}" added successfully`);
                setCityName('');
            } else {
                setMessage(`Error: ${data.error || 'Failed to add city'}`);
            }
        } catch (error) {
            setMessage('Network error, please try again');
        }
    };

    return (
        <div className="add-city-container">
            <div className="add-city-card">
                <h2 className="h22">Add City</h2>
                <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Enter City Name"
                    className="add-city-input"
                />
                <button type="submit" onClick={handleSubmit} className="add-city-button">
                    Add City
                </button>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default AddCity;
