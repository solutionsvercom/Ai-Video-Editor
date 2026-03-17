const { v4: uuidv4 } = require('uuid');

// In-memory store per entity (replace with DB in production)
const stores = {};

function getStore(entity) {
  if (!stores[entity]) stores[entity] = [];
  return stores[entity];
}

function createRecord(entity, data, { created_by } = {}) {
  const store = getStore(entity);
  const now = new Date().toISOString();
  const record = {
    id: uuidv4(),
    ...data,
    created_date: now,
    updated_date: now,
    ...(created_by ? { created_by } : {}),
  };
  store.push(record);
  return record;
}

function updateRecord(entity, id, patch) {
  const store = getStore(entity);
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], ...patch, updated_date: new Date().toISOString() };
  return store[idx];
}

module.exports = {
  getStore,
  createRecord,
  updateRecord,
};

