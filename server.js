const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const path = require('path');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'LOGIN PAGES' directory
app.use(express.static(path.join(__dirname, 'LOGIN PAGES')));

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// In-memory user store (for simplicity; use a database in production)
const users = [];
const JWT_SECRET = 'your-secret-key'; // Replace with a strong, environment-specific secret

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World! This is the authentication server.');
});

// User registration
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store user (in-memory)
    const newUser = { id: users.length + 1, email, password: hashedPassword };
    users.push(newUser);

    console.log('User registered:', newUser);
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Forgot password (simulated)
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    // Still send a generic message to avoid revealing if an email is registered
    return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link.' });
  }

  // In a real app, generate a token and send an email.
  // For this example, we'll just log it and send a success message.
  console.log(`Password reset requested for: ${email}. In a real app, an email would be sent.`);
  res.status(200).json({ message: 'If your email is registered, you will receive a password reset link.' });
});

// Reset password (simulated, without token)
app.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }

    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return res.status(400).json({ message: 'Invalid request or user not found.' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    users[userIndex].password = hashedPassword;

    console.log(`Password for ${email} has been reset.`);
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Password incorrect
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful.', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
