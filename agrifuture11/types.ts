export interface PlantHealthAnalysis {
  plant_name: string;
  health_status: string;
  issue_identified: string;
  issue_description: string;
  organic_solutions: string[];
  non_organic_solutions: string[];
  preventive_measures: string[];
}

export interface HistoryItemBase {
  id: number;
  timestamp: string;
  language: string;
}

export interface HistoryItemAnalysis extends HistoryItemBase {
  type: 'analysis';
  data: PlantHealthAnalysis;
  imageThumbnail: string;
}

export interface HistoryItemInfo extends HistoryItemBase {
  type: 'info';
  topic: string;
  data: string;
}

export interface HistoryItemQA extends HistoryItemBase {
  type: 'qa';
  question: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface HistoryItemChat extends HistoryItemBase {
  type: 'chat';
  messages: ChatMessage[];
}

export type HistoryItem = HistoryItemAnalysis | HistoryItemInfo | HistoryItemQA | HistoryItemChat;

export interface CropRecommendation {
    crop_name: string;
    sowing_time: string;
    harvesting_time: string;
    key_tips: string[];
    market_demand: string;
    water_requirement: string;
    soil_suitability: string;
}

export interface CropCalendarResponse {
    summary: string;
    recommendations: CropRecommendation[];
}

// New types for Auth, Weather, Settings
export interface User {
    uid: string;
    name: string;
    email: string;
    avatarUrl: string;
}

export interface WeatherData {
    current: {
        temp_c: number;
        temp_f: number;
        condition: string;
        icon: string;
    };
    location: string;
    forecast: ForecastDay[];
}

export interface ForecastDay {
    date: string;
    day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        condition: string;
        icon: string;
    };
}

export interface Settings {
    temperatureUnit: 'C' | 'F';
}