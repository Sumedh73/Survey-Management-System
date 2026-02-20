import React, { useEffect, useState } from "react";
import "./AssignCity.css";

const API_URL = "http://localhost:5001";

const AssignCity = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/get-supervisors`)
      .then((res) => res.json())
      .then((data) => {
        setSupervisors(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching supervisors:", err));

    fetch(`${API_URL}/get-cities`)
      .then((res) => res.json())
      .then((data) => {
        setCities(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching cities:", err));

    fetch(`${API_URL}/get-city-assignments`)
      .then((res) => res.json())
      .then((data) => {
        setAssignments(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching assignments:", err));
  }, []);

  const handleAssign = async () => {
    if (!selectedSupervisor || !selectedCity) {
      alert("Please select both Supervisor and City!");
      return;
    }

    const supervisor = supervisors.find((sup) => sup.id === parseInt(selectedSupervisor));
    const city = cities.find((c) => c.id === parseInt(selectedCity));

    // Check if the supervisor already has a city assigned
    if (supervisor.city_id) {
      const confirmUpdate = window.confirm(
        `Supervisor ${supervisor.name} already has a city assigned. Do you want to update the city to ${city.city_name}?`
      );
      if (!confirmUpdate) {
        return;
      }
    }

    const cityAssignments = assignments.filter(
      (assignment) => assignment.city_id === parseInt(selectedCity)
    );

    if (cityAssignments.length >= 2) {
      alert("Only 2 supervisors can be assigned to a city.");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/assign-city-to-supervisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_code: supervisor.employee_code,  // Send employee_code here
          city_id: city.id,  // Ensure city.id exists
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from backend:', errorData);
        alert(`Error: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      alert(data.message);

      const updated = await fetch(`${API_URL}/get-city-assignments`);
      const updatedData = await updated.json();
      setAssignments(Array.isArray(updatedData) ? updatedData : []);
    } catch (error) {
      console.error("Error assigning city:", error);
      alert("An error occurred while assigning the city.");
    }
  };

  return (
    <div className="assign-city-container">
      <h2 className="assign-city-title">Assign City</h2>

      <div className="dropdown-container">
        <div>
          <br />
          <select
            className="select"
            value={selectedSupervisor}
            onChange={(e) => setSelectedSupervisor(e.target.value)}
          >
            <option value="">Select Supervisor</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.name} ({supervisor.employee_code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <br />
          <select
            className="select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.city_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="assign-button" onClick={handleAssign}>
        Assign City
      </button>
    </div>
  );
};

export default AssignCity;
