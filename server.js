const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'User Management API'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./server.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// In-memory storage (replace with a database in production)
let users = [];
let lastUsedId = 0;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - nationalCode
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         nationalCode:
 *           type: string
 *           description: The national code of the user
 *         status:
 *           type: string
 *           description: The status of the user
 *         treatmentDetails:
 *           type: object
 *           properties:
 *             jarahi:
 *               type: integer
 *             asabKeshi:
 *               type: integer
 *             tarmim:
 *               type: integer
 *             jermGiri:
 *               type: integer
 *             tozihat:
 *               type: string
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - nationalCode
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               nationalCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: The user was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: All fields are required
 *       409:
 *         description: A user with this name or national code already exists
 */

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

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

app.get('/api/users', (req, res) => {
  res.status(200).json(users);
});

/**
 * @swagger
 * /api/users/update-status:
 *   post:
 *     summary: Update user status to "curing"
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nationalCode
 *             properties:
 *               nationalCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user status was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: National Code is required
 *       404:
 *         description: User not found
 */

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

/**
 * @swagger
 * /api/users/complete-treatment:
 *   post:
 *     summary: Update user status to "cured" and add treatment details
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nationalCode
 *             properties:
 *               nationalCode:
 *                 type: string
 *               jarahi:
 *                 type: integer
 *               asabKeshi:
 *                 type: integer
 *               tarmim:
 *                 type: integer
 *               jermGiri:
 *                 type: integer
 *               tozihat:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user status and treatment details were updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: National Code is required
 *       404:
 *         description: User not found
 */

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

/**
 * @swagger
 * /api/users/cancel-treatment:
 *   post:
 *     summary: Update user status to "canceled" and update treatmentDetails
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nationalCode
 *             properties:
 *               nationalCode:
 *                 type: string
 *               tozihat:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user status and treatment details were updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: National Code is required
 *       404:
 *         description: User not found
 */

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