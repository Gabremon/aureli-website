/**
 * Express Backend Server for Authentication
 * Handles user login and role-based authentication
 */

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'aureli_db',
  user: process.env.DB_USER || 'aureli_user',
  password: process.env.DB_PASSWORD || 'aureli_password',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// In-memory session store (in production, use Redis or database sessions)
const sessions = new Map();

// Helper function to generate session token
function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session
    const sessionToken = generateSessionToken();
    sessions.set(sessionToken, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Return user data (without password)
    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify session endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = sessions.get(token);

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists in database
    const result = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [session.userId]
    );

    if (result.rows.length === 0) {
      sessions.delete(token);
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      sessions.delete(token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to verify authentication
function verifyAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const session = sessions.get(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = session;
  req.token = token;
  next();
}

// Employee management endpoints

// Get all applicants for a business
app.get('/api/employees', verifyAuth, async (req, res) => {
  try {
    // Only business users can access their applicants
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can access applicants' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Query applicants using business_id (with fallback to business_owner_id for migration period)
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, position, status, 
              stage_order, notes, applied_date, created_at, updated_at
       FROM applicants 
       WHERE (business_id = $1 OR business_owner_id = $2)
       ORDER BY status, stage_order ASC, created_at DESC`,
      [businessId, req.user.userId]
    );

    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Get applicants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new applicant/candidate
app.post('/api/employees', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can create applicants' });
    }

    const { first_name, last_name, email, phone, position, notes } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Get the max stage_order for the default status (using business_id)
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(stage_order), 0) as max_order FROM applicants WHERE business_id = $1 AND status = $2',
      [businessId, 'new_applicant']
    );
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    const result = await pool.query(
      `INSERT INTO applicants (business_id, first_name, last_name, email, phone, position, status, stage_order, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date, created_at, updated_at`,
      [businessId, first_name, last_name, email || null, phone || null, position || null, 'new_applicant', nextOrder, notes || null]
    );

    res.status(201).json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Create applicant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update applicant status (move between stages)
app.patch('/api/employees/:id/status', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can update applicants' });
    }

    const { id } = req.params;
    const { status, stage_order } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['new_applicant', 'screening', 'interview_scheduled', 'interview_complete', 
                          'offer_extended', 'offer_accepted', 'onboarding', 'active_employee', 
                          'offboarding', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Verify applicant belongs to this business (support both business_id and business_owner_id during migration)
    const applicantCheck = await pool.query(
      'SELECT id FROM applicants WHERE id = $1 AND (business_id = $2 OR business_owner_id = $3)',
      [id, businessId, req.user.userId]
    );

    if (applicantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // If stage_order is provided, use it; otherwise, get the max order for the new status
    let finalStageOrder = stage_order;
    if (finalStageOrder === undefined || finalStageOrder === null) {
      const maxOrderResult = await pool.query(
        'SELECT COALESCE(MAX(stage_order), 0) as max_order FROM applicants WHERE business_id = $1 AND status = $2',
        [businessId, status]
      );
      finalStageOrder = (maxOrderResult.rows[0].max_order || 0) + 1;
    }

    const result = await pool.query(
      `UPDATE applicants 
       SET status = $1, stage_order = $2, updated_at = CURRENT_TIMESTAMP,
           business_id = COALESCE(business_id, $3)
       WHERE id = $4 AND (business_id = $3 OR business_owner_id = $5)
       RETURNING id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date, created_at, updated_at`,
      [status, finalStageOrder, businessId, id, req.user.userId]
    );

    res.json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Update applicant status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update applicant details
app.patch('/api/employees/:id', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can update applicants' });
    }

    const { id } = req.params;
    const { first_name, last_name, email, phone, position, notes } = req.body;

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Verify applicant belongs to this business (support both business_id and business_owner_id during migration)
    const applicantCheck = await pool.query(
      'SELECT id FROM applicants WHERE id = $1 AND (business_id = $2 OR business_owner_id = $3)',
      [id, businessId, req.user.userId]
    );

    if (applicantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(last_name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(position);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`business_id = COALESCE(business_id, $${paramCount})`);
    const businessIdSetParam = paramCount++;
    values.push(businessId);
    
    values.push(id);
    const idParam = paramCount++;
    values.push(businessId);
    const businessIdWhereParam = paramCount++;
    values.push(req.user.userId);
    const userIdParam = paramCount++;

    const result = await pool.query(
      `UPDATE applicants 
       SET ${updates.join(', ')}
       WHERE id = $${idParam} AND (business_id = $${businessIdWhereParam} OR business_owner_id = $${userIdParam})
       RETURNING id, first_name, last_name, email, phone, position, status, stage_order, notes, applied_date, created_at, updated_at`,
      values
    );

    res.json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Update applicant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete applicant
app.delete('/api/employees/:id', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can delete applicants' });
    }

    const { id } = req.params;

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Delete applicant (support both business_id and business_owner_id during migration)
    const result = await pool.query(
      'DELETE FROM applicants WHERE id = $1 AND (business_id = $2 OR business_owner_id = $3) RETURNING id',
      [id, businessId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.json({ message: 'Applicant deleted successfully' });
  } catch (error) {
    console.error('Delete applicant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Business location endpoints

// Get all locations for the authenticated business user
app.get('/api/business/locations', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can access locations' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Get all locations for this business
    const result = await pool.query(
      `SELECT id, business_id, name, address, city, state, zip_code, country, 
              is_active, created_at, updated_at
       FROM locations 
       WHERE business_id = $1 
       ORDER BY is_active DESC, name ASC`,
      [businessId]
    );

    res.json({ locations: result.rows });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new location for the authenticated business user
app.post('/api/business/locations', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can create locations' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    const { name, address, city, state, zip_code, country, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    // Create the location
    const result = await pool.query(
      `INSERT INTO locations (
        business_id, name, address, city, state, zip_code, country, 
        is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, business_id, name, address, city, state, zip_code, country, 
                is_active, created_at, updated_at`,
      [
        businessId,
        name.trim(),
        address?.trim() || null,
        city?.trim() || null,
        state?.trim() || null,
        zip_code?.trim() || null,
        country?.trim() || 'United States',
        is_active !== undefined ? is_active : true,
      ]
    );

    res.status(201).json({ location: result.rows[0] });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Business openings endpoints

// Get all openings for the authenticated business user
app.get('/api/business/openings', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can access openings' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Get all openings with location and business info, and count applications
    const result = await pool.query(
      `SELECT 
        o.id,
        o.business_id,
        o.location_id,
        o.title,
        o.position_type,
        o.created_at,
        o.updated_at,
        b.name as business_name,
        l.name as location_name,
        l.address as location_address,
        l.city as location_city,
        l.state as location_state,
        l.zip_code as location_zip_code,
        l.country as location_country,
        COUNT(DISTINCT a.id) as application_count
      FROM openings o
      INNER JOIN businesses b ON o.business_id = b.id
      INNER JOIN locations l ON o.location_id = l.id
      LEFT JOIN applicants a ON a.business_id = o.business_id 
        AND LOWER(TRIM(a.position)) = LOWER(TRIM(o.title))
      WHERE o.business_id = $1
      GROUP BY o.id, o.business_id, o.location_id, o.title, o.position_type, 
               o.created_at, o.updated_at, b.name, l.name, l.address, l.city, 
               l.state, l.zip_code, l.country
      ORDER BY o.created_at DESC`,
      [businessId]
    );

    res.json({ openings: result.rows });
  } catch (error) {
    console.error('Get openings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new opening for the authenticated business user
app.post('/api/business/openings', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can create openings' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    const { title, location_id, position_type } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Opening title is required' });
    }

    if (!location_id) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Verify location belongs to this business
    const locationCheck = await pool.query(
      'SELECT id FROM locations WHERE id = $1 AND business_id = $2',
      [location_id, businessId]
    );

    if (locationCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Location not found or does not belong to your business' });
    }

    // Create the opening
    const result = await pool.query(
      `INSERT INTO openings (business_id, location_id, title, position_type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, business_id, location_id, title, position_type, created_at, updated_at`,
      [businessId, location_id, title.trim(), position_type?.trim() || null]
    );

    // Get full opening details with location and business info
    const openingDetails = await pool.query(
      `SELECT 
        o.id,
        o.business_id,
        o.location_id,
        o.title,
        o.position_type,
        o.created_at,
        o.updated_at,
        b.name as business_name,
        l.name as location_name,
        l.address as location_address,
        l.city as location_city,
        l.state as location_state,
        l.zip_code as location_zip_code,
        l.country as location_country,
        0 as application_count
      FROM openings o
      INNER JOIN businesses b ON o.business_id = b.id
      INNER JOIN locations l ON o.location_id = l.id
      WHERE o.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ opening: openingDetails.rows[0] });
  } catch (error) {
    console.error('Create opening error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Business profile endpoints

// Get business profile for the authenticated business user
app.get('/api/business/profile', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can access business profile' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Get user email to set/verify business email
    const userEmailResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [req.user.userId]
    );
    const userEmail = userEmailResult.rows[0]?.email;

    // Get business information
    const result = await pool.query(
      `SELECT id, name, industry, website, phone, email, address, city, state, 
              zip_code, country, created_at, updated_at
       FROM businesses 
       WHERE id = $1`,
      [businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const business = result.rows[0];
    
    // Ensure business email matches user email (auto-update if different)
    if (userEmail && business.email !== userEmail) {
      await pool.query(
        'UPDATE businesses SET email = $1 WHERE id = $2',
        [userEmail, businessId]
      );
      business.email = userEmail;
    }

    res.json({ business });
  } catch (error) {
    console.error('Get business profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business profile for the authenticated business user
app.patch('/api/business/profile', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Only business users can update business profile' });
    }

    // Get business_id from user
    const userResult = await pool.query(
      'SELECT business_id FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].business_id) {
      return res.status(403).json({ error: 'User is not associated with a business' });
    }

    const businessId = userResult.rows[0].business_id;

    // Get user email to set business email (email is not editable - always matches user email)
    const userEmailResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [req.user.userId]
    );
    const userEmail = userEmailResult.rows[0]?.email;

    const { name, industry, website, phone, address, city, state, zip_code, country } = req.body;
    // Note: email is intentionally excluded - it's automatically set from the logged-in user

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    updates.push(`name = $${paramCount++}`);
    values.push(name.trim());

    // Email is always set from the logged-in user's email (not editable)
    if (userEmail) {
      updates.push(`email = $${paramCount++}`);
      values.push(userEmail);
    }

    if (industry !== undefined) {
      updates.push(`industry = $${paramCount++}`);
      values.push(industry?.trim() || null);
    }
    if (website !== undefined) {
      updates.push(`website = $${paramCount++}`);
      values.push(website?.trim() || null);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone?.trim() || null);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address?.trim() || null);
    }
    if (city !== undefined) {
      updates.push(`city = $${paramCount++}`);
      values.push(city?.trim() || null);
    }
    if (state !== undefined) {
      updates.push(`state = $${paramCount++}`);
      values.push(state?.trim() || null);
    }
    if (zip_code !== undefined) {
      updates.push(`zip_code = $${paramCount++}`);
      values.push(zip_code?.trim() || null);
    }
    if (country !== undefined) {
      updates.push(`country = $${paramCount++}`);
      values.push(country?.trim() || null);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(businessId);
    const businessIdParam = paramCount++;

    // Update business
    const result = await pool.query(
      `UPDATE businesses 
       SET ${updates.join(', ')}
       WHERE id = $${businessIdParam}
       RETURNING id, name, industry, website, phone, email, address, city, state, 
                 zip_code, country, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({ business: result.rows[0] });
  } catch (error) {
    console.error('Update business profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoints for database management

// Get database statistics and table information
app.get('/api/admin/database/stats', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access database statistics' });
    }

    // Get table information - check what tables actually exist
    // Check for all tables we care about
    const allTableNames = ['migrations', 'users', 'businesses', 'locations', 'applicants', 'employees'];
    const tableCheckResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = ANY($1)
      ORDER BY table_name
    `, [allTableNames]);
    
    // Get all existing tables as a set for quick lookup
    const existingTables = tableCheckResult.rows.map(row => row.table_name);
    const existingTablesSet = new Set(existingTables);
    
    // Determine which table name to use (prefer applicants, fallback to employees if it exists)
    let applicantTableName = 'applicants';
    if (existingTablesSet.has('employees') && !existingTablesSet.has('applicants')) {
      applicantTableName = 'employees';
      console.log('⚠️  Note: Found "employees" table. Consider renaming to "applicants" using: ALTER TABLE employees RENAME TO applicants;');
    }

    // Build list of tables to query - include all standard tables that exist, plus applicant table
    const tablesToQuery = ['migrations', 'users', 'businesses', 'locations'].filter(
      table => existingTablesSet.has(table)
    );
    
    // Always add applicant table (whether it's 'applicants' or 'employees')
    if (existingTablesSet.has('applicants') || existingTablesSet.has('employees')) {
      tablesToQuery.push(applicantTableName);
    }

    // Map the actual table name to display name
    const tableDisplayNames = {
      'migrations': 'migrations',
      'users': 'users',
      'businesses': 'businesses',
      'locations': 'locations',
      'applicants': 'applicants',
      'employees': 'applicants' // Show as "applicants" in UI even if table is named "employees"
    };

    const tableStats = {};

    // Query each table for statistics
    for (const table of tablesToQuery) {
      try {
        // Get row count
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        
        // Get table size (PostgreSQL specific)
        const sizeResult = await pool.query(`
          SELECT 
            pg_size_pretty(pg_total_relation_size('${table}')) as total_size,
            pg_size_pretty(pg_relation_size('${table}')) as table_size,
            pg_size_pretty(pg_indexes_size('${table}')) as indexes_size
          FROM information_schema.tables 
          WHERE table_name = '${table}'
        `);

        // Use display name (applicants) even if actual table is employees
        const displayName = tableDisplayNames[table] || table;
        tableStats[displayName] = {
          rowCount: parseInt(countResult.rows[0].count),
          totalSize: sizeResult.rows[0]?.total_size || 'N/A',
          tableSize: sizeResult.rows[0]?.table_size || 'N/A',
          indexesSize: sizeResult.rows[0]?.indexes_size || 'N/A',
          actualTableName: table, // Store actual table name for queries
        };
      } catch (err) {
        console.error(`Error getting stats for table ${table}:`, err);
        const displayName = tableDisplayNames[table] || table;
        tableStats[displayName] = {
          rowCount: 0,
          totalSize: 'N/A',
          tableSize: 'N/A',
          indexesSize: 'N/A',
          error: err.message,
          actualTableName: table,
        };
      }
    }

    // Get database connection info
    const dbInfoResult = await pool.query(`
      SELECT 
        current_database() as database_name,
        version() as postgres_version,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);

    // Get total database size
    const dbSizeResult = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
    `);

    res.json({
      tables: tableStats,
      database: {
        name: dbInfoResult.rows[0]?.database_name || 'N/A',
        version: dbInfoResult.rows[0]?.postgres_version || 'N/A',
        user: dbInfoResult.rows[0]?.current_user || 'N/A',
        serverAddress: dbInfoResult.rows[0]?.server_address || 'N/A',
        serverPort: dbInfoResult.rows[0]?.server_port || 'N/A',
        size: dbSizeResult.rows[0]?.database_size || 'N/A',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get data from a specific table
app.get('/api/admin/database/tables/:tableName', verifyAuth, async (req, res) => {
  let actualTableName = null;
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access table data' });
    }

    const { tableName } = req.params;
    const { page = 1, limit = 50, sortBy, sortOrder = 'ASC' } = req.query;

    // Check if employees table exists (might not have been renamed yet)
    const tableExistsCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('applicants', 'employees')
      LIMIT 1
    `);
    
    // Map display name to actual table name
    actualTableName = tableName;
    if (tableName === 'applicants') {
      if (tableExistsCheck.rows.length > 0) {
        actualTableName = tableExistsCheck.rows[0].table_name; // Use actual table name (may be 'employees')
      }
      // If no table found, actualTableName stays 'applicants' which will error (expected)
    }

    // Whitelist allowed tables for security - include businesses and locations
    const allowedTables = ['migrations', 'users', 'businesses', 'locations', 'applicants', 'employees'];
    if (!allowedTables.includes(actualTableName) && !allowedTables.includes(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // Get primary key column name (for default sorting)
    const pkResult = await pool.query(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = $1
      ORDER BY kcu.ordinal_position
      LIMIT 1
    `, [actualTableName]);

    const defaultOrderBy = pkResult.rows.length > 0 ? pkResult.rows[0].column_name : '1'; // Use column 1 if no PK found

    // Sanitize sortBy to prevent SQL injection
    let orderBy = defaultOrderBy;
    if (sortBy && typeof sortBy === 'string') {
      // Only allow alphanumeric and underscore characters
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortBy)) {
        // Verify the column exists in the table
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2
        `, [actualTableName, sortBy]);
        if (columnCheck.rows.length > 0) {
          orderBy = sortBy;
        }
      }
    }

    // Validate sortOrder
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const safeLimit = Math.min(parseInt(limit), 100); // Max 100 rows per request

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${actualTableName}`);

    // Get paginated data (exclude password_hash for users table)
    let query = `SELECT * FROM ${actualTableName} ORDER BY ${orderBy} ${validSortOrder} LIMIT $1 OFFSET $2`;
    if (actualTableName === 'users') {
      query = `SELECT id, email, name, role, created_at, updated_at FROM ${actualTableName} ORDER BY ${orderBy} ${validSortOrder} LIMIT $1 OFFSET $2`;
    }

    const dataResult = await pool.query(query, [safeLimit, offset]);

    // Get column information
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [actualTableName]);

    res.json({
      table: tableName, // Always return display name (applicants) in response
      columns: columnsResult.rows.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default,
      })),
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: safeLimit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / safeLimit),
      },
      actualTableName: actualTableName, // Include actual table name for delete operations
    });
  } catch (error) {
    const { tableName: errorTableName } = req.params;
    console.error('Get table data error:', error);
    console.error('Error details:', {
      tableName: errorTableName,
      actualTableName: actualTableName || 'undefined',
      message: error.message,
      code: error.code,
    });
    
    // Provide more specific error messages
    if (error.message && error.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: `Table "${actualTableName || errorTableName}" does not exist. Please run migrations.`,
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      tableName: actualTableName || errorTableName
    });
  }
});

// Get user statistics by role
app.get('/api/admin/database/users/stats', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access user statistics' });
    }

    // Get users by role
    const roleStats = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role
    `);

    // Get users by creation date (last 30 days)
    const recentUsers = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      byRole: roleStats.rows,
      recentActivity: recentUsers.rows,
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applicant statistics by status
app.get('/api/admin/database/employees/stats', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access applicant statistics' });
    }

    // Determine actual table name (applicants or employees)
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('applicants', 'employees')
      ORDER BY table_name DESC
      LIMIT 1
    `);

    let actualTableName = 'applicants'; // Default
    if (tableCheck.rows.length > 0) {
      actualTableName = tableCheck.rows[0].table_name;
    } else {
      // Table doesn't exist yet - return empty stats
      return res.json({
        byStatus: [],
        byBusiness: [],
        recentActivity: [],
        message: 'Applicants table does not exist yet. Please run migrations.',
      });
    }

    // Get applicants by status (using actual table name)
    const statusStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM ${actualTableName}
      GROUP BY status
      ORDER BY status
    `);

    // Get applicants by business (support both business_id and business_owner_id during migration)
    let byBusiness;
    try {
      byBusiness = await pool.query(`
        SELECT b.name as business_name, b.id as business_id, COUNT(a.id) as applicant_count
        FROM businesses b
        LEFT JOIN ${actualTableName} a ON b.id = a.business_id OR (a.business_owner_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM users u WHERE u.id = a.business_owner_id AND u.business_id = b.id
        ))
        GROUP BY b.id, b.name
        ORDER BY applicant_count DESC
      `);
    } catch (err) {
      // Fallback if businesses table doesn't exist yet
      console.warn('Businesses table not found, using fallback query:', err);
      byBusiness = { rows: [] };
    }

    // Get applicants by creation date (last 30 days) - using actual table name
    const recentApplicants = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM ${actualTableName}
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      byStatus: statusStats.rows,
      byBusiness: byBusiness.rows,
      recentActivity: recentApplicants.rows,
    });
  } catch (error) {
    console.error('Applicant stats error:', error);
    // Return empty stats instead of error if table doesn't exist
    if (error.message && error.message.includes('does not exist')) {
      return res.json({
        byStatus: [],
        byBusiness: [],
        recentActivity: [],
        message: 'Applicants table does not exist yet. Please run migrations.',
      });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Admin endpoint to delete a row from any table
app.delete('/api/admin/database/tables/:tableName/rows/:id', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete table data' });
    }

    const { tableName, id } = req.params;

    // Whitelist allowed tables for security - check if employees table exists
    const tableExistsCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('applicants', 'employees', 'businesses', 'locations')
    `);
    
    const existingTables = tableExistsCheck.rows.map(row => row.table_name);
    const actualApplicantTable = existingTables.includes('applicants') ? 'applicants' : 
                                 (existingTables.includes('employees') ? 'employees' : 'applicants');
    const allowedTables = ['migrations', 'users', 'businesses', 'locations', 'applicants', 'employees'];
    
    // Allow access if using display name (applicants) or actual table name (employees)
    if (!allowedTables.includes(tableName) && tableName !== actualApplicantTable) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    // Map display name to actual table name
    let actualTableName = tableName;
    if (tableName === 'applicants' && actualApplicantTable === 'employees') {
      actualTableName = 'employees';
    }

    // Get the primary key column name (usually 'id')
    const pkResult = await pool.query(`
      SELECT column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = $1
      LIMIT 1
    `, [actualTableName]);

    if (pkResult.rows.length === 0) {
      return res.status(400).json({ error: 'Could not determine primary key for table' });
    }

    const pkColumn = pkResult.rows[0].column_name;

    // For users table, prevent deleting the current admin user
    if (actualTableName === 'users') {
      const userCheck = await pool.query(`SELECT id, role FROM users WHERE id = $1`, [id]);
      if (userCheck.rows.length > 0 && userCheck.rows[0].id === req.user.userId) {
        return res.status(400).json({ error: 'Cannot delete your own user account' });
      }
    }

    // Delete the row from the actual table
    const result = await pool.query(
      `DELETE FROM ${actualTableName} WHERE ${pkColumn} = $1 RETURNING ${pkColumn}`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    res.json({ 
      message: 'Row deleted successfully',
      deletedId: result.rows[0][pkColumn]
    });
  } catch (error) {
    console.error('Delete row error:', error);
    
    // Handle foreign key constraint violations
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Cannot delete this row because it is referenced by other records',
        details: error.message
      });
    }
    
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for undefined routes
app.use('/api', (req, res) => {
  console.log(`404: Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📊 Admin endpoints:`);
  console.log(`   GET /api/admin/database/stats`);
  console.log(`   GET /api/admin/database/tables/:tableName`);
  console.log(`   GET /api/admin/database/users/stats`);
  console.log(`   GET /api/admin/database/employees/stats`);
});

