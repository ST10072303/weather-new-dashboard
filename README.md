# Weather and News Async Project

## Project Overview

This project is a Node.js and TypeScript console application that demonstrates asynchronous programming and the JavaScript event loop.

The application allows a user to enter a city name and retrieves:

- Current weather information
- News headlines

The project demonstrates three different approaches to asynchronous programming:

1. Callback functions
2. Promises
3. Async/Await

It also demonstrates `Promise.all()` and `Promise.race()`.

---

## Project Objectives

The main objectives of this project are to:

- Demonstrate how asynchronous programming works in Node.js.
- Demonstrate the JavaScript event loop and non-blocking operations.
- Implement asynchronous requests using callbacks.
- Implement asynchronous requests using Promises.
- Implement asynchronous requests using Async/Await.
- Demonstrate nested callbacks and callback hell.
- Use `Promise.all()` to execute independent requests concurrently.
- Use `Promise.race()` to determine which request completes first.
- Implement error handling for network and HTTP errors.
- Allow the user to enter a city or place instead of using hardcoded coordinates.
- Retrieve weather data and news data from external APIs.

---

## Technologies Used

- Node.js
- TypeScript
- Node.js `https` module
- Node.js `readline` module
- Open-Meteo Weather API
- Open-Meteo Geocoding API
- DummyJSON Posts API

---

## APIs Used

### Open-Meteo Weather API

The Open-Meteo API is used to retrieve current weather information.
The application retrieves:

- Temperature
- Weather code
- Latitude
- Longitude

No API key is required.

### Open-Meteo Geocoding API

The Open-Meteo Geocoding API converts the city or place entered by the user into geographic coordinates.
The application follows this process:

```text
User enters a city/place
        ↓
Geocoding API
        ↓
Latitude + Longitude
        ↓
Weather API
        ↓
Current weather
``` 

## Installation

1. Clone the project
git clone <repository-url>
2. Open the project folder
cd weather-news-dashboard
3. Install dependencies
npm install

### Running the Project

The project contains separate commands for each asynchronous programming approach.

#### Callback Version

Run: npm run callback

The application asks the user to enter a city name.

Example:

Starting callback version...

Enter a city or place: Polokwane
Finding location: Polokwane...
Location found: Polokwane
Fetching weather data...

The weather request is completed before the news request starts.

#### Promise Version

Run: npm run promise

This version demonstrates:

- Promise chaining
- Promise.all()
- Promise.race()

#### Async/Await Version

Run: npm run async

This version demonstrates the use of:

- async
- await
- try...catch

