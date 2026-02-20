const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const login = (req, res) => {
  const { ecode, password } = req.body;
  db.query('SELECT * FROM employees WHERE ecode = ?', [ecode], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      req.session.user = { name: user.name, role: user.role };
      res.json({ message: 'Login successful', token, name: user.name, role: user.role });
    });
  });
};

const forgotPassword = (req, res) => {
  const { ecode, newPassword } = req.body;
  db.query('SELECT * FROM employees WHERE ecode = ?', [ecode], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: 'Error hashing password' });

      db.query('UPDATE employees SET password = ? WHERE ecode = ?', [hash, ecode], (err) => {
        if (err) return res.status(500).json({ message: 'Update failed' });
        res.json({ message: 'Password reset successful' });
      });
    });
  });
};

module.exports = { login, forgotPassword };
