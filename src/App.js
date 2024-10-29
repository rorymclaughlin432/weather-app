import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  if (!process.env.REACT_APP_GEOCODE_API_KEY) {
    console.error("API key is missing.");
    return;
  }

  const getWeatherData = async (lat, lon) => {
    const current = [
      'temperature_2m',
      'apparent_temperature',
      'rain',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(',');
    try {
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude: lat,
            longitude: lon,
            current: current
          },
        }
      );
      console.log(weatherResponse);

      setWeatherData(weatherResponse.data.current);
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data.");
      console.error(err);
    }
  };

  const getLatitudeAndLongitude = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/geocode`, {
        params: { location },
      });

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        getWeatherData(lat, lon);
      } else {
        setError("Location not found.");
      }
    } catch (err) {
      setError("Failed to fetch location data.");
      console.error(err);
    }
  };

  const resetButton = () => {
    setLocation("");
    setError(null);
    setWeatherData(null);
  };

  const searchButton = (e) => {
    e.preventDefault();
    if (location) {
      getLatitudeAndLongitude();
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Weather App</h1>
      <form onSubmit={searchButton}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
          required
        />
        <button type="submit">Search</button>
        <button onClick={resetButton}>Reset</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {weatherData && (
        <div>
          <h2>Weather in {location}</h2>
          <p>Temperature: {weatherData.temperature_2m}°C</p>
          <p>Apparent Temperature: {weatherData.apparent_temperature}°C</p>
          <p>Wind: {weatherData.wind_speed_10m} mph</p>
          <p>Wind Direction: {weatherData.wind_direction_10m}</p>
          <p>Gusts: {weatherData.wind_gusts_10m} mph</p>
          <p>Rain: {weatherData.rain} mm</p>
          <p>Cloud Cover: {weatherData.cloud_cover}%</p>
        </div>
      )}
    </div>
  );
};

export default App;
