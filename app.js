const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");

const app = express();
const port = 8000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://student:studentstudent@cluster0.9nw5aik.mongodb.net/studentdatabase?retryWrites=true&w=majority');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define student schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});
const Student = mongoose.model('Student-Register', studentSchema);

const studentScoreSchema = new mongoose.Schema({
    username: String,
    score: Number
  });
  
const StudentScore = mongoose.model('Student-Score', studentScoreSchema);

// Express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Route to handle form submission
app.post('/register', async (req, res) => {
  console.log("hi")
  const { name, email, password, confirmPassword } = req.body;

  // Check if password and confirmPassword match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Validate other fields if necessary

  try {
    // Create a new student instance
    const student = new Student({
      name,
      email,
      password,
    });

    // Save the student to the database
    await student.save();

    console.log('Form data saved:', student);
    res.status(201).json({ message: 'Form data saved' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the student with the provided email
      const student = await Student.findOne({ email });
      console.log(student)
      
      if (student == null) {
        // If student not found, return error
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the provided password matches the stored password
      if (student.password !== password) {
        // If password doesn't match, return error
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // If both email and password match, return success
      res.json({ message: 'Login successful', user: student });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
// Route to receive score data and update the database
app.post('/update-score', async (req, res) => {
    const { username, score } = req.body;
  
    try {
      // Find the corresponding student by username and update the score
      await StudentScore.findOneAndUpdate({ username }, { score }, { upsert: true });
      res.status(200).send('Score updated successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });

// Route to send email with the score
app.post('/send-email', async (req, res) => {
  const { username, score, email } = req.body;

  console.log(email)

  // Configure transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dobby525252@gmail.com', // Your Gmail email address
      pass: 'qtwf boca gmui dabj' // Your Gmail password
    }
  });

  // Email message
  const mailOptions = {
    from: 'dobby525252@gmail.com', // Sender's email address
    to: email, // Recipient's email address (retrieved from the request)
    subject: 'Quiz Result', // Subject of the email
    text: `Congratulations, ${username}!\nYour total score is: ${score}` // Email content
  };

  // Send email
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Internal server error');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Email sent successfully');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
