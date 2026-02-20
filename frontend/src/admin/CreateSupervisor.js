import React, { useState, useEffect } from "react";
import axios from "axios";
import './AddSupervisor.css';

const CreateSupervisor = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        gender: "",
        phone: "",
        employee_code: "",
        password: "$2a$12$ETxgKreVR9LgDOLNKRuIguvkC0JAmWfs8s2XGnoPQKP5A8AdpS3Im",
        role: "Supervisor",
    });
    const [lastEmployeeCode, setLastEmployeeCode] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5001/api/last-employee-code")
            .then((res) => {
                const lastCode = res.data.lastEmployeeCode || "S000"; 
                const nextCode = generateNextEmployeeCode(lastCode);
                setLastEmployeeCode(lastCode);
                setFormData(prev => ({ ...prev, employee_code: nextCode }));
            })
            .catch((err) => console.error("Error fetching last employee code:", err));
    }, []);

    const generateNextEmployeeCode = (lastCode) => {
        const numberPart = parseInt(lastCode.replace(/\D/g, ""), 10) + 1;
        return `S${numberPart.toString().padStart(3, "0")}`;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post("http://localhost:5001/api/create-supervisor", formData)
            .then((res) => {
                alert(res.data.message);
                const nextCode = generateNextEmployeeCode(lastEmployeeCode);
                setLastEmployeeCode(nextCode);
                setFormData({ name: "", email: "", gender: "", phone: "", employee_code: nextCode });
            })
            .catch((err) => {
                alert(err.response?.data?.message || "Error creating supervisor");
            });
    };

    return (
        <div className="create-supervisor-container">
            <h2 className="h22">Create Supervisor</h2>
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
                <button type="submit">Create Supervisor</button>
            </form>
        </div>
    );
};

export default CreateSupervisor;
