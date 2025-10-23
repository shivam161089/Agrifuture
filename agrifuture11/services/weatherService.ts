
import type { WeatherData } from '../types';

// This is a mock weather service. In a real application, this would
// call a real weather API like OpenWeatherMap, WeatherAPI, etc.

const weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Snow'];

const getRandomCondition = () => {
    return weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
}

const generateMockWeather = (lat: number, lon: number): WeatherData => {
    const forecast = [];
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        const max_c = 25 + Math.random() * 10; // 25-35 C
        const min_c = 15 + Math.random() * 5;  // 15-20 C
        forecast.push({
            date: date.toISOString().split('T')[0],
            day: {
                maxtemp_c: parseFloat(max_c.toFixed(1)),
                maxtemp_f: parseFloat((max_c * 9/5 + 32).toFixed(1)),
                mintemp_c: parseFloat(min_c.toFixed(1)),
                mintemp_f: parseFloat((min_c * 9/5 + 32).toFixed(1)),
                condition: getRandomCondition(),
                icon: '🌤️'
            }
        });
    }

    const current_c = 28 + Math.random() * 5; // 28-33 C
    return {
        current: {
            temp_c: parseFloat(current_c.toFixed(1)),
            temp_f: parseFloat((current_c * 9/5 + 32).toFixed(1)),
            condition: getRandomCondition(),
            icon: '☀️',
        },
        location: "Pune, Maharashtra", // Mocked location name
        forecast,
    };
};

export const weatherService = {
  getWeather: async (latitude: number, longitude: number): Promise<WeatherData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // We use the lat/lon to simulate a real API call, but return mock data
        console.log(`Fetching mock weather for ${latitude}, ${longitude}`);
        resolve(generateMockWeather(latitude, longitude));
      }, 800); // Simulate network delay
    });
  },
};