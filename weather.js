// Weather API Module
class WeatherAPI {
    constructor() {
        // Using OpenWeatherMap API (free tier)
        this.weatherApiKey = '8f9f097f080f44dfc067799eca04671d'; // Replace with your API key
        this.weatherBaseURL = 'https://api.openweathermap.org/data/2.5';
        
        // Using OpenTripMap API for attractions (free)
        this.attractionsBaseURL = 'https://api.opentripmap.com/0.1/en/places';
        this.attractionsApiKey = '8f9f097f080f44dfc067799eca04671d'; // Replace with your API key
    }

    async getCurrentWeather(city) {
        try {
            const response = await fetch(
                `${this.weatherBaseURL}/weather?q=${encodeURIComponent(city)}&appid=${this.weatherApiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error('City not found or API error');
            }
            
            const data = await response.json();
            
            // Transform OpenWeatherMap data to match our expected format
            return {
                location: {
                    name: data.name,
                    country: data.sys.country
                },
                current: {
                    temp_c: Math.round(data.main.temp),
                    temp_f: Math.round((data.main.temp * 9/5) + 32),
                    condition: {
                        text: data.weather[0].description,
                        icon: this.getWeatherIcon(data.weather[0].icon)
                    },
                    humidity: data.main.humidity,
                    wind_kph: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                    feelslike_c: Math.round(data.main.feels_like),
                    uv: 0, // OpenWeatherMap doesn't provide UV in free tier
                    vis_km: data.visibility / 1000, // Convert meters to km
                    last_updated: new Date(data.dt * 1000).toISOString()
                }
            };
            
        } catch (error) {
            console.error('Weather API error:', error);
            
            // Fallback to mock data if API fails
            console.log('Using fallback weather data');
            return this.generateMockWeatherData(city);
        }
    }

    async getAttractions(city) {
        try {
            // First, get coordinates for the city
            const geoResponse = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.weatherApiKey}`
            );
            
            if (!geoResponse.ok) {
                throw new Error('Could not get city coordinates');
            }
            
            const geoData = await geoResponse.json();
            
            if (!geoData || geoData.length === 0) {
                throw new Error('City not found');
            }
            
            const { lat, lon } = geoData[0];
            
            // Get attractions using OpenTripMap API
            const radius = 20000; // 20km radius
            const response = await fetch(
                `${this.attractionsBaseURL}/radius?radius=${radius}&lon=${lon}&lat=${lat}&format=json&apikey=${this.attractionsApiKey}`
            );
            
            if (!response.ok) {
                throw new Error('Could not fetch attractions');
            }
            
            const data = await response.json();
            
            // Get details for top 6 attractions
            const topAttractions = data.slice(0, 6);
            const attractionsWithDetails = [];
            
            for (const attraction of topAttractions) {
                try {
                    const details = await this.getAttractionDetails(attraction.xid);
                    if (details) {
                        attractionsWithDetails.push({
                            name: details.name || 'Local Attraction',
                            description: this.generateAttractionDescription(details),
                            rating: details.rating || Math.random() * 2 + 3 // Random rating 3-5
                        });
                    }
                } catch (error) {
                    console.log('Could not get details for attraction:', attraction.xid);
                }
            }
            
            return attractionsWithDetails;
            
        } catch (error) {
            console.error('Attractions API error:', error);
            
            // Fallback to mock attractions
            console.log('Using fallback attractions data');
            return this.generateMockAttractions(city);
        }
    }

    async getAttractionDetails(xid) {
        const response = await fetch(
            `${this.attractionsBaseURL}/xid/${xid}?apikey=${this.attractionsApiKey}`
        );
        
        if (!response.ok) {
            throw new Error('Could not fetch attraction details');
        }
        
        return await response.json();
    }

    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '⛅',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌦️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        
        return iconMap[iconCode] || '🌤️';
    }

    generateAttractionDescription(attraction) {
        if (attraction.wikipedia_extracts && attraction.wikipedia_extracts.text) {
            return attraction.wikipedia_extracts.text.substring(0, 150) + '...';
        }
        
        if (attraction.kinds) {
            const kinds = attraction.kinds.split(',');
            const mainKind = kinds[0];
            return `A ${mainKind.replace(/_/g, ' ')} in the area that's popular with visitors.`;
        }
        
        return 'A popular local attraction worth visiting during your trip.';
    }

    // Fallback methods if APIs are not available
    generateMockWeatherData(city) {
        const seed = city.toLowerCase().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Snowy', 'Windy'];
        const condition = conditions[Math.abs(seed) % conditions.length];
        
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
        
        const tempVariation = (seed % 10) - 5;
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
                humidity: 40 + (Math.abs(seed) % 40),
                wind_kph: 5 + (Math.abs(seed) % 25),
                feelslike_c: Math.round(temperature + (seed % 3) - 1),
                uv: 1 + (Math.abs(seed) % 10),
                vis_km: 5 + (Math.abs(seed) % 15),
                last_updated: new Date().toISOString()
            }
        };
    }

    generateMockAttractions(city) {
        return [
            {
                name: `${city} Historical Museum`,
                description: `Explore the rich history and culture of ${city} at this renowned museum featuring local artifacts and exhibitions.`,
                rating: 4.5
            },
            {
                name: 'Central Park',
                description: 'Beautiful green space perfect for relaxing walks, picnics, and outdoor activities with scenic views.',
                rating: 4.2
            },
            {
                name: `${city} City Theater`,
                description: `Experience local culture and performances at this historic venue showcasing ${city}'s artistic talent.`,
                rating: 4.7
            },
            {
                name: 'Old Town District',
                description: 'Wander through charming cobblestone streets lined with traditional architecture, shops, and cafes.',
                rating: 4.4
            },
            {
                name: 'Botanical Gardens',
                description: 'Stunning collection of local and exotic plants in beautifully maintained gardens with walking paths.',
                rating: 4.6
            },
            {
                name: 'Riverside Promenade',
                description: 'Picturesque walkway along the river offering beautiful views and recreational opportunities.',
                rating: 4.3
            }
        ];
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
        return icons[condition] || '🌤️';
    }
}

// Export for use in main.js
const weatherAPI = new WeatherAPI();