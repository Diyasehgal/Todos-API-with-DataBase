const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Sample data to simulate initial to-do list items
let todos = [
  { id: 1, task: "Learn Node.js", completed: false, priority: "medium" },
  { id: 2, task: "Build a REST API", completed: false, priority: "medium" }
];

// Helper function to find a to-do by ID
const findTodoById = (id) => todos.find(todo => todo.id === id);

// GET /todos - Retrieves all to-do items, with optional completed status filter
app.get('/todos', (req, res) => {
  const { completed } = req.query;
  
  // Filters todos based on completed status if specified in the query parameter
  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    return res.json(todos.filter(todo => todo.completed === isCompleted));
  }
  
  res.json(todos); // Return all todos if no filter is provided
});

// POST /todos - Adds a new to-do item with a priority field
app.post('/todos', (req, res) => {
  const { task, priority = "medium" } = req.body;
  if (!task) {
    return res.status(400).send("Task is required");
  }
  const newTodo = {
    id: todos.length + 1,
    task,
    completed: false,
    priority
  };

  todos.push(newTodo);
  res.status(201).json(newTodo); // Respond with the created to-do item
});

// PUT /todos/complete-all - Marks all to-do items as completed
app.put('/todos/complete-all', (req, res) => {
  todos = todos.map(todo => ({ ...todo, completed: true }));
  res.json({ message: "All to-do items marked as completed", todos });
});

// PUT /todos/:id - Updates an existing to-do item by its ID
app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = findTodoById(parseInt(id));
  
  if (!todo) {
    return res.status(404).send("To-Do item not found");
  }
  
  // Destructure and update task, completed status, and priority
  const { task, completed, priority } = req.body;
  if (task) todo.task = task;
  if (completed !== undefined) todo.completed = completed;
  if (priority) todo.priority = priority;

  res.json(todo);
});

// DELETE /todos/:id - Deletes a to-do item by its ID
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(todo => todo.id === parseInt(id));

  if (index === -1) {
    return res.status(404).send("To-Do item not found");
  }

  todos.splice(index, 1);
  res.status(204).send(); // No content response after deletion
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
