const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  const { name, age, gender, location, interests, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, age, gender, location, interests, email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');
    const token = jwt.sign({ id: user._id }, 'secretkey');
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get highlight data
exports.getHighlight = async (req, res) => {
  try {
    const highlights = await User.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } },
    ]);
    res.status(200).json(highlights);
  } catch (err) {
    res.status(500).send(err.message);
  }
};