const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const { getStore, createRecord, updateRecord } = require('../lib/store');

function parseSort(sort = '-created_date') {
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return { field, desc };
}

// GET /api/entities/:entity - list or filter
router.get('/:entity', authMiddleware, (req, res) => {
  const store = getStore(req.params.entity);
  const { sort = '-created_date', limit = 50, ...filters } = req.query;

  let results = store.filter(item => {
    return Object.entries(filters).every(([k, v]) => {
      if (v === undefined || v === null) return true;
      return String(item[k]) === String(v);
    });
  });

  const { field, desc } = parseSort(sort);
  results.sort((a, b) => {
    if (a[field] < b[field]) return desc ? 1 : -1;
    if (a[field] > b[field]) return desc ? -1 : 1;
    return 0;
  });

  res.json(results.slice(0, parseInt(limit)));
});

// GET /api/entities/:entity/schema
router.get('/:entity/schema', (req, res) => {
  res.json({ type: 'object', properties: {} });
});

// POST /api/entities/:entity - create
router.post('/:entity', authMiddleware, (req, res) => {
  const record = createRecord(req.params.entity, req.body, { created_by: req.user.email });
  res.status(201).json(record);
});

// PUT /api/entities/:entity/:id - update
router.put('/:entity/:id', authMiddleware, (req, res) => {
  const updated = updateRecord(req.params.entity, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

// DELETE /api/entities/:entity/:id - delete
router.delete('/:entity/:id', authMiddleware, (req, res) => {
  const store = getStore(req.params.entity);
  const idx = store.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  store.splice(idx, 1);
  res.json({ ok: true });
});

module.exports = router;
