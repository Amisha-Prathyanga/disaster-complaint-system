import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- API Endpoints ---

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      const user = rows[0];
      // Do not return password
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Complaints
app.get('/api/complaints', async (req, res) => {
  const { role, dsd } = req.query;
  try {
    let query = 'SELECT * FROM complaints ORDER BY created_at DESC';
    let params = [];

    if (role === 'OFFICER' && dsd) {
      query = 'SELECT * FROM complaints WHERE dsd = ? ORDER BY created_at DESC';
      params = [dsd];
    }

    const [rows] = await db.query(query, params);
    
    // Parse JSON remarks
    const complaints = rows.map(c => ({
      ...c,
      remarks: typeof c.remarks === 'string' ? JSON.parse(c.remarks || '[]') : c.remarks,
      latitude: c.latitude ? parseFloat(c.latitude) : undefined,
      longitude: c.longitude ? parseFloat(c.longitude) : undefined,
      // Ensure camelCase for frontend
      createdAt: c.created_at,
      contactName: c.contact_name,
      contactPhone: c.contact_phone,
      aiAnalysis: c.ai_analysis
    }));

    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create Complaint
app.post('/api/complaints', async (req, res) => {
  const data = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO complaints 
      (id, title, description, category, location, latitude, longitude, dsd, priority, status, created_at, contact_name, contact_phone, remarks, ai_analysis) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.title,
        data.description,
        data.category,
        data.location,
        data.latitude,
        data.longitude,
        data.dsd,
        data.priority || 'Medium',
        data.status || 'New',
        data.createdAt || new Date(),
        data.contactName,
        data.contactPhone,
        JSON.stringify(data.remarks || []),
        data.aiAnalysis
      ]
    );
    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create complaint' });
  }
});

// Update Complaint (Status/Remarks/Priority)
app.put('/api/complaints/:id', async (req, res) => {
  const { id } = req.params;
  const { status, remarks, priority, aiAnalysis } = req.body;
  try {
    // We only update specific fields
    await db.query(
      'UPDATE complaints SET status = ?, remarks = ?, priority = ?, ai_analysis = ? WHERE id = ?',
      [status, JSON.stringify(remarks), priority, aiAnalysis, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (0.0.0.0)`);
});
