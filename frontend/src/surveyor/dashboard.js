import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./dashboard.css";

const SurveyorDashboard = () => {
  return (
    <div className="surveyor-dashboard">
      <div className="dashboard-container">
        <div className="sidebar">
          <h2 className="h22"> Surveyor Dashboard </h2>
          <div className="button-container">
            <Link to="/surveyor/profile">Profile</Link>
            <Link to="/surveyor/conduct-survey">Assigned Survey</Link>
            {/*<Link to="/surveyor/complete-survey">Complete Survey</Link>*/}
            <Link to="/surveyor/add-remarks">Conducted Survey</Link>
          </div>
        </div>
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SurveyorDashboard;
