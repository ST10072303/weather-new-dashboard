import https from "node:https";
import readline from "node:readline";
import type { WeatherData, NewsResponse } from "./types.js";

// Represents the response from the Open-Meteo Geocoding API.
interface GeocodingResponse {
  results?: {name: string; latitude: number; longitude: number; country: string;}[];
}

// Fetches data from a URL and returns a Promise.
// The Promise resolves when the complete response is received.
// The Promise rejects if an HTTP or network error occurs.
function fetchData(url: string): Promise<string> {
  return new Promise((resolve, reject) => {https.get(url, (response) => {let data = "";

        // Check if the server returned an HTTP error status.
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`Request failed with status code ${response.statusCode}`));
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
    input: process.stdin,output: process.stdout,});

  return new Promise((resolve) => {
    readlineInterface.question("Enter a city or place: ",(location) => {
        readlineInterface.close();
        resolve(location.trim());
      });
  });
}

// Converts the user's city/place into latitude and longitude.
function getCoordinates(location: string): Promise<{latitude: number; longitude: number; name: string;}> {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(location)}` + `&count=1` + `&language=en` + `&format=json`;

    return fetchData(geocodingUrl).then((data) => {
    const result: GeocodingResponse = JSON.parse(data);

    // Check whether the location was found.
    if (!result.results || result.results.length === 0) {
      throw new Error(`Location "${location}" could not be found.`);
    }

    const place = result.results[0];
    // Required because noUncheckedIndexedAccess is enabled.
    if (!place) {
      throw new Error(`Location "${location}" could not be found.`);
    }

    return {latitude: place.latitude, longitude: place.longitude, name: place.name,};
  });
}

// DummyJSON posts API.
const newsUrl = "https://dummyjson.com/posts";
// Main Promise example.
function runPromiseVersion(): void {
  console.log("Starting Promise version...\n");

  // Ask the user for their location.
  getUserLocation() .then((location) => {
      if (!location) {
        throw new Error("Please enter a city or place.");
      }
      console.log(`Finding location: ${location}...`);
      // Find the coordinates for the user's location.
      return getCoordinates(location);
    })
    .then((coordinates) => {
      console.log(`Location found: ${coordinates.name}`);
      console.log("Fetching weather data...");

      // Build the weather URL using the coordinates
      // returned by the Geocoding API.
      const weatherUrl = `https://api.open-meteo.com/v1/forecast` + `?latitude=${coordinates.latitude}` +
        `&longitude=${coordinates.longitude}` + `&current=temperature_2m,weather_code`;

      // Store the information needed by the next Promise.
      return {coordinates,weatherUrl,};
    })
    .then(({ coordinates, weatherUrl }) => {
      console.log("Weather request started.");
      console.log("Process continues...");

      // PROMISE CHAIN
      // First fetch the weather.
      // Once the weather Promise resolves, fetch the news.
      fetchData(weatherUrl).then((weatherData) => {
          const weather: WeatherData = JSON.parse(weatherData);

          console.log("\n--- CURRENT WEATHER ---");
          console.log(`Location: ${coordinates.name}`);
          console.log(`Temperature: ${weather.current.temperature_2m}°C`);
          console.log(`Weather code: ${weather.current.weather_code}`);
          console.log("\nWeather request completed.");
          console.log("Now fetching news...");

          // Return another Promise to continue the chain.
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
          console.error("\nPromise chain error:", error.message);
        });

      // PROMISE.ALL()
      // Weather and news do not depend on each other,
      // so both requests can start at the same time.
      console.log("\n\n--------------------------");
      console.log("PROMISE.ALL() EXAMPLE");
      console.log("------------------------------");
      console.log("Starting weather and news requests...");

      Promise.all([fetchData(weatherUrl), fetchData(newsUrl),])
        .then(([weatherData, newsData]) => {
          const weather: WeatherData = JSON.parse(weatherData);
          const news: NewsResponse = JSON.parse(newsData);

          console.log("\n--- WEATHER ---");
          console.log(`Location: ${coordinates.name}`);
          console.log(`Temperature: ${weather.current.temperature_2m}°C`);
          console.log(`Weather code: ${weather.current.weather_code}`);

          console.log("\n--- NEWS HEADLINES ---");
          news.posts.slice(0, 5).forEach((post) => {
            console.log(`- ${post.title}`);
          });
          console.log("\nPromise.all() completed.");
        })
        .catch((error: Error) => {
          console.error("\nPromise.all() error:",error.message);
        });

      // PROMISE.RACE()
      // Both requests start at the same time.
      // The first Promise to settle wins the race.
      console.log("\n\n----------------------");
      console.log("PROMISE.RACE() EXAMPLE");
      console.log("--------------------------");
      console.log("Starting weather and news race...");

      const weatherRace = fetchData(weatherUrl).then((data) => {
        const weather: WeatherData = JSON.parse(data);

        return {source: "Weather", result: `Temperature: ${weather.current.temperature_2m}°C`,};
      });

      const newsRace = fetchData(newsUrl).then((data) => {
        const news: NewsResponse = JSON.parse(data);

        return {source: "News", result: `First headline: ${news.posts[0]?.title}`};
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
    })
    .catch((error: Error) => {
      console.error("\nPromise version error:", error.message);
    });
}

// Start the program.
runPromiseVersion();