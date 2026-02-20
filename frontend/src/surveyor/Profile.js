import { useEffect, useState } from "react";
import axios from "axios";
import "./SurProfile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const employeeCode = sessionStorage.getItem("employeeCode");
  const role = sessionStorage.getItem("role");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        if (!employeeCode) {
          setError("Employee Code not found in session");
          setLoading(false);
          return;
        }

        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5001/api/admin/profile/${employeeCode}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (isMounted) {
          response.data ? setProfile(response.data) : setError("Profile not found");
        }
      } catch {
        if (isMounted) setError("Failed to fetch profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [employeeCode]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={`profile-container ${role}-profile`}>
      <h2 className="header2">Profile</h2>
      <div className="profile-tab">
        <p><strong>Name:</strong> {profile?.name || "N/A"}</p>
        <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
        <p><strong>Gender:</strong> {profile?.gender || "N/A"}</p>
        <p><strong>Phone:</strong> {profile?.phone || "N/A"}</p>
        <p><strong>Employee Code:</strong> {profile?.employee_code || "Not Assigned"}</p>
      </div>
    </div>
  );
};

export default Profile;
