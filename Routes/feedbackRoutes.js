const express = require('express');
const router = express.Router();
const Feedback = require('../Models/Feedback');

// @route   POST /api/feedback
// @desc    Submit new feedback
router.post('/', async (req, res) => {
  try {
    const { name, rating, text } = req.body;
    
    if (!name || !rating || !text) {
      return res.status(400).json({ message: 'Please provide all fields.' });
    }

    const newFeedback = new Feedback({
      name,
      rating,
      text
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback sorted by newest
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
