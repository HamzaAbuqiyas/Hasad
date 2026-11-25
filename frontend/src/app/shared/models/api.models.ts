// Types for what the Hassad API sends and receives.
// They match the C# DTOs in Hassad.Application (camelCase JSON).

export interface MessageResponse {
  message: string;
}

// ---------- Auth ----------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export type UserRole = 'User' | 'Admin';
export type AccountStatus = 'Active' | 'Blocked';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isProfileCompleted: boolean;
  totalPredictions: number;
}

export interface LoginResponse {
  message: string;
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

// ---------- Profile ----------
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string | null;
  location: string | null;
  farmSize: number | null;
  crops: string[];
  joinDate: string;
  accountStatus: AccountStatus;
  isProfileCompleted: boolean;
  totalPredictions: number;
}

export interface UpdateProfileRequest {
  phone: string;
  location: string;
  farmSize: number;
  crops: string[];
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

// ---------- Admin ----------
export interface AdminSummary {
  totalUsers: number;
  totalAdmins: number;
  activeUsers: number;
  blockedUsers: number;
  totalPredictions: number;
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  farmSize: number | null;
  crops: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  joinDate: string;
  isProfileCompleted: boolean;
  totalPredictions: number;
}

export interface AdminPrediction {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  crop: string;
  targetYear: number;
  season: string;
  predictedProduction: number | null;
  quality: string | null;
  priceTrend: string | null;
  createdAt: string;
}

// ---------- Predictions ----------
export interface PredictionRequest {
  crop: string;
  targetYear: number;
  season: string;
}

export interface Prediction {
  id: number;
  userId: number;
  crop: string;
  targetYear: number;
  season: string;
  predictedProduction: number | null;
  quality: string | null;
  priceTrend: string | null;
  createdAt: string;
}

// ---------- Hasad AI ----------
export interface HasadAiPayload {
  crop: string;
  targetYear: number;
  season: string;
  predictedProduction: number | null;
  quality: string;
  priceTrend: string;
  chartDataSummary?: string;
}

export interface HasadAiQuestion extends HasadAiPayload {
  question: string;
}

export interface HasadAiExplanation {
  title: string;
  summary: string;
  resultExplanation: string;
  chartExplanation: string;
  recommendation: string;
  riskNote: string;
  confidenceNote: string;
}

export interface HasadAiAnswer {
  answer: string;
}

// ---------- Weather ----------
export interface CurrentWeather {
  time: string | null;
  temperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  condition: string;
}

export interface DailyForecast {
  date: string | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  precipitation: number | null;
  weatherCode: number | null;
  condition: string;
}

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  dailyForecast: DailyForecast[];
}
