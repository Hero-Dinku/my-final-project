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
    const favoritesResult = document.getElementById('favorites-result');
    const favoritesData = document.getElementById('favorites-data');

    // Event Listeners
    searchForm.addEventListener('submit', handleSearch);

    // Initialize favorites when page loads
    initFavorites();

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
            
            // Show attractions placeholder
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
            <div class="weather-header">
                <h3>${location.name}, ${location.country}</h3>
                <button class="add-favorite" onclick="addFavorite(${JSON.stringify(weather).replace(/"/g, '&quot;')})">
                    ⭐ Add to Favorites
                </button>
            </div>
            <div class="weather-items">
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
            </div>
        `;
        
        weatherResult.classList.remove('hidden');
    }

    function displayAttractionsPlaceholder(city) {
        attractionsData.innerHTML = `
            <div class="attraction-card">
                <h3>🏛️ Historical Museum</h3>
                <p>Explore the rich history of ${city} at this renowned museum.</p>
                <div class="attraction-rating">⭐ 4.5/5</div>
            </div>
            <div class="attraction-card">
                <h3>🌳 Central Park</h3>
                <p>Beautiful green space perfect for relaxing and outdoor activities.</p>
                <div class="attraction-rating">⭐ 4.2/5</div>
            </div>
            <div class="attraction-card">
                <h3>🎭 City Theater</h3>
                <p>Experience local culture and performances at this historic venue.</p>
                <div class="attraction-rating">⭐ 4.7/5</div>
            </div>
            <div class="placeholder">
                <p><strong>Coming in Week 7:</strong> Real attractions data from Google Places API!</p>
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

// Favorites Functions (make them global)
function initFavorites() {
    loadFavorites();
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    
    if (favorites.length === 0) {
        favoritesData.innerHTML = '<p class="placeholder">No favorite cities yet. Search for a city and click the star to add it!</p>';
        favoritesResult.classList.add('hidden');
        return;
    }
    
    favoritesData.innerHTML = favorites.map(fav => `
        <div class="favorite-item">
            <div class="favorite-info">
                <div class="favorite-name">${fav.city}</div>
                <div class="favorite-temp">${fav.temperature}°C - ${fav.condition}</div>
            </div>
            <button class="remove-favorite" onclick="removeFavorite('${fav.city}')">×</button>
        </div>
    `).join('');
    
    favoritesResult.classList.remove('hidden');
}

function addFavorite(weatherData) {
    const favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    const { location, current } = weatherData;
    
    // Check if already in favorites
    if (favorites.find(fav => fav.city === location.name)) {
        alert('This city is already in your favorites!');
        return;
    }
    
    const favorite = {
        city: location.name,
        temperature: current.temp_c,
        condition: current.condition.text,
        icon: current.condition.icon,
        timestamp: new Date().toISOString()
    };
    
    favorites.push(favorite);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    loadFavorites();
    alert('City added to favorites!');
}

function removeFavorite(cityName) {
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    favorites = favorites.filter(fav => fav.city !== cityName);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    loadFavorites();
}