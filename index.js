const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});


db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'medium'
  );
`);

// POST /todos - Add a new to-do item with priority
app.post('/todos', (req, res) => {
  const { task, priority = 'medium' } = req.body;

  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  const query = `INSERT INTO todos (task, completed, priority) VALUES (?, 0, ?)`;
  db.run(query, [task, priority], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, task, completed: false, priority });
  });
});

// GET /todos - Retrieve all to-do items
app.get('/todos', (req, res) => {
  db.all('SELECT * FROM todos', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// PUT /todos/:id - Update an existing to-do item
app.put('/todos/:id', (req, res) => {
  const { task, completed, priority } = req.body;
  const id = req.params.id;

  const query = `
    UPDATE todos SET
      task = COALESCE(?, task),
      completed = COALESCE(?, completed),
      priority = COALESCE(?, priority)
    WHERE id = ?`;
  
  db.run(query, [task, completed, priority, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'To-Do item not found' });
    }
    res.json({ id, task, completed, priority });
  });
});

// DELETE /todos/:id - Delete a to-do item
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM todos WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'To-Do item not found' });
    }
    res.status(204).send();
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
