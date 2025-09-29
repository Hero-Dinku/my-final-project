// Weather API Module
class WeatherAPI {
    constructor() {
        // Using a free weather API - you can replace with your preferred API
        this.baseURL = 'https://api.weatherapi.com/v1';
        // Note: In a real application, this would be stored securely
        // For now, we'll use a demo approach with error handling
    }

    async getCurrentWeather(city) {
        try {
            // Simulate API call - replace with actual API integration
            // For demo purposes, we'll simulate weather data
            await this.simulateAPICall();
            
            // Generate realistic weather data based on city
            return this.generateMockWeatherData(city);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw new Error('Unable to fetch weather data. Please try again.');
        }
    }

    simulateAPICall() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000 + Math.random() * 1000);
        });
    }

    generateMockWeatherData(city) {
        // Generate consistent but varied weather data based on city name
        const seed = city.toLowerCase().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Snowy', 'Windy'];
        const condition = conditions[Math.abs(seed) % conditions.length];
        
        // Generate temperatures based on condition and seed
        let baseTemp;
        switch(condition) {
            case 'Sunny': baseTemp = 25; break;
            case 'Cloudy': baseTemp = 18; break;
            case 'Partly Cloudy': baseTemp = 22; break;
            case 'Rainy': baseTemp = 15; break;
            case 'Snowy': baseTemp = -2; break;
            case 'Windy': baseTemp = 20; break;
            default: baseTemp = 20;
        }
        
        const tempVariation = (seed % 10) - 5; // -5 to +5 variation
        const temperature = baseTemp + tempVariation;

        return {
            location: {
                name: city,
                country: 'Country'
            },
            current: {
                temp_c: Math.round(temperature),
                temp_f: Math.round((temperature * 9/5) + 32),
                condition: {
                    text: condition,
                    icon: this.getConditionIcon(condition)
                },
                humidity: 40 + (Math.abs(seed) % 40), // 40-80%
                wind_kph: 5 + (Math.abs(seed) % 25), // 5-30 km/h
                feelslike_c: Math.round(temperature + (seed % 3) - 1),
                uv: 1 + (Math.abs(seed) % 10), // 1-10
                vis_km: 5 + (Math.abs(seed) % 15), // 5-20 km
                last_updated: new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            }
        };
    }

    getConditionIcon(condition) {
        const icons = {
            'Sunny': '☀️',
            'Cloudy': '☁️',
            'Partly Cloudy': '⛅',
            'Rainy': '🌧️',
            'Snowy': '❄️',
            'Windy': '💨'
        };
        return icons[condition] || '🌈';
    }
}

// Export for use in main.js
const weatherAPI = new WeatherAPI();