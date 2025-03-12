// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // For file uploads
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for frontend communication

// MongoDB connection
mongoose.connect('mongodb+srv://parthivsnair733:8547098121p@cluster0.isrsv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mongoose User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], required: true },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
  allowedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of doctors allowed to view patient files
});

// User Model
const User = mongoose.model('User', userSchema);

// Auth Middleware
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}

// Role-Based Middleware
function isDoctor(req, res, next) {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctor role required.' });
  }
  next();
}

function isPatient(req, res, next) {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Access denied. Patient role required.' });
  }
  next();
}

// Set up file storage using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const patientId = req.user.userId; // Assuming the patient is logged in
    const uploadPath = `uploads/patients/${patientId}`;
    fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Routes

// Register a new user
app.post('/register', async (req, res) => {
  const { username, password, role, email } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword, role, email });
    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Login a user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, 'your-secret-key', {
      expiresIn: '1h',
    });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Doctor Dashboard: View patient details
app.get('/doctor/patients', authMiddleware, isDoctor, async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
    console.log(err)
  }
});

// Doctor: View patient files
app.get('/doctor/patient-files/:patientId', authMiddleware, isDoctor, async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await User.findById(patientId).populate('allowedDoctors');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.allowedDoctors.some(doc => doc._id.equals(req.user.userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch files from the file system or database
    const files = fs.readdirSync(`uploads/patients/${patientId}`);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Patient Dashboard: Upload files
app.post('/patient/upload', authMiddleware, isPatient, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Save file information to the database (optional)
  // const file = new File({ patient: req.user.userId, filename: req.file.filename });
  // await file.save();

  res.json({ message: 'File uploaded successfully', file: req.file });
});

// Profile: Fetch user details
app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Grant permission to a doctor
app.post('/patient/grant-permission', authMiddleware, isPatient, async (req, res) => {
  const { doctorUsername } = req.body;

  try {
    const doctor = await User.findOne({ username: doctorUsername, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await User.findByIdAndUpdate(req.user.userId, { $addToSet: { allowedDoctors: doctor._id } });
    res.json({ message: 'Permission granted to doctor' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke permission from a doctor
app.post('/patient/revoke-permission', authMiddleware, isPatient, async (req, res) => {
  const { doctorUsername } = req.body;

  try {
    const doctor = await User.findOne({ username: doctorUsername, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await User.findByIdAndUpdate(req.user.userId, { $pull: { allowedDoctors: doctor._id } });
    res.json({ message: 'Permission revoked from doctor' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});