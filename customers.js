const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function toCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
  };
}

// GET all (optionally filter by query)
router.get('/', requireAuth, async (req, res) => {
  const { name = '', phone = '', city = '' } = req.query;

  // Simple search: AND across fields, like your frontend.
  // name/city are case-insensitive contains; phone is contains.
  const [rows] = await pool.query(
    `SELECT * FROM customers
     WHERE (? = '' OR LOWER(name) LIKE CONCAT('%', LOWER(?), '%'))
       AND (? = '' OR phone LIKE CONCAT('%', ?, '%'))
       AND (? = '' OR LOWER(city) LIKE CONCAT('%', LOWER(?), '%'))
     ORDER BY createdAt DESC`,
    [name, name, phone, phone, city, city]
  );

  res.json({ customers: rows.map(toCustomer) });
});

router.get('/:id', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  res.json({ customer: toCustomer(rows[0]) });
});

// Create
router.post('/', requireAuth, async (req, res) => {
  const { name, phone, email, address, city } = req.body || {};
  if (!name || !phone || !email || !address || !city) {
    return res.status(400).json({ message: 'Missing fields.' });
  }

  // generate id like CUS0001
  // Approach: get next numeric based on existing ids
  const [idRows] = await pool.query(
    `SELECT MAX(CAST(SUBSTRING(id, 4) AS UNSIGNED)) AS maxId FROM customers`
  );
  const maxId = idRows[0]?.maxId || 1000;
  const next = maxId + 1;
  const id = 'CUS' + String(next).padStart(4, '0');

  try {
    const [result] = await pool.query(
      `INSERT INTO customers (id, name, phone, email, address, city, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3))`,
      [id, name, phone, email, address, city]
    );

    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    res.status(201).json({ customer: toCustomer(rows[0]) });
  } catch (e) {
    // Unique constraint messages
    const msg = String(e && e.message ? e.message : e);
    if (msg.includes('uq_customers_phone')) {
      return res.status(409).json({ message: 'Phone number is already registered.' });
    }
    if (msg.includes('uq_customers_email')) {
      return res.status(409).json({ message: 'Email address is already registered.' });
    }
    return res.status(500).json({ message: 'Failed to insert customer.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { name, phone, email, address, city } = req.body || {};
  if (!name || !phone || !email || !address || !city) {
    return res.status(400).json({ message: 'Missing fields.' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE customers
       SET name = ?, phone = ?, email = ?, address = ?, city = ?, updatedAt = NOW(3)
       WHERE id = ?`,
      [name, phone, email, address, city, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json({ customer: toCustomer(rows[0]) });
  } catch (e) {
    const msg = String(e && e.message ? e.message : e);
    if (msg.includes('uq_customers_phone')) {
      return res.status(409).json({ message: 'Phone number is already registered.' });
    }
    if (msg.includes('uq_customers_email')) {
      return res.status(409).json({ message: 'Email address is already registered.' });
    }
    return res.status(500).json({ message: 'Failed to update customer.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
  res.json({ deleted: result.affectedRows > 0 });
});

module.exports = router;

