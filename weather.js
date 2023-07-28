
const inputBox = document.querySelector('.input-box');
const searchBtn = document.getElementById('searchBtn');
const weather_icon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.getElementById('humidity');
const wind_speed = document.getElementById('wind-speed');
const location_not_found = document.querySelector('.location-not-found');
const weather_body = document.querySelector('.weather-body');
const datetime = document.querySelector('.datetime');
const cityElement = document.querySelector('.city');
const minMaxTempElement = document.querySelector('.min-max-temp');
const saveLocationBtn = document.querySelector('.save-location-btn');
const savedLocationsContainer = document.querySelector('.saved-locations-container');


let isCelsius = true;

// Country codes mapping to full names
const countryNames = {
  US: 'United States',
  JP: 'Japan',
  GB: 'United Kingdom',
  AU: 'Australia',
  FR: 'France',
  // Add other country codes and their full names here if needed
};

async function checkWeather(city) {
  const api_key = 'ead4e595c3d2d693afa6a16cbe034e1f';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;

  try {
    const response = await fetch(url);
    const weather_data = await response.json();

    if (weather_data.cod === '404') {
      location_not_found.style.display = 'flex';
      weather_body.style.display = 'none';
      return;
    }

    location_not_found.style.display = 'none';
    weather_body.style.display = 'flex';

    const tempInCelsius = Math.round(weather_data.main.temp - 273.15);
    const tempInFahrenheit = Math.round((tempInCelsius * 9 / 5) + 32);

    if (isCelsius) {
      temperature.innerHTML = `${tempInCelsius} <sup>°C</sup>`;
    } else {
      temperature.innerHTML = `${tempInFahrenheit} <sup>°F</sup>`;
    }

    const minTempInCelsius = Math.round(weather_data.main.temp_min - 273.15);
    const maxTempInCelsius = Math.round(weather_data.main.temp_max - 273.15);

    const minTemp = isCelsius
      ? `${minTempInCelsius}°C`
      : `${(minTempInCelsius * 9 / 5) + 32}°F`;

    const maxTemp = isCelsius
      ? `${maxTempInCelsius}°C`
      : `${(maxTempInCelsius * 9 / 5) + 32}°F`;

    const minMaxTempText = `Min: ${minTemp} | Max: ${maxTemp}`;
    minMaxTempElement.textContent = minMaxTempText;

    description.innerHTML = `${weather_data.weather[0].description}`;
    humidity.innerHTML = `${weather_data.main.humidity}%`;
    wind_speed.innerHTML = `${weather_data.wind.speed} Km/H`;

    
    const cityAndCountry = `${weather_data.name}, ${getCountryName(weather_data.sys.country)}`;
    cityElement.innerHTML = cityAndCountry;

    datetime.innerHTML = `${new Date().toLocaleString()}`;

    switch (weather_data.weather[0].main) {
      case 'Clouds':
        weather_icon.className = 'fas fa-cloud';
        break;
      case 'Clear':
        weather_icon.className = 'fas fa-sun';
        break;
      case 'Rain':
        weather_icon.className = 'fas fa-cloud-rain';
        break;
      case 'Mist':
        weather_icon.className = 'fas fa-smog';
        break;
      case 'Snow':
        weather_icon.className = 'fas fa-snowflake';
        break;
      default:
        weather_icon.className = 'fas fa-cloud';
    }

    console.log(weather_data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    location_not_found.style.display = 'flex';
    weather_body.style.display = 'none';
  }
}

function getCountryName(countryCode) {
  return countryNames[countryCode] || countryCode;
}

// Function to save the current location under humidity and wind speed sections
function saveCurrentLocation() {
  const currentLocation = cityElement.textContent;

  if (currentLocation) {
    let savedLocations = localStorage.getItem('weatherAppSavedLocations');
    savedLocations = savedLocations ? JSON.parse(savedLocations) : [];

    if (!savedLocations.includes(currentLocation)) {
      savedLocations.push(currentLocation);
      localStorage.setItem('weatherAppSavedLocations', JSON.stringify(savedLocations));
      displaySavedLocations(); // Update the displayed saved locations
    }
  }
}

// Function to remove a location from the saved locations list
function removeLocation(location) {
  let savedLocations = localStorage.getItem('weatherAppSavedLocations');
  savedLocations = savedLocations ? JSON.parse(savedLocations) : [];

  const updatedLocations = savedLocations.filter(item => item !== location);
  localStorage.setItem('weatherAppSavedLocations', JSON.stringify(updatedLocations));
  displaySavedLocations(); // Update the displayed saved locations
}

// Function to fetch weather data for a saved location
function fetchWeatherForSavedLocation(location) {
  checkWeather(location);
}


// Function to display saved locations
function displaySavedLocations() {
  const savedLocations = JSON.parse(localStorage.getItem('weatherAppSavedLocations'));

  // Clear the existing container
  savedLocationsContainer.innerHTML = '';

  if (savedLocations && savedLocations.length > 0) {
    savedLocations.forEach(location => {
      const locationContainer = document.createElement('div');
      locationContainer.classList.add('saved-location-container');

      // Create a clickable span element for the saved location
      const locationName = document.createElement('span');
      locationName.textContent = location;
      locationName.style.cursor = 'pointer'; // Set cursor to pointer to indicate it's clickable
      locationName.addEventListener('click', () => {
        fetchWeatherForSavedLocation(location); // Fetch weather data for the clicked saved location
      });



      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        removeLocation(location);
      });

      locationContainer.appendChild(locationName);
      locationContainer.appendChild(removeBtn);

      savedLocationsContainer.appendChild(locationContainer);
    });
  }
}

// Event listeners

searchBtn.addEventListener('click', () => {
  checkWeather(inputBox.value);
});

temperature.addEventListener('click', () => {
  isCelsius = !isCelsius;
  checkWeather(inputBox.value);
});

saveLocationBtn.addEventListener('click', saveCurrentLocation);

// Display saved locations on page load
displaySavedLocations();
