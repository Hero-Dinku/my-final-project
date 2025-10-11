// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Weather & Travel Planner initialized');
    
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
    const lastUpdated = document.getElementById('last-updated');

    // Application State
    let currentWeatherData = null;
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Event Listeners
    searchForm.addEventListener('submit', handleSearch);
    
    // NEW: Input validation event
    cityInput.addEventListener('input', handleInputValidation);
    
    // NEW: Keyboard events
    cityInput.addEventListener('keydown', handleKeyboardEvents);
    
    // NEW: Window focus event
    window.addEventListener('focus', handleWindowFocus);
    
    // NEW: Click events for attraction cards
    attractionsData.addEventListener('click', handleAttractionClick);
    
    // NEW: Resize event for responsive adjustments
    window.addEventListener('resize', handleWindowResize);
    
    // NEW: Beforeunload event for cleanup
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initialize application
    initApplication();

    function initApplication() {
        console.log('📱 Initializing application...');
        updateLastUpdated();
        initFavorites();
        loadSearchHistory();
        cityInput.focus();
        
        // NEW: Add theme toggle button
        createThemeToggle();
    }

    function updateLastUpdated() {
        const now = new Date();
        lastUpdated.textContent = `Last updated: ${now.toLocaleString()}`;
    }

    function handleInputValidation(event) {
        const input = event.target;
        const value = input.value.trim();
        
        if (value.length > 2) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else if (value.length > 0) {
            input.classList.add('invalid');
            input.classList.remove('valid');
        } else {
            input.classList.remove('valid', 'invalid');
        }
    }

    function handleKeyboardEvents(event) {
        // NEW: Enter key to submit
        if (event.key === 'Enter' && cityInput.value.trim()) {
            handleSearch(event);
        }
        
        // NEW: Escape key to clear
        if (event.key === 'Escape') {
            cityInput.value = '';
            cityInput.classList.remove('valid', 'invalid');
        }
    }

    function handleWindowFocus() {
        console.log('🎯 Window focused - checking for updates');
        updateLastUpdated();
    }

    function handleAttractionClick(event) {
        const attractionCard = event.target.closest('.attraction-card');
        if (attractionCard) {
            // NEW: Add click animation
            attractionCard.style.transform = 'scale(0.95) rotate(-1deg)';
            setTimeout(() => {
                attractionCard.style.transform = '';
            }, 200);
            
            const attractionName = attractionCard.querySelector('h3').textContent;
            console.log(`📍 Attraction clicked: ${attractionName}`);
            
            // NEW: Track attraction clicks
            trackAttractionClick(attractionName);
        }
    }

    function handleWindowResize() {
        console.log('📐 Window resized:', window.innerWidth, 'x', window.innerHeight);
        
        // NEW: Adjust layout based on screen size
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile-layout', isMobile);
    }

    function handleBeforeUnload(event) {
        // NEW: Save application state
        console.log('💾 Saving application state before unload...');
        localStorage.setItem('lastSearch', cityInput.value.trim());
    }

    function trackAttractionClick(attractionName) {
        const analytics = JSON.parse(localStorage.getItem('attractionAnalytics')) || {};
        analytics[attractionName] = (analytics[attractionName] || 0) + 1;
        localStorage.setItem('attractionAnalytics', JSON.stringify(analytics));
    }

    async function handleSearch(event) {
        event.preventDefault();
        console.log('🔍 Handling search...');
        
        const city = cityInput.value.trim();
        
        if (!city) {
            showError('Please enter a city name');
            cityInput.focus();
            return;
        }

        // UI State: Loading
        setLoadingState(true);
        hideAllSections();

        try {
            // NEW: Add to search history
            addToSearchHistory(city);
            
            // Fetch weather data
            console.log(`🌤️ Fetching weather for: ${city}`);
            const weather = await weatherAPI.getCurrentWeather(city);
            currentWeatherData = weather;
            
            displayWeatherData(weather);
            
            // Fetch attractions data
            console.log(`🏛️ Fetching attractions for: ${city}`);
            await fetchAttractions(city);
            
            // NEW: Track successful search
            trackSearchSuccess(city);
            
        } catch (error) {
            console.error('❌ Search error:', error);
            showError(error.message || 'An error occurred while searching. Please try again.');
            
            // NEW: Track failed search
            trackSearchError(city, error.message);
        } finally {
            setLoadingState(false);
        }
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            searchBtn.disabled = true;
            searchBtn.querySelector('span').textContent = 'Searching...';
            loadingSpinner.classList.add('show');
            document.body.style.cursor = 'wait';
        } else {
            searchBtn.disabled = false;
            searchBtn.querySelector('span').textContent = 'Search';
            loadingSpinner.classList.remove('show');
            document.body.style.cursor = 'default';
        }
    }

    function hideAllSections() {
        weatherResult.classList.add('hidden');
        attractionsResult.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }

    function displayWeatherData(weather) {
        console.log('📊 Displaying weather data:', weather);
        const { location, current } = weather;
        
        weatherData.innerHTML = `
            <div class="weather-header">
                <h3>${location.name}, ${location.country}</h3>
                <button class="add-favorite" onclick="addFavorite(${JSON.stringify(weather).replace(/"/g, '&quot;')})" id="favorite-btn">
                    ⭐ Add to Favorites
                </button>
            </div>
            <div class="weather-items">
                <div class="weather-item" data-metric="temperature">
                    <div class="weather-label">Temperature</div>
                    <div class="weather-value">${current.temp_c}°C</div>
                    <div class="weather-label">${current.temp_f}°F</div>
                </div>
                <div class="weather-item" data-metric="condition">
                    <div class="weather-label">Condition</div>
                    <div class="weather-value">${current.condition.text}</div>
                    <div class="weather-label">${current.condition.icon}</div>
                </div>
                <div class="weather-item" data-metric="humidity">
                    <div class="weather-label">Humidity</div>
                    <div class="weather-value">${current.humidity}%</div>
                    <div class="weather-label">Moisture Level</div>
                </div>
                <div class="weather-item" data-metric="wind">
                    <div class="weather-label">Wind Speed</div>
                    <div class="weather-value">${current.wind_kph} km/h</div>
                    <div class="weather-label">Breeze Intensity</div>
                </div>
                <div class="weather-item" data-metric="feels-like">
                    <div class="weather-label">Feels Like</div>
                    <div class="weather-value">${current.feelslike_c}°C</div>
                    <div class="weather-label">Real Feel</div>
                </div>
                <div class="weather-item" data-metric="uv">
                    <div class="weather-label">UV Index</div>
                    <div class="weather-value">${current.uv}</div>
                    <div class="weather-label">Sun Protection</div>
                </div>
                <div class="weather-item" data-metric="visibility">
                    <div class="weather-label">Visibility</div>
                    <div class="weather-value">${current.vis_km} km</div>
                    <div class="weather-label">View Distance</div>
                </div>
                <div class="weather-item" data-metric="updated">
                    <div class="weather-label">Last Updated</div>
                    <div class="weather-value">${new Date(current.last_updated).toLocaleTimeString()}</div>
                    <div class="weather-label">Latest Data</div>
                </div>
            </div>
        `;
        
        weatherResult.classList.remove('hidden');
        weatherResult.classList.add('fade-in');
        
        // NEW: Add animation to weather items
        animateWeatherItems();
    }

    function animateWeatherItems() {
        const weatherItems = document.querySelectorAll('.weather-item');
        weatherItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('fade-in');
        });
    }

    async function fetchAttractions(city) {
        try {
            const attractions = await weatherAPI.getAttractions(city);
            displayAttractionsData(attractions, city);
        } catch (error) {
            console.error('❌ Error fetching attractions:', error);
            displayAttractionsPlaceholder(city);
        }
    }

    function displayAttractionsData(attractions, city) {
        if (!attractions || attractions.length === 0) {
            displayAttractionsPlaceholder(city);
            return;
        }

        console.log(`🏛️ Displaying ${attractions.length} attractions for ${city}`);
        
        attractionsData.innerHTML = attractions.map((attraction, index) => `
            <div class="attraction-card" data-index="${index}">
                <h3>${attraction.name}</h3>
                <p>${attraction.description || 'A wonderful place to visit in ' + city}</p>
                ${attraction.rating ? `
                    <div class="attraction-rating">
                        ⭐ ${attraction.rating.toFixed(1)}/5
                        <small>(${Math.floor(Math.random() * 1000) + 100} reviews)</small>
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        attractionsResult.classList.remove('hidden');
        attractionsResult.classList.add('fade-in');
    }

    function displayAttractionsPlaceholder(city) {
        console.log('🔄 Using placeholder attractions data');
        
        attractionsData.innerHTML = `
            <div class="attraction-card">
                <h3>🏛️ Historical Museum</h3>
                <p>Explore the rich history of ${city} at this renowned museum featuring local artifacts and cultural exhibitions.</p>
                <div class="attraction-rating">⭐ 4.5/5 <small>(842 reviews)</small></div>
            </div>
            <div class="attraction-card">
                <h3>🌳 Central Park</h3>
                <p>Beautiful green space perfect for relaxing walks, picnics, and outdoor activities with scenic views and recreational facilities.</p>
                <div class="attraction-rating">⭐ 4.2/5 <small>(567 reviews)</small></div>
            </div>
            <div class="attraction-card">
                <h3>🎭 City Theater</h3>
                <p>Experience local culture and performances at this historic venue showcasing ${city}'s artistic talent and theatrical productions.</p>
                <div class="attraction-rating">⭐ 4.7/5 <small>(321 reviews)</small></div>
            </div>
            <div class="placeholder">
                <p><strong>Note:</strong> Using enhanced placeholder attractions data for demonstration</p>
            </div>
        `;
        attractionsResult.classList.remove('hidden');
    }

    function showError(message) {
        console.error('❌ Displaying error:', message);
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('fade-in');
        
        // NEW: Auto-hide error after 5 seconds
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    function addToSearchHistory(city) {
        const searchEntry = {
            city: city,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        
        searchHistory.unshift(searchEntry);
        searchHistory = searchHistory.slice(0, 10); // Keep last 10 searches
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        
        console.log('📝 Search history updated:', searchHistory.length, 'entries');
    }

    function loadSearchHistory() {
        console.log('📖 Loaded search history:', searchHistory.length, 'entries');
        
        // NEW: Pre-fill last search if available
        const lastSearch = localStorage.getItem('lastSearch');
        if (lastSearch) {
            cityInput.value = lastSearch;
            cityInput.dispatchEvent(new Event('input'));
        }
    }

    function trackSearchSuccess(city) {
        const analytics = JSON.parse(localStorage.getItem('searchAnalytics')) || { success: 0, failures: 0 };
        analytics.success = (analytics.success || 0) + 1;
        analytics.lastSuccess = new Date().toISOString();
        localStorage.setItem('searchAnalytics', JSON.stringify(analytics));
    }

    function trackSearchError(city, error) {
        const analytics = JSON.parse(localStorage.getItem('searchAnalytics')) || { success: 0, failures: 0 };
        analytics.failures = (analytics.failures || 0) + 1;
        analytics.lastError = { city, error, timestamp: new Date().toISOString() };
        localStorage.setItem('searchAnalytics', JSON.stringify(analytics));
    }

    function createThemeToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.innerHTML = '🌓';
        toggleBtn.title = 'Toggle dark mode';
        toggleBtn.addEventListener('click', toggleTheme);
        
        document.body.appendChild(toggleBtn);
        
        // NEW: Load saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            toggleBtn.innerHTML = '☀️';
        }
    }

    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        const toggleBtn = document.querySelector('.theme-toggle');
        
        toggleBtn.innerHTML = isDark ? '☀️' : '🌓';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        console.log(`🎨 Theme changed to: ${isDark ? 'dark' : 'light'}`);
    }

    // NEW: Export functions for global access
    window.handleSearch = handleSearch;
    window.addFavorite = addFavorite;
    window.removeFavorite = removeFavorite;
});

// Global Favorites Functions
function initFavorites() {
    loadFavorites();
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    const favoritesData = document.getElementById('favorites-data');
    const favoritesResult = document.getElementById('favorites-result');
    
    if (favorites.length === 0) {
        favoritesData.innerHTML = '<p class="placeholder">No favorite cities yet. Search for a city and click the star to add it!</p>';
        favoritesResult.classList.add('hidden');
        return;
    }
    
    console.log('⭐ Loading favorites:', favorites.length, 'cities');
    
    favoritesData.innerHTML = favorites.map(fav => `
        <div class="favorite-item" data-city="${fav.city}">
            <div class="favorite-info">
                <div class="favorite-name">${fav.city}${fav.country ? ', ' + fav.country : ''}</div>
                <div class="favorite-temp">
                    ${fav.temperature}°C - ${fav.condition} 
                    ${fav.humidity ? `· 💧 ${fav.humidity}%` : ''}
                    ${fav.windSpeed ? `· 💨 ${fav.windSpeed} km/h` : ''}
                </div>
            </div>
            <button class="remove-favorite" onclick="removeFavorite('${fav.city}')" title="Remove from favorites">×</button>
        </div>
    `).join('');
    
    favoritesResult.classList.remove('hidden');
    favoritesResult.classList.add('fade-in');
}

function addFavorite(weatherData) {
    const favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    const { location, current } = weatherData;
    
    // Check if already in favorites
    if (favorites.find(fav => fav.city === location.name)) {
        showNotification('This city is already in your favorites!', 'warning');
        return;
    }
    
    const favorite = {
        city: location.name,
        country: location.country,
        temperature: current.temp_c,
        condition: current.condition.text,
        icon: current.condition.icon,
        humidity: current.humidity,
        windSpeed: current.wind_kph,
        feelsLike: current.feelslike_c,
        visibility: current.vis_km,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    favorites.push(favorite);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    
    // NEW: Update favorite button state
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.textContent = '✅ Added to Favorites';
        favoriteBtn.classList.add('added');
        favoriteBtn.disabled = true;
    }
    
    loadFavorites();
    showNotification('City added to favorites!', 'success');
    
    console.log('⭐ Favorite added:', favorite.city);
}

function removeFavorite(cityName) {
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    const initialLength = favorites.length;
    
    favorites = favorites.filter(fav => fav.city !== cityName);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    
    loadFavorites();
    showNotification('City removed from favorites', 'info');
    
    console.log('🗑️ Favorite removed:', cityName, '(was', initialLength, 'now', favorites.length, ')');
}

// NEW: Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add basic notification styles
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 300px;
            }
            .notification-success { background: var(--success-green); }
            .notification-warning { background: var(--accent-orange); }
            .notification-info { background: var(--primary-blue); }
            .notification-error { background: var(--error-red); }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// NEW: Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFavorites);
} else {
    initFavorites();
}