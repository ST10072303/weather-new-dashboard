import https from "node:https";
import type { NewsResponse, WeatherData } from "./types.js";

// Fetches data from a URL using a Promise.
// Async/await works with Promises, so we reuse the same Promise-based HTTP function.
function fetchData(url: string): Promise<string> {
    return new Promise((resolve, reject) => {https.get(url, (response) => {let data = "";
                // check for an unsuccessful HTTP status
                if (response.statusCode && response.statusCode >= 400) {
                    reject(
                        new Error(`Request failed with status code ${response.statusCode}`)
                    );
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

// Async/Await example
// This function first fetches the weather.
// After the weather request completes, it fetches the news.

async function getWeatherAndNews(): Promise<void> {
    try {
        console.log("Starting Async/Await version...");
        console.log("Fetching weather data...");

        // Wait for the weather Promise to resolve
        const weatherData = await fetchData(weatherUrl);
        const weather: WeatherData = JSON.parse(weatherData);
        // output
        console.log("\n--- CURRENT WEATHER ---");
        console.log(`Temperature: ${weather.current.temperature_2m}°C`);
        console.log(`Weather code: ${weather.current.weather_code}`);
        console.log("\nWeather request completed.");
        console.log("Now fetching news...");

        // Wait for the news Promise to resolve
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

// Promise.all() with Async/Await
// Weather and news are independent requests, so they can be started at the same time.
async function getWeatherAndNewsTogether(): Promise<void> {
    try {
        console.log("\n\n-----------------------------");
        console.log("PROMISE.ALL() WITH ASYNC/AWAIT");
        console.log("------------------------------");

        console.log("Starting weather and news requests...");

        // starting both requests at the same time.
        const [weatherData, newsData] = await Promise.all([
            fetchData(weatherUrl),
            fetchData(newsUrl),
        ]);

        const weather: WeatherData = JSON.parse(weatherData);
        const news: NewsResponse = JSON.parse(newsData);

        console.log("\n--- WEATHER DATA ---");
        console.log(`Temperature: ${weather.current.temperature_2m}°C`);
        console.log(`Weather code: ${weather.current.weather_code}`);

        console.log("\n--- NEWS HEADLINES ---");

        news.posts.slice(0, 5).forEach((post) => {
            console.log(`- ${post.title}`);
        });

        console.log("\nPromise.all() with Async/Await completed.");
   } catch (error) {
        if (error instanceof Error) {
            console.error("\nAsync/Await error:", error.message);
        } else {
            console.error("\nAsync/Await error: An unknown error occurred, try again.");
        }
    }
}

console.log("Program started.");
getWeatherAndNews();
getWeatherAndNewsTogether();
console.log("Program continues...");