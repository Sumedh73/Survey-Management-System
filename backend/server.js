require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'survey',
});

const promiseDb = db.promise();

const JWT_SECRET = process.env.JWT_SECRET || 'Hello';
const SUPERVISOR_PASSWORD = process.env.SUPERVISOR_PASSWORD;
const SURVEYOR_PASSWORD = process.env.SURVEYOR_PASSWORD;

app.post('/api/login', (req, res) => {
  const { employeeCode, password } = req.body;

  db.query('SELECT * FROM users WHERE employee_code = ?', [employeeCode], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database Error' });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      token,
      name: user.name,
      role: user.role,
      employeeCode: user.employee_code
    });
  });
});

app.post('/api/forgot-password', async (req, res) => {
  const { ecode, oldPassword, newPassword } = req.body;

  db.query('SELECT * FROM users WHERE employee_code = ?', [ecode], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database Error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect old password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query('UPDATE users SET password = ? WHERE employee_code = ?', [hashedPassword, ecode], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Password reset failed' });
      res.json({ success: true, message: 'Password reset successfully' });
    });
  });
});

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(403).json({ success: false, message: 'Access Denied' });

  jwt.verify(token.replace('Bearer ', ''), JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

app.get('/api/admin/profile/:employeeCode', (req, res) => {
  const { employeeCode } = req.params;

  const userQuery = `
    SELECT id, name, email, gender, phone, employee_code, role 
    FROM users 
    WHERE employee_code = ?
  `;

  db.query(userQuery, [employeeCode], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database Error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });

    const user = results[0];

    if (user.role !== 'Supervisor') {
      return res.json(user);
    }

    // If Supervisor, fetch assigned cities
    const cityQuery = 'SELECT city_name FROM supervisor_cities WHERE supervisor_id = ?';
    db.query(cityQuery, [user.id], (err, cityResults) => {
      if (err) return res.status(500).json({ success: false, message: 'Error fetching assigned cities' });

      const assignedCities = cityResults.map(row => row.city_name);
      res.json({ ...user, assignedCities });
    });
  });
});

app.get('/roles', (req, res) => {
  db.query("SELECT DISTINCT role FROM users WHERE role IN ('Supervisor', 'Surveyor')", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database Error' });
    res.json(results);
  });
});

app.get('/employees', (req, res) => {
  const { role } = req.query;

  let query = 'SELECT employee_code, name FROM users';
  let params = [];

  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database Error' });
    res.json(results);
  });
});

app.get('/employee-profile/:employeeCode', (req, res) => {
  const { employeeCode } = req.params;

  const userQuery = 'SELECT id, name, role, email, phone, gender, employee_code FROM users WHERE employee_code = ?';

  db.query(userQuery, [employeeCode], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database Error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });

    const user = results[0];

    if (user.role === 'Supervisor') {
      const cityQuery = 'SELECT city_name FROM supervisor_cities WHERE supervisor_id = ? LIMIT 1';

      db.query(cityQuery, [user.id], (err, cityResults) => {
        if (err) return res.status(500).json({ success: false, message: 'City Lookup Error' });

        user.assigned_city = cityResults.length > 0 ? cityResults[0].city_name : 'Not Assigned';
        res.json(user);
      });
    } else {
      user.assigned_city = 'Not Assigned';
      res.json(user);
    }
  });
});

app.get("/api/last-surveyor-code", (req, res) => {
  const sql = "SELECT employee_code FROM users WHERE role = 'Surveyor' ORDER BY id DESC LIMIT 1";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    const lastSurveyorCode = result.length > 0 ? result[0].employee_code : "SUR000";
    res.json({ success: true, lastSurveyorCode });
  });
});

app.get('/api/last-employee-code', (req, res) => {
  db.query("SELECT employee_code FROM users WHERE role = 'Supervisor' ORDER BY id DESC LIMIT 1", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database Error' });
    if (results.length === 0) return res.json({ success: true, lastEmployeeCode: 'S000' });

    res.json({ success: true, lastEmployeeCode: results[0].employee_code });
  });
});

app.post("/api/create-supervisor", async (req, res) => {
  const { name, email, gender, phone, employee_code, password, role } = req.body;

  if (!name || !email || !gender || !phone || !employee_code) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  db.query('SELECT * FROM users WHERE employee_code = ?', [employee_code], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length > 0) {
      return res.status(400).json({ success: false, message: "Employee already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (name, email, gender, phone, employee_code, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, gender, phone, employee_code, hashedPassword, role], (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to add supervisor" });
      res.json({ success: true, message: "Supervisor added successfully!" });
    });
  });
});

app.get("/api/get-cities", (req, res) => {
  const query = "SELECT city_name FROM cities";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching cities: " + err);
      res.status(500).send({ message: "Error fetching cities" });
    } else {
      res.json({ cities: result.map(city => city.city_name) });
    }
  });
});

app.post("/api/create-surveyor", (req, res) => {
  const { name, email, gender, phone, employee_code, password, role, city } = req.body;

  const getCityIdQuery = "SELECT id FROM cities WHERE city_name = ? LIMIT 1";
  db.query(getCityIdQuery, [city], (err, result) => {
    if (err) {
      console.error("Error fetching city ID: " + err);
      return res.status(500).send({ message: "Error fetching city ID" });
    }

    if (result.length === 0) {
      return res.status(400).send({ message: "City not found" });
    }

    const cityId = result[0].id;

    const countSurveyorsQuery = "SELECT COUNT(*) AS count FROM users WHERE city_id = ?";
    db.query(countSurveyorsQuery, [cityId], (err, countResult) => {
      if (err) {
        console.error("Error checking surveyor count: " + err);
        return res.status(500).send({ message: "Error checking surveyor count" });
      }

      const currentSurveyorsCount = countResult[0].count;

      if (currentSurveyorsCount >= 8) {
        return res.status(400).send({ message: "This city already has 8 surveyors. Cannot add more." });
      }

      const insertSurveyorQuery = `
        INSERT INTO users (name, email, gender, phone, employee_code, password, role, city_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertSurveyorQuery, [name, email, gender, phone, employee_code, password, role, cityId], (err, result) => {
        if (err) {
          console.error("Error inserting surveyor: " + err);
          return res.status(500).send({ message: "Error creating surveyor" });
        }

        res.status(200).send({ message: "Surveyor created successfully" });
      });
    });
  });
});


app.post('/api/reset-password', async (req, res) => {
  const { employee_code } = req.body;

  db.query('SELECT role FROM users WHERE employee_code = ?', [employee_code], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });

    const role = results[0].role;
    const newPasswordPlain = role === 'Supervisor' ? SUPERVISOR_PASSWORD : role === 'Surveyor' ? SURVEYOR_PASSWORD : null;

    if (!newPasswordPlain) return res.status(400).json({ success: false, message: 'Invalid role' });
s
    const newPasswordHashed = await bcrypt.hash(newPasswordPlain, 10);

    db.query('UPDATE users SET password = ? WHERE employee_code = ?', [newPasswordHashed, employee_code], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to reset password' });
      res.json({ success: true, message: 'Password reset successfully!' });
    });
  });
});

app.post('/add-city', (req, res) => {
  const { cityName } = req.body;

  if (!cityName) {
      console.error("Error: City name is missing!");
      return res.status(400).json({ error: 'City name is required' });
  }

  db.query('INSERT INTO cities (city_name) VALUES (?)', [cityName], (err, result) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: err.sqlMessage });
      }
      res.json({ message: `City ${cityName} added successfully!` });
  });
});


app.post('/add-area', async (req, res) => {
  const { city, area } = req.body;

  if (!city || !area) {
    return res.status(400).json({ message: 'City and area are required' });
  }

  try {
    const [cityResult] = await promiseDb.query(
      'SELECT id FROM cities WHERE city_name = ?',
      [city]
    );

    if (cityResult.length === 0) {
      return res.status(400).json({ message: 'City not found' });
    }

    const cityId = cityResult[0].id;

    const [existing] = await promiseDb.query(
      'SELECT * FROM areas WHERE city_id = ? AND area_name = ?',
      [cityId, area]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Area already exists in this city' });
    }

    // Step 3: Insert area with city_id
    await promiseDb.query(
      'INSERT INTO areas (area_name, city_id) VALUES (?, ?)',
      [area, cityId]
    );

    res.status(200).json({ message: 'Area added successfully' });
  } catch (err) {
    console.error('Error adding area:', err);
    res.status(500).json({ message: 'Database error' });
  }
});


app.get('/get-supervisors', (req, res) => {
  db.query('SELECT id, name, employee_code, city_id FROM users WHERE role = "Supervisor"', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching supervisors' });
    }
    res.json(results);
  });
});

app.get('/get-cities', (req, res) => {
  db.query('SELECT id, city_name FROM cities', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching cities' });
    }
    res.json(results);
  });
});

app.get('/get-city-assignments', (req, res) => {
  db.query('SELECT * FROM supervisor_cities', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching city assignments' });
    }
    res.json(results);
  });
});

app.post("/assign-city-to-supervisor", (req, res) => {
  const { employee_code, city_id } = req.body;

  if (!employee_code || !city_id) {
    return res.status(400).json({ message: "Missing data" });
  }

  db.query("SELECT * FROM users WHERE employee_code = ?", [employee_code], (err, supervisorResult) => {
    if (err || supervisorResult.length === 0) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const supervisor = supervisorResult[0];

    db.query("SELECT * FROM cities WHERE id = ?", [city_id], (err, cityResult) => {
      if (err || cityResult.length === 0) {
        return res.status(404).json({ message: "City not found" });
      }

      const city_name = cityResult[0].city_name;

      db.query(
        "SELECT * FROM supervisor_cities WHERE supervisor_id = ?",
        [supervisor.id],
        (err, assignmentResult) => {
          if (err) return res.status(500).json({ message: "Database error" });

          if (assignmentResult.length > 0) {
            db.query(
              "UPDATE supervisor_cities SET city_name = ? WHERE supervisor_id = ?",
              [city_name, supervisor.id],
              (err) => {
                if (err) return res.status(500).json({ message: "Failed to update supervisor_cities" });

                db.query(
                  "UPDATE users SET city_id = ? WHERE id = ?",
                  [city_id, supervisor.id],
                  (err) => {
                    if (err) return res.status(500).json({ message: "Updated supervisor_cities but failed to update users" });

                    return res.json({ message: "City assignment updated successfully!" });
                  }
                );
              }
            );
          } else {
            
            db.query(
              "SELECT * FROM supervisor_cities WHERE city_name = ?",
              [city_name],
              (err, cityAssignments) => {
                if (err) return res.status(500).json({ message: "Database error" });

                if (cityAssignments.length >= 2) {
                  return res.status(400).json({ message: "Only 2 supervisors can be assigned to a city." });
                }

                db.query(
                  "INSERT INTO supervisor_cities (supervisor_id, city_name) VALUES (?, ?)",
                  [supervisor.id, city_name],
                  (err) => {
                    if (err) return res.status(500).json({ message: "Failed to assign city" });

                    db.query(
                      "UPDATE users SET city_id = ? WHERE id = ?",
                      [city_id, supervisor.id],
                      (err) => {
                        if (err) return res.status(500).json({ message: "City assigned but failed to update user table" });
                        res.json({ message: "City assigned successfully!" });
                      }
                    );
                  }
                );
              }
            );
          }
        }
      );
    });
  });
});

app.get("/get-supervisor-id/:employeeCode", (req, res) => {
  const { employeeCode } = req.params;
  const query = `SELECT id, city_id FROM users WHERE employee_code = ? AND role = 'Supervisor'`;

  db.query(query, [employeeCode], (err, result) => {
    if (err) {
      console.error("Error fetching supervisor ID:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Supervisor not found" });
    }
    res.json(result[0]);
  });
});

app.get("/get-surveyors-by-supervisor/:supervisorId", (req, res) => {
  const { supervisorId } = req.params;

  db.query(`SELECT city_id FROM users WHERE id = ? AND role = 'Supervisor'`, [supervisorId], (err, result) => {
    if (err) {
      console.error("Error fetching supervisor's city_id:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Supervisor not found" });
    }

    const cityId = result[0].city_id;

    db.query(`SELECT id, name FROM users WHERE city_id = ? AND role = 'Surveyor'`, [cityId], (err, surveyors) => {
      if (err) {
        console.error("Error fetching surveyors:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(surveyors);
    });
  });
});

app.get("/get-areas-by-supervisor/:supervisorId", (req, res) => {
  const { supervisorId } = req.params;

  db.query(`SELECT city_id FROM users WHERE id = ? AND role = 'Supervisor'`, [supervisorId], (err, result) => {
    if (err) {
      console.error("Error fetching supervisor's city_id:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Supervisor not found" });
    }

    const cityId = result[0].city_id;

    db.query(`SELECT id, area_name FROM areas WHERE city_id = ?`, [cityId], (err, areas) => {
      if (err) {
        console.error("Error fetching areas:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(areas);
    });
  });
});

app.get("/get-city-name/:cityId", (req, res) => {
  const { cityId } = req.params;
  const query = `SELECT city_name FROM cities WHERE id = ?`;

  db.query(query, [cityId], (err, result) => {
    if (err) {
      console.error("Error fetching city name:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }
    res.json(result[0]); 
  });
});

app.post("/assign-area", (req, res) => {
  const { surveyorId, supervisorId, cityName, areaName } = req.body;

  if (!surveyorId || !supervisorId || !cityName || !areaName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Step 1: Check if the surveyor is already assigned to the area
  const checkQuery = `
    SELECT * FROM surveyor_area 
    WHERE surveyor_id = ? AND city_name = ? AND area_name = ?
  `;
  
  db.query(checkQuery, [surveyorId, cityName, areaName], (err, result) => {
    if (err) {
      console.error("Error checking existing assignment:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Step 2: If the surveyor is already assigned, return an error
    if (result.length > 0) {
      return res.status(400).json({
        message: `The surveyor is already assigned to this area. Do you want to update the area?`,
        existingAssignment: result[0], // Send back the existing assignment data
      });
    }

    // Step 3: If the area is not assigned, insert a new record
    const insertQuery = `
      INSERT INTO surveyor_area (surveyor_id, supervisor_id, city_name, area_name)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [surveyorId, supervisorId, cityName, areaName], (err, result) => {
      if (err) {
        console.error("Error assigning area:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.json({ message: "Area assigned successfully" });
    });
  });
});


app.post("/update-assignment", (req, res) => {
  const { surveyorId, supervisorId, cityName, areaName, existingAssignmentId } = req.body;

  if (!surveyorId || !supervisorId || !cityName || !areaName || !existingAssignmentId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Step 1: Remove the old assignment if exists
  const deleteQuery = `
    DELETE FROM surveyor_area
    WHERE id = ?
  `;
  
  db.query(deleteQuery, [existingAssignmentId], (err, result) => {
    if (err) {
      console.error("Error deleting old assignment:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Step 2: Insert the updated assignment
    const updateQuery = `
      INSERT INTO surveyor_area (surveyor_id, supervisor_id, city_name, area_name)
      VALUES (?, ?, ?, ?)
    `;

    db.query(updateQuery, [surveyorId, supervisorId, cityName, areaName], (err, result) => {
      if (err) {
        console.error("Error updating assignment:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.json({ message: "Area updated successfully" });
    });
  });
});

app.get("/supervisor/assigned-areas/:surveyorId", (req, res) => {
  const { surveyorId } = req.params;
  const query = `
    SELECT sa.area_name
    FROM surveyor_area sa
    WHERE sa.surveyor_id = ?
  `;

  db.query(query, [surveyorId], (err, result) => {
    if (err) {
      console.error("Error fetching assigned areas:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "No areas found for this surveyor" });
    }

    res.json(result);
  });
});

app.delete("/supervisor/remove-assigned-area", (req, res) => {
  const { surveyor_id, area_id } = req.body;

  if (!surveyor_id || !area_id) {
    return res.status(400).json({ error: "Surveyor ID and Area ID are required." });
  }

  const query = `DELETE FROM surveyor_area WHERE surveyor_id = ? AND area_name = ?`;

  db.query(query, [surveyor_id, area_id], (err, result) => {
    if (err) {
      console.error("Error removing assigned area:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No matching assignment found." });
    }
    res.json({ message: "Area assignment removed successfully." });
  });
});
//try
app.get('/get-areas-by-surveyor/:surveyorId', (req, res) => {
  const { surveyorId } = req.params;

  const query = `
    SELECT id, area_name 
    FROM surveyor_area 
    WHERE surveyor_id = ?
  `;

  db.query(query, [surveyorId], (err, results) => {
    if (err) {
      console.error('Error fetching areas:', err);
      return res.status(500).json({ message: 'Error retrieving areas' });
    }

    res.json(results);
  });
});

app.post('/assign-survey', (req, res) => {
  const { supervisor_id, surveyor_id, area_id, form_name } = req.body;
  

  if (!supervisor_id || !surveyor_id || !area_id || !form_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `
    INSERT INTO assigned_surveys (supervisor_id, surveyor_id, area_id, survey_name, status)
    VALUES (?, ?, ?, ?, 'pending')
  `;

  db.query(query, [supervisor_id, surveyor_id, area_id, form_name], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({ message: "Survey assigned successfully" });
  });
});
app.post('/approve-survey', (req, res) => {
  const { surveyId } = req.body;

  const query = `
    UPDATE assigned_surveys
    SET status = 'approved'
    WHERE id = ?
  `;

  db.query(query, [surveyId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json({ message: "Survey approved" });
  });
});

app.post('/reject-survey', (req, res) => {
  const { surveyId } = req.body;

  const query = `
    UPDATE assigned_surveys
    SET status = 'rejected'
    WHERE id = ?
  `;

  db.query(query, [surveyId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json({ message: "Survey rejected" });
  });
});


app.get('/get-assigned-surveys/:supervisorId', (req, res) => {
  const { supervisorId } = req.params;

  if (isNaN(supervisorId)) {
    return res.status(400).json({ message: "Invalid supervisor ID" });
  }

  const query = `
    SELECT id, survey_name, area_id, surveyor_id, status, form_data
    FROM assigned_surveys
    WHERE supervisor_id = ?
  `;

  db.query(query, [supervisorId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    // If no surveys found, return a specific message
    if (result.length === 0) {
      return res.status(404).json({ message: "No surveys found for this supervisor" });
    }

    return res.status(200).json(result);
  });
});

app.get('/get-assigned-surveys/:surveyorId', async (req, res) => {
  const surveyorId = req.params.surveyorId;
  const query = 'SELECT * FROM assigned_surveys WHERE surveyor_id = ?';

  db.query(query, [surveyorId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/get-survey-reports/:supervisorId', (req, res) => {
  const supervisorId = req.params.supervisorId;
  const surveyorId = req.query.surveyorId;

  let query = `
    SELECT a.id, a.survey_name, a.status, a.form_data, a.created_at,
           sr.name AS surveyor_name,
           ar.area_name
    FROM assigned_surveys a
    JOIN surveyors sr ON a.surveyor_id = sr.id
    JOIN areas ar ON a.area_id = ar.id
    WHERE a.supervisor_id = ?
  `;
  const params = [supervisorId];

  if (surveyorId) {
    query += ' AND a.surveyor_id = ?';
    params.push(surveyorId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    const formatted = results.map(row => ({
      ...row,
      form_data: JSON.parse(row.form_data)
    }));

    res.json(formatted);
  });
});
app.post('/submit-survey', (req, res) => {
  const { surveyId, surveyorId, formData, status } = req.body;

  // Save formData as JSON string in DB, update status to pending
  const sql = `UPDATE assigned_surveys 
               SET form_data = ?, status = ?, surveyor_id = ? 
               WHERE id = ?`;
  db.query(sql, [JSON.stringify(formData), status, surveyorId, surveyId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Survey submitted successfully' });
  });
});


app.listen(5001, () => console.log('Server running on port 5001'));
