const express = require('express');
const router = express.Router();

// Do work here
router.get('/deep-route/', (req, res) => {
  res.send('Hey! It works from deep-route!');
});

router.get('/', (req, res) => {
  res.send('Hello!');
});

module.exports = router;
