import https from "node:https";
import type { WeatherData, NewsResponse } from "./types.js";


// Fetches data from a URL and returns a Promise.
// The Promise resolves when the complete response has been received.
// The Promise rejects if an HTTP/network error occurs.
function fetchData(url: string): Promise<string> {
    return new Promise((resolve, reject) => {https.get(url, (response) => {let data = "";

            // Receive response data in chunks
            response.on("data", (chunk: Buffer) => {data += chunk.toString();
            });

            // The complete response has been received
            response.on("end", () => {resolve(data);
            });
        })
        .on("error", (error) => {reject(error);
        });
    });
}

// Limpopo coordinates
const latitude = -23.4013;
const longitude = 29.4179;

// Open-Meteo weather API
const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,weather_code`;

// DummyJSON news API
const newsUrl = "https://dummyjson.com/posts";

console.log("Starting Promise version...\n");
console.log("Fetching weather data...");

// PROMISE CHAIN
// First fetch the weather.
// Once the weather Promise resolves, fetch the news.
fetchData(weatherUrl)
    .then((weatherData) => {
        const weather: WeatherData = JSON.parse(weatherData);

        console.log("\n--- CURRENT WEATHER ---");
        console.log(`Temperature: ${weather.current.temperature_2m}°C`);
        console.log(`Weather code: ${weather.current.weather_code}`);
        console.log("\nWeather request completed.");
        console.log("Now fetching news...");

        // Return another Promise.
        // continue the chain.
        return fetchData(newsUrl);
    })
    .then((newsData) => {
        const news: NewsResponse = JSON.parse(newsData);

        console.log("\n--- NEWS HEADLINES ---");
        news.posts.slice(0, 5).forEach((post) => {
            console.log(`- ${post.title}`);
        });

        console.log("\nPromise chain completed.");
    })
    .catch((error: Error) => {
        console.error("\nError:", error.message);
    });

console.log("Weather request started.");
console.log("Process continues...");