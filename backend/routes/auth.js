const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In-memory user store (replace with a real database in production)
const users = [];

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Register
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    email,
    full_name: full_name || email.split('@')[0],
    password: hashed,
    role: users.length === 0 ? 'admin' : 'user',
    created_date: new Date().toISOString(),
    settings: {}
  };
  users.push(user);

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

// Update current user
router.put('/me', authMiddleware, (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const { password, email, id, role, ...updatable } = req.body;
  users[idx] = { ...users[idx], ...updatable, updated_date: new Date().toISOString() };
  const { password: _, ...safe } = users[idx];
  res.json(safe);
});

// Invite user
router.post('/invite', authMiddleware, async (req, res) => {
  const { email, role = 'user' } = req.body;
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const tempPassword = uuidv4().split('-')[0];
  const hashed = await bcrypt.hash(tempPassword, 10);
  const user = {
    id: uuidv4(),
    email,
    full_name: email.split('@')[0],
    password: hashed,
    role,
    created_date: new Date().toISOString(),
    settings: {}
  };
  users.push(user);
  res.json({ message: 'User invited', tempPassword });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
