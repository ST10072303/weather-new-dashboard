import https from "node:https";
import type { WeatherData, NewsResponse } from "./types.js";


// Fetches data from a URL and returns a Promise.
// The Promise resolves when the complete response has been received.
// The Promise rejects if an HTTP/network error occurs.
function fetchData(url: string): Promise<string> {return new Promise((resolve, reject) => {
    https.get(url, (response) => {let data = "";
        // Check if the server returned an error status
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
// Limpopo coordinates
const latitude = -23.4013;
const longitude = 29.4179;

// Open-Meteo weather API
const weatherUrl = `https://api.open-meteo.com/v1/forecast` + `?latitude=${latitude}` +
  `&longitude=${longitude}` + `&current=temperature_2m,weather_code`;

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
    // output
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
// PROMISE.ALL()
// Weather and news do not depend on each other, so we can start both requests at the same time.
console.log("\n\n--------------------------");
console.log("PROMISE.ALL() EXAMPLE");
console.log("------------------------------");

console.log("Starting weather and news requests...");
Promise.all([fetchData(weatherUrl), fetchData(newsUrl),])
  .then(([weatherData, newsData]) => {
    const weather: WeatherData = JSON.parse(weatherData);
    const news: NewsResponse = JSON.parse(newsData);
    // output
    console.log("\n--- WEATHER ---");
    console.log(`Temperature: ${weather.current.temperature_2m}°C`);
    console.log(`Weather code: ${weather.current.weather_code}`);
    console.log("\n--- NEWS HEADLINES ---");

    news.posts.slice(0, 5).forEach((post) => {
      console.log(`- ${post.title}`);
    });
    console.log("\nPromise.all() completed.");
  })
  .catch((error: Error) => {
    console.error("\nPromise.all() error:", error.message);
  });

// PROMISE.RACE()
// Both requests start at the same time.
// The first Promise to resolve or reject wins the race.
console.log("\n\n----------------------");
console.log("PROMISE.RACE() EXAMPLE");
console.log("--------------------------");
console.log("Starting weather and news race...");

const weatherRace = fetchData(weatherUrl).then((data) => {
  const weather: WeatherData = JSON.parse(data);
  return { source: "Weather", result: `Temperature: ${weather.current.temperature_2m}°C` };
});

const newsRace = fetchData(newsUrl).then((data) => {
  const news: NewsResponse = JSON.parse(data);
  return {
    source: "News",
    result: `First headline: ${news.posts[0]?.title}`,
  };
});

Promise.race([weatherRace, newsRace])
  .then((winner) => {
    console.log("\n--- RACE WINNER ---");
    console.log(`Winner: ${winner.source}`);
    console.log(winner.result);
    console.log("\nPromise.race() completed.");
  })
  .catch((error: Error) => {
    console.error("\nPromise.race() error:", error.message);
  });