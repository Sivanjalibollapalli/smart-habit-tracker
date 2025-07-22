export async function getWeather(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather');
  const data = await res.json();
  // Return main weather description (e.g., 'Clear', 'Clouds', 'Rain')
  return data.weather[0].main;
} 