const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());

// Route to handle geocode requests
app.get('/api/geocode', async (req, res) => {
  const location = req.query.location;
  const apiKey = process.env.GEOCODE_API_KEY;

  if (!location) {
    return res.status(400).json({ error: 'Location query parameter is required' });
  }

  try {
    const response = await axios.get(`https://geocode.maps.co/search`, {
      params: {
        q: location,
        api_key: apiKey,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch geocode data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
