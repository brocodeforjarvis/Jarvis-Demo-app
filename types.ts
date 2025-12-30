
export enum View {
  DASHBOARD = 'dashboard',
  VOICE = 'voice',
  WEATHER = 'weather',
  CAMERA = 'camera',
  IMAGE_GEN = 'image_gen',
  PROJECTS = 'projects',
  SETTINGS = 'settings'
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}
