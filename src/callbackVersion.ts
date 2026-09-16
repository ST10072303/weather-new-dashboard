import https from "node:https";
import type { WeatherData, NewsResponse } from "./types.js";

// fetches data from a URL using Node.js https.
// function demonstrates a callback-based
// approach to asynchronous programming.
function fetchData(url: string, callback: (error: Error | null, data: string | null) => void
): void {https.get(url, (response) => {let data = "";
            // Check for HTTP errors
            if (response.statusCode && response.statusCode >= 400) {
                callback(
                    new Error(`Request failed with status code ${response.statusCode}`),null);
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

// Limpopo coordinates
const latitude = -23.4013;
const longitude = 29.4179;

// Open-Meteo weather API
const weatherUrl = `https://api.open-meteo.com/v1/forecast` + `?latitude=${latitude}` +
    `&longitude=${longitude}` + `&current=temperature_2m,weather_code`;

// DummyJSON posts API
const newsUrl = "https://dummyjson.com/posts";

console.log("Starting callback version...\n");
console.log("Fetching weather data...");

// first asynchronous request
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
        // output
        console.log("\n--- CURRENT WEATHER ---");
        console.log(`Temperature: ${weather.current.temperature_2m}°C`);
        console.log(`Weather code: ${weather.current.weather_code}`);
        console.log("\nWeather request completed.");
        console.log("Now fetching news data...");
        // Second asynchronous request is nested inside the weather callback.
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

                news.posts.slice(0, 5).forEach((post) => {
                    console.log(`- ${post.title}`);
                });

                console.log("\nCallback version completed.");
            } catch (error) {
                console.error("Could not process news data:", error);
            }
        });
    } catch (error) {
        console.error("Could not process weather data:", error);
    }
});

console.log("Weather request started.");
console.log("Waiting for asynchronous operations...");