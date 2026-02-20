import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddSurveyor.css";

const AddSurveyor = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        gender: "",
        phone: "",
        employee_code: "",
        password: "$2a$12$ETxgKreVR9LgDOLNKRuIguvkC0JAmWfs8s2XGnoPQKP5A8AdpS3Im",
        role: "Surveyor",
    });
    const [lastEmployeeCode, setLastEmployeeCode] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5001/api/last-surveyor-code")
            .then((res) => {
                console.log("Surveyor API Response:", res.data);
                const lastCode = res.data.lastSurveyorCode;
                const nextCode = generateNextEmployeeCode(lastCode);
                setLastEmployeeCode(lastCode);
                setFormData(prev => ({ ...prev, employee_code: nextCode }));
            })
            .catch(err => console.error("Error fetching last surveyor employee code:", err));
    }, []);

    const generateNextEmployeeCode = (lastCode) => {
        const match = lastCode.match(/SUR(\d+)/);
        if (match) {
            const numberPart = parseInt(match[1], 10) + 1;
            return `SUR${numberPart.toString().padStart(3, "0")}`;
        }
        return "SUR001"; // Default for first surveyor
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        axios.post("http://localhost:5001/api/create-surveyor", formData, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
        })
        .then((res) => {
            alert(res.data.message);
    
            axios.get("http://localhost:5001/api/last-surveyor-code")
                .then((res) => {
                    const newLastCode = res.data.lastSurveyorCode;
                    const nextCode = generateNextEmployeeCode(newLastCode);
    
                    setLastEmployeeCode(newLastCode);
                    setFormData({
                        name: "",
                        email: "",
                        gender: "",
                        phone: "",
                        employee_code: nextCode,
                        password: "$2a$12$ETxgKreVR9LgDOLNKRuIguvkC0JAmWfs8s2XGnoPQKP5A8AdpS3Im",
                        role: "Surveyor",
                    });
                })
                .catch(err => console.error("Error fetching updated last surveyor employee code:", err));
        })
        .catch((err) => {
            alert(err.response?.data?.message || "Error creating surveyor");
        });
    };
    
    return (
        <div className="create-surveyor-container">
            <h2 className="h22">Add Surveyor</h2>
            <p>Last Employee Code: <strong>{lastEmployeeCode}</strong></p>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
                <input type="text" name="employee_code" value={formData.employee_code} readOnly />
                <button type="submit">Add Surveyor</button>
            </form>
        </div>
    );
};

export default AddSurveyor;
