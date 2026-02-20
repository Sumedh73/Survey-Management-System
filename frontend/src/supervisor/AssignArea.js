import React, { useEffect, useState } from "react";
import './AssignArea.css';

const API_URL = "http://localhost:5001";

const AssignArea = () => {
  const [surveyors, setSurveyors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedSurveyor, setSelectedSurveyor] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [supervisorId, setSupervisorId] = useState(null);
  const [supervisorCityName, setSupervisorCityName] = useState(""); // State for supervisor's city name

  useEffect(() => {
    const employeeCode = sessionStorage.getItem("employeeCode");
    console.log("Employee Code from session:", employeeCode);

    if (!employeeCode) {
      console.error("Supervisor employee code not found in sessionStorage");
      return;
    }

    fetch(`${API_URL}/get-supervisor-id/${employeeCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id && data.city_id) {
          console.log("Supervisor ID:", data.id);
          setSupervisorId(data.id);

          // Fetch the city name using city_id
          fetch(`${API_URL}/get-city-name/${data.city_id}`)
            .then((res) => res.json())
            .then((cityData) => {
              setSupervisorCityName(cityData.city_name); // Set the supervisor's city name
            })
            .catch((err) => console.error("Error fetching city name:", err));

          fetch(`${API_URL}/get-surveyors-by-supervisor/${data.id}`)
            .then((res) => res.json())
            .then((surveyors) => setSurveyors(surveyors))
            .catch((err) => console.error("Error fetching surveyors:", err));

          fetch(`${API_URL}/get-areas-by-supervisor/${data.id}`)
            .then((res) => res.json())
            .then((areas) => setAreas(areas))
            .catch((err) => console.error("Error fetching areas:", err));
        } else {
          console.error("Supervisor ID or city_id not found");
        }
      })
      .catch((err) => console.error("Error fetching supervisor ID:", err));
  }, []);

  const handleAssign = async () => {
    if (!selectedSurveyor || !selectedArea) {
      alert("Please select both surveyor and area");
      return;
    }

    if (!supervisorCityName) {
      alert("Supervisor's city name is missing.");
      return;
    }

    const token = sessionStorage.getItem("token");
    console.log("Token from session:", token);

    try {
      const response = await fetch(`${API_URL}/assign-area`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          surveyorId: selectedSurveyor,
          supervisorId,
          cityName: supervisorCityName, // Include city name
          areaName: selectedArea,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        alert(data.message);  // If no update needed, show success message
      } else if (response.status === 400 && data.message.includes("Do you want to update the area")) {
        // If area is already assigned, ask the user if they want to update
        const confirmUpdate = window.confirm(data.message);
        if (confirmUpdate) {
          const updateResponse = await fetch(`${API_URL}/update-assignment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              surveyorId: selectedSurveyor,
              supervisorId,
              cityName: supervisorCityName,
              areaName: selectedArea,
              existingAssignmentId: data.existingAssignment.id, // Pass the existing assignment ID
            }),
          });

          const updateData = await updateResponse.json();
          alert(updateData.message);
        }
      } else {
        alert(`Error: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error("Error assigning area:", err);
      alert("Assignment failed");
    }
  };

  return (
    <div className="assign-area-container">
      <h2 className="h22">Assign Area to Surveyor</h2>

      <div className="dropdowns">
        <select value={selectedSurveyor} onChange={(e) => setSelectedSurveyor(e.target.value)}>
          <option value="">Select Surveyor</option>
          {surveyors.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
          <option value="">Select Area</option>
          {areas.map((a, idx) => (
            <option key={idx} value={a.area_name}>{a.area_name}</option>
          ))}
        </select>
      </div>

      <button onClick={handleAssign}>Assign Area</button>
    </div>
  );
};

export default AssignArea;
