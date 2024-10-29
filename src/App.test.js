import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import App from "./App";

jest.mock("axios");

describe("Weather App", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  test("renders the component with the main elements", () => {
    render(<App />);
    expect(screen.getByText(/Weather App/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter location/i)).toBeInTheDocument();
    expect(screen.getByText(/Search/i)).toBeInTheDocument();
    expect(screen.getByText(/Reset/i)).toBeInTheDocument();
  });

  test("API key missing error pops up if key is undefined", () => {
    const { container } = render(<App />);
    expect(console.error).toHaveBeenCalledWith("API key is missing.");
    expect(container.textContent).toBe("");
  });

  test("fetches location and weather data successfully", async () => {
    axios.get
      .mockResolvedValueOnce({ data: [{ lat: 52.52, lon: 13.41 }] })
      .mockResolvedValueOnce({
        data: {
          current: {
            temperature_2m: 15,
            apparent_temperature: 14,
            rain: 0,
            cloud_cover: 50,
            wind_speed_10m: 10,
            wind_direction_10m: 180,
            wind_gusts_10m: 15,
          },
        },
      });
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/Enter location/i), {
      target: { value: "Berlin" },
    });
    fireEvent.click(screen.getByText(/Search/i));


    expect(screen.getByText(/Temperature: 15°C/i)).toBeInTheDocument();
    expect(screen.getByText(/Apparent Temperature: 14°C/i)).toBeInTheDocument();
    expect(screen.getByText(/Wind: 10 mph/i)).toBeInTheDocument();
    expect(screen.getByText(/Wind Direction: 180/i)).toBeInTheDocument();
    expect(screen.getByText(/Gusts: 15 mph/i)).toBeInTheDocument();
    expect(screen.getByText(/Rain: 0 mm/i)).toBeInTheDocument();
    expect(screen.getByText(/Cloud Cover: 50%/i)).toBeInTheDocument();
  });

  test("displays error when location data fetch fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch location data"));

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/Enter location/i), {
      target: { value: "Unknown" },
    });
    fireEvent.click(screen.getByText(/Search/i));

    expect(screen.getByText(/Failed to fetch location data./i)).toBeInTheDocument();
  });

  test("displays error when weather data fetch fails", async () => {
    axios.get
      .mockResolvedValueOnce({ data: [{ lat: 52.52, lon: 13.41 }] }) // Mock geocode response
      .mockRejectedValueOnce(new Error("Failed to fetch weather data")); // Mock weather error

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/Enter location/i), {
      target: { value: "Berlin" },
    });
    fireEvent.click(screen.getByText(/Search/i));

    expect(screen.getByText(/Failed to fetch weather data./i)).toBeInTheDocument();
  });

  test("reset button clears location and weather data", () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/Enter location/i), {
      target: { value: "Berlin" },
    });
    fireEvent.click(screen.getByText(/Search/i));
    fireEvent.click(screen.getByText(/Reset/i));

    expect(screen.getByPlaceholderText(/Enter location/i).value).toBe("");
    expect(screen.queryByText(/Weather in Berlin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Temperature:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Failed to fetch location data./i)).not.toBeInTheDocument();
  });
});
