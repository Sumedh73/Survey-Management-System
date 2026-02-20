import { useState, useEffect } from 'react';
import './AddArea.css';

const AddArea = () => {
    const [areaName, setAreaName] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch('http://localhost:5001/get-cities');
                const data = await res.json();
                if (res.ok) {
                    setCities(data);
                } else {
                    console.error('Error loading cities:', data.message);
                }
            } catch (err) {
                console.error('Error fetching cities:', err);
            }
        };

        fetchCities();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!selectedCity || !areaName.trim()) {
            setMessage('Please select a city and enter an area name.');
            return;
        }

        const token = sessionStorage.getItem('token');

        if (!token) {
            setMessage('No token found. Please log in again.');
            console.error('Token not found in sessionStorage.');
            return;
        }

        console.log("Sending token:", token);

        try {
            const response = await fetch('http://localhost:5001/add-area', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    city: selectedCity,
                    area: areaName
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Area "${areaName}" added under "${selectedCity}"`);
                setAreaName('');
                setSelectedCity('');
            } else {
                console.error("Error response:", data);
                setMessage(`Error: ${data.message || 'Failed to add area'}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            setMessage('Network error, please try again');
        }
    };

    return (
        <div className="add-area-container">
            <div className="add-area-card">
                <h2 className="add-area-title">Add Area</h2>

                <select
                    className="add-area-input"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    <option value="">Select City</option>
                    {cities.map((city, idx) => (
                        <option key={idx} value={city.city_name}>{city.city_name}</option>
                    ))}
                </select>

                <input
                    type="text"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="Enter Area Name"
                    className="add-area-input"
                    disabled={!selectedCity}
                />

                <button type="submit" onClick={handleSubmit} className="add-area-button">
                    Add Area
                </button>

                {message && <p className="add-area-message">{message}</p>}
            </div>
        </div>
    );
};

export default AddArea;
