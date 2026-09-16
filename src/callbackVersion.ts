import https from "node:https";
import readline from "node:readline";
import type { WeatherData, NewsResponse } from "./types.js";

// Represents the response from the Open-Meteo Geocoding API.
interface GeocodingResponse {
    results?: {name: string; latitude: number; longitude: number; country: string;}[];
}
// Fetches data from a URL using Node.js https.
// This function demonstrates a callback-based
// approach to asynchronous programming.
function fetchData(url: string, callback: (error: Error | null, data: string | null) => void): void 
    {https.get(url, (response) => {let data = "";
            // Check for HTTP errors.
            if (response.statusCode && response.statusCode >= 400) {
                callback(new Error(`Request failed with status code ${response.statusCode}`), null);
                return;
            }
            response.on("data", (chunk: Buffer) => {data += chunk.toString();
            });
            response.on("end", () => {callback(null, data);
            });
            response.on("error", (error) => {callback(error, null);
            });
        })
        .on("error", (error) => {callback(error, null);
        });
    }
// Gets the city or place entered by the user.
function getUserLocation(callback: (error: Error | null, location: string | null) => void): void {
    const readlineInterface = readline.createInterface({input: process.stdin, output: process.stdout,});
    readlineInterface.question("Enter a city or place: ",(location) => {readlineInterface.close();
            const trimmedLocation = location.trim();
            if (!trimmedLocation) {
                callback(new Error("Please enter a city or place."), null);
                return;
            }
            callback(null, trimmedLocation);
        });
    }

// Finds latitude and longitude for the user's location.
function getCoordinates(location: string, callback: (error: Error | null,
        coordinates: {latitude: number; longitude: number; name: string; } | null) => void): void {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(location)}` + `&count=1` + `&language=en` + `&format=json`;

    fetchData(geocodingUrl, (error, data) => {
        if (error) {
            callback(error, null);
            return;
        }
        if (!data) {
            callback(new Error("No location data received."),null);
            return;
        }
        try {
            const result: GeocodingResponse = JSON.parse(data);
            if (!result.results || result.results.length === 0) {
                callback(
                    new Error(`Location "${location}" could not be found.`),null);
                return;
            }

            const place = result.results[0];
            if (!place) {
                callback(
                    new Error(`Location "${location}" could not be found.`),null);
                return;
            }

            callback(null, {latitude: place.latitude, longitude: place.longitude, name: place.name, });
        } catch (error) {
            if (error instanceof Error) {
                callback(error, null);
            } else {
                callback(
                    new Error("Could not process location data."),null);
            }
        }
    });
}

// DummyJSON posts API.
const newsUrl = "https://dummyjson.com/posts";

console.log("Starting callback version...\n");
// Ask the user for their location.
getUserLocation((locationError, location) => {
    if (locationError) {
        console.error("Location error:", locationError.message);
        return;
    }
    if (!location) {
        console.error("No location entered.");
        return;
    }

    console.log(`Finding location: ${location}...`);
    // finding the coordinates using the Geocoding API.
    getCoordinates(location, (coordinatesError, coordinates) => {
        if (coordinatesError) {
            console.error("Location error:", coordinatesError.message);
            return;
        }
        if (!coordinates) {
            console.error("No coordinates received.");
            return;
        }

        console.log(`Location found: ${coordinates.name}`);
        // Build the weather URL using the coordinates
        // returned by the Geocoding API.
        const weatherUrl = `https://api.open-meteo.com/v1/forecast` + `?latitude=${coordinates.latitude}` +
            `&longitude=${coordinates.longitude}` + `&current=temperature_2m,weather_code`;

        console.log("Fetching weather data...");
        // First asynchronous request:
        // Fetch weather using the user's location.
        fetchData(weatherUrl, (weatherError, weatherData) => {
            if (weatherError) {
                console.error("Weather error:", weatherError.message);
                return;
            }
            if (!weatherData) {
                console.error("No weather data received.");
                return;
            }
            try {
                const weather: WeatherData = JSON.parse(weatherData);
                // weather output
                console.log("\n--- CURRENT WEATHER ---");
                console.log(`Location: ${coordinates.name}`);
                console.log(`Temperature: ${weather.current.temperature_2m}°C`);
                console.log(`Weather code: ${weather.current.weather_code}`);
                console.log("\nWeather request completed.");
                console.log("Now fetching news data...");
                // Second asynchronous request is nested
                // inside the weather callback.
                // This demonstrates callback nesting.
                fetchData(newsUrl, (newsError, newsData) => {
                    if (newsError) {
                        console.error("News error:", newsError.message);
                        return;
                    }
                    if (!newsData) {
                        console.error("No news data received.");
                        return;
                    }
                    try {
                        const news: NewsResponse = JSON.parse(newsData);

                        console.log("\n--- NEWS HEADLINES ---");
                        news.posts .slice(0, 5).forEach((post) => {
                                console.log(`- ${post.title}`);
                            });

                        console.log("\nCallback version completed.");
                    } catch (error) {
                        if (error instanceof Error) {
                            console.error("Could not process news data:", error.message);
                        } else {
                            console.error("Could not process news data.");
                        }
                    }
                });
            } catch (error) {
                if (error instanceof Error) {
                    console.error("Could not process weather data:", error.message);
                } else {
                    console.error("Could not process weather data.");
                }
            }
        });

        console.log("Weather request started.");
        console.log("Waiting for asynchronous operations...");
    });
});