import https from "node:https";
import readline from "node:readline";
import type { NewsResponse, WeatherData } from "./types.js";

// Represents the response from the Open-Meteo Geocoding API.
interface GeocodingResponse {
    results?: {name: string; latitude: number; longitude: number; country: string;}[];
}

// Fetches data from a URL using a Promise.
// Async/await works with Promises, so we reuse this HTTP function.
function fetchData(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {let data = "";

                // Check for an unsuccessful HTTP status.
                if (response.statusCode && response.statusCode >= 400) {
                    reject(
                        new Error(`Request failed with status code ${response.statusCode}`));
                    return;
                }
                response.on("data", (chunk: Buffer) => {data += chunk.toString();
                });
                response.on("end", () => {resolve(data);
                });
                response.on("error", (error) => {reject(error);
                });
            })
            .on("error", (error) => {reject(error);
            });
    });
}

// Gets the city or place entered by the user.
function getUserLocation(): Promise<string> {
    const readlineInterface = readline.createInterface({
        input: process.stdin, output: process.stdout,});

    return new Promise((resolve) => {
        readlineInterface.question("Enter a city or place: ", (location) => {
                readlineInterface.close();
                resolve(location.trim());
            }
        );
    });
}

// Converts the city/place name into latitude and longitude
// using the Open-Meteo Geocoding API.
async function getCoordinates(location: string): Promise<{ latitude: number; longitude: number; name: string }> {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(location)}` + `&count=1` + `&language=en` + `&format=json`;
    const data = await fetchData(geocodingUrl);
    const result: GeocodingResponse = JSON.parse(data);

    // Check whether the location was found.
    if (!result.results || result.results.length === 0) {
    throw new Error(`Location "${location}" could not be found.`);
}

    const place = result.results[0];

    if (!place) {
        throw new Error(`Location "${location}" could not be found.`);
    }
    return {latitude: place.latitude, longitude: place.longitude, name: place.name,};
}

// DummyJSON news API.
const newsUrl = "https://dummyjson.com/posts";

// Async/Await example.
// The program gets the user's location first,
// then fetches weather and news.
async function getWeatherAndNews(): Promise<void> {
    try {
        console.log("Starting Async/Await version...");
        // Ask the user for a city or place.
        const location = await getUserLocation();

        if (!location) {
            throw new Error("Please enter a city or place.");
        }

        // Convert the location into coordinates.
        console.log(`Finding location: ${location}...`);
        const coordinates = await getCoordinates(location);
        console.log(`Location found: ${coordinates.name}`);

        // Build the weather URL using the coordinates returned
        // by the geocoding API.
        const weatherUrl = `https://api.open-meteo.com/v1/forecast` + `?latitude=${coordinates.latitude}` +
            `&longitude=${coordinates.longitude}` + `&current=temperature_2m,weather_code`;
        console.log("Fetching weather data...");

        // Wait for the weather Promise to resolve.
        const weatherData = await fetchData(weatherUrl);
        const weather: WeatherData = JSON.parse(weatherData);

        console.log("\n--- CURRENT WEATHER ---");
        console.log(`Location: ${coordinates.name}`);
        console.log(`Temperature: ${weather.current.temperature_2m}°C`);
        console.log(`Weather code: ${weather.current.weather_code}`);
        console.log("\nWeather request completed.");
        console.log("Now fetching news...");

        // Wait for the news Promise to resolve.
        const newsData = await fetchData(newsUrl);
        const news: NewsResponse = JSON.parse(newsData);

        console.log("\n--- NEWS HEADLINES ---");
        news.posts.slice(0, 5).forEach((post) => {
            console.log(`- ${post.title}`);
        });

        console.log("\nAsync/Await version completed.");
        } catch (error) {
        if (error instanceof Error) {
            console.error("\nAsync/Await error:", error.message);
        } else {
            console.error("\nAsync/Await error: An unknown error occurred, try again.");
        }
    }
}

// Promise.all() with Async/Await.
// Weather and news are independent requests,
// so they can be started at the same time.
async function getWeatherAndNewsTogether(): Promise<void> {
    try {
        console.log("\n\n-----------------------------");
        console.log("PROMISE.ALL() WITH ASYNC/AWAIT");
        console.log("------------------------------");

        // Ask the user for a city or place.
        const location = await getUserLocation();
        if (!location) {
            throw new Error("Please enter a city or place.");
        }

        // Find the coordinates for the user's location.
        console.log(`Finding location: ${location}...`);
        const coordinates = await getCoordinates(location);
        console.log(`Location found: ${coordinates.name}`);

        // Build the weather URL using the user's location.
        const weatherUrl = `https://api.open-meteo.com/v1/forecast` + `?latitude=${coordinates.latitude}` +
            `&longitude=${coordinates.longitude}` + `&current=temperature_2m,weather_code`;

        console.log("Starting weather and news requests...");
 
        // Start both requests at the same time.
        const [weatherData, newsData] = await Promise.all([
            fetchData(weatherUrl), fetchData(newsUrl)
        ]);

        const weather: WeatherData = JSON.parse(weatherData);
        const news: NewsResponse = JSON.parse(newsData);

        console.log("\n--- WEATHER DATA ---");
        console.log(`Location: ${coordinates.name}`);
        console.log(`Temperature: ${weather.current.temperature_2m}°C`);
        console.log(`Weather code: ${weather.current.weather_code}`);

        console.log("\n--- NEWS HEADLINES ---");
        news.posts.slice(0, 5).forEach((post) => {
            console.log(`- ${post.title}`);
        });

        console.log("\nPromise.all() with Async/Await completed.");
    } catch (error) {
        if (error instanceof Error) {
            console.error("\nPromise.all() error:", error.message);
        } else {
            console.error("\nPromise.all() error: An unknown error occurred, try again.");
        }
    }
}

// Start the program.
console.log("Program started.");
getWeatherAndNews();
console.log("Program continues...");