const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// In-memory storage (replace with a database in production)
let users = [];
let lastUsedId = 0;

// POST API endpoint to create a new user
app.post('/api/users', (req, res) => {
  const { name, phone, nationalCode } = req.body;

  // Validate required fields
  if (!name || !phone || !nationalCode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user with same name or nationalCode already exists
  const existingUser = users.find(user => 
    user.name === name || user.nationalCode === nationalCode
  );

  if (existingUser) {
    let errorMessage = '';
    if (existingUser.name === name) {
      errorMessage = 'A user with this name already exists';
    } else {
      errorMessage = 'A user with this national code already exists';
    }
    return res.status(409).json({ error: errorMessage });
  }

  // Increment the ID
  lastUsedId++;

  // Create new user with default status "waiting"
  const newUser = {
    id: lastUsedId,
    name,
    phone,
    nationalCode,
    status: "waiting"
  };

  // Save user
  users.push(newUser);

  // Return created user
  res.status(201).json(newUser);
});

// GET API endpoint to retrieve all users
app.get('/api/users', (req, res) => {
  res.status(200).json(users);
});

// POST API endpoint to update user status to "curing"
app.post('/api/users/update-status', (req, res) => {
  const { nationalCode } = req.body;

  // Validate required field
  if (!nationalCode) {
    return res.status(400).json({ error: 'National Code is required' });
  }

  // Find user by nationalCode
  const userIndex = users.findIndex(user => user.nationalCode === nationalCode);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user status
  users[userIndex].status = "curing";

  // Return updated user
  res.status(200).json(users[userIndex]);
});


// POST API endpoint to update user status to "cured" and add treatment details
app.post('/api/users/complete-treatment', (req, res) => {
    const { nationalCode, jarahi, asabKeshi, tarmim, jermGiri, tozihat } = req.body;
  
    // Validate required fields
    if (!nationalCode) {
      return res.status(400).json({ error: 'National Code is required' });
    }
  
    // Find user by nationalCode
    const userIndex = users.findIndex(user => user.nationalCode === nationalCode);
  
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    // Update user status and add treatment details
    users[userIndex] = {
      ...users[userIndex],
      status: "cured",
      treatmentDetails: {
        jarahi: parseInt(jarahi) || 0,
        asabKeshi: parseInt(asabKeshi) || 0,
        tarmim: parseInt(tarmim) || 0,
        jermGiri: parseInt(jermGiri) || 0,
        tozihat: tozihat || ''
      }
    };
  
    // Return updated user
    res.status(200).json(users[userIndex]);
  });
  

  // POST API endpoint to update user status to "canceled" and update treatmentDetails
app.post('/api/users/cancel-treatment', (req, res) => {
  const { nationalCode, tozihat } = req.body;

  // Validate required field
  if (!nationalCode) {
    return res.status(400).json({ error: 'National Code is required' });
  }

  // Find user by nationalCode
  const userIndex = users.findIndex(user => user.nationalCode === nationalCode);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user status and treatmentDetails
  users[userIndex] = {
    ...users[userIndex],
    status: "canceled",
    treatmentDetails: {
      jarahi: 0,
      asabKeshi: 0,
      tarmim: 0,
      jermGiri: 0,
      tozihat: tozihat || ''
    }
  };

  // Return updated user
  res.status(200).json(users[userIndex]);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});