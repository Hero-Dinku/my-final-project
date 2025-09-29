// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const weatherResult = document.getElementById('weather-result');
    const weatherData = document.getElementById('weather-data');
    const attractionsResult = document.getElementById('attractions-result');
    const attractionsData = document.getElementById('attractions-data');
    const errorMessage = document.getElementById('error-message');

    // Event Listeners
    searchForm.addEventListener('submit', handleSearch);

    async function handleSearch(event) {
        event.preventDefault();
        
        const city = cityInput.value.trim();
        
        if (!city) {
            showError('Please enter a city name');
            return;
        }

        // UI State: Loading
        setLoadingState(true);
        hideAllSections();

        try {
            // Fetch weather data
            const weather = await weatherAPI.getCurrentWeather(city);
            displayWeatherData(weather);
            
            // For Week 5, we'll show a placeholder for attractions
            displayAttractionsPlaceholder(city);
            
        } catch (error) {
            console.error('Search error:', error);
            showError(error.message || 'An error occurred while searching. Please try again.');
        } finally {
            setLoadingState(false);
        }
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            searchBtn.disabled = true;
            searchBtn.querySelector('span').textContent = 'Searching...';
            loadingSpinner.classList.add('show');
        } else {
            searchBtn.disabled = false;
            searchBtn.querySelector('span').textContent = 'Search';
            loadingSpinner.classList.remove('show');
        }
    }

    function hideAllSections() {
        weatherResult.classList.add('hidden');
        attractionsResult.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }

    function displayWeatherData(weather) {
        const { location, current } = weather;
        
        weatherData.innerHTML = `
            <div class="weather-item">
                <div class="weather-label">Temperature</div>
                <div class="weather-value">${current.temp_c}°C</div>
                <div class="weather-label">${current.temp_f}°F</div>
            </div>
            <div class="weather-item">
                <div class="weather-label">Condition</div>
                <div class="weather-value">${current.condition.icon}</div>
                <div class="weather-label">${current.condition.text}</div>
            </div>
            <div class="weather-item">
                <div class="weather-label">Humidity</div>
                <div class="weather-value">${current.humidity}%</div>
                <div class="weather-label">Moisture Level</div>
            </div>
            <div class="weather-item">
                <div class="weather-label">Wind Speed</div>
                <div class="weather-value">${current.wind_kph} km/h</div>
                <div class="weather-label">Breeze Intensity</div>
            </div>
            <div class="weather-item">
                <div class="weather-label">Feels Like</div>
                <div class="weather-value">${current.feelslike_c}°C</div>
                <div class="weather-label">Real Feel</div>
            </div>
            <div class="weather-item">
                <div class="weather-label">UV Index</div>
                <div class="weather-value">${current.uv}</div>
                <div class="weather-label">Sun Protection</div>
            </div>
            <div class="weather-item">
                <div class="weather-label">Visibility</div>
                <div class="weather-value">${current.vis_km} km</div>
                <div class="weather-label">View Distance</div>
            </div>
            <div class="weather-item">
                <div class="weather-label">Last Updated</div>
                <div class="weather-value">${current.last_updated}</div>
                <div class="weather-label">Latest Data</div>
            </div>
        `;
        
        weatherResult.classList.remove('hidden');
    }

    function displayAttractionsPlaceholder(city) {
        attractionsData.innerHTML = `
            <div class="placeholder">
                <h3>🎯 Attractions Feature Coming Soon!</h3>
                <p>We're working hard to bring you amazing attractions in ${city}.</p>
                <p><strong>Next Week:</strong> Real attractions data will be integrated using Google Places API.</p>
            </div>
        `;
        attractionsResult.classList.remove('hidden');
    }

    function showError(message) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
    }

    // Focus on input when page loads
    cityInput.focus();
});