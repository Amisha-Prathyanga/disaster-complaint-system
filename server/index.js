import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import db from './db.js';
import { sendSMS, sendWhatsApp } from './services/twilio.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 if not set, to match frontend config

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

// DB Connection Test Endpoint
app.get('/api/test-db', async (req, res) => {
  const debugInfo = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    db: process.env.DB_NAME,
    ssl: process.env.DB_SSL
  };
  try {
    const [rows] = await db.query('SELECT 1 as val');
    res.json({ 
      success: true, 
      message: 'Database connected successfully', 
      val: rows[0].val,
      config: debugInfo 
    });
  } catch (err) {
    console.error('DB Connection Failed:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: err.message, 
      config: debugInfo 
    });
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
        new Date(data.createdAt || Date.now()).toISOString().slice(0, 19).replace('T', ' '),
        data.contactName,
        data.contactPhone,
        JSON.stringify(data.remarks || []),
        data.aiAnalysis
      ]
    );

    // --- Send SMS Notifications ---
    try {
      // 1. Notify Admin
      const [adminRows] = await db.query('SELECT phone FROM users WHERE role = "ADMIN"');
      adminRows.forEach(user => {
        if (user.phone) {
          const msg = `New Complaint Alert!\nTitle: ${data.title}\nCategory: ${data.category}\nPriority: ${data.priority || 'Medium'}\nLocation: ${data.location}`;
          sendSMS(user.phone, msg);
          sendWhatsApp(user.phone, msg);
        }
      });

      // 2. Notify relevant DSD Officer
      if (data.dsd) {
        const [officerRows] = await db.query('SELECT phone FROM users WHERE role = "OFFICER" AND dsd = ?', [data.dsd]);
        officerRows.forEach(user => {
            if (user.phone) {
              const msg = `New Assignment Alert!\nYou have a new complaint in ${data.dsd}.\nTitle: ${data.title}\nCategory: ${data.category}\nPriority: ${data.priority || 'Medium'}`;
              sendSMS(user.phone, msg);
              sendWhatsApp(user.phone, msg);
            }
        });
      }
    } catch (notifyErr) {
      console.error('Error sending notifications:', notifyErr);
      // Proceed without failing the request
    }

    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create complaint', error: err.message, code: err.code });
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

// Public Endpoint for Tracking
app.get('/api/public/complaints/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (rows.length > 0) {
      const c = rows[0];
      // Return only non-sensitive info
      const publicData = {
        id: c.id,
        status: c.status,
        priority: c.priority, // Optional, maybe helpful
        createdAt: c.created_at,
        remarks: typeof c.remarks === 'string' ? JSON.parse(c.remarks || '[]') : c.remarks
      };
      res.json({ success: true, data: publicData });
    } else {
      res.status(404).json({ success: false, message: 'Complaint not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
  });
}

export default app;
