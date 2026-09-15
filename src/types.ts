// Represents weather data
export interface WeatherData {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    weather_code: number;
  };
  current_units: {
    temperature_2m: string;
  };
}

// Represents a single post returned by DummyJSON
export interface NewsPost {
  id: number;
  title: string;
  body: string;
}

// Represents news response
export interface NewsResponse {
  posts: NewsPost[];
  total: number;
  skip: number;
  limit: number;
}