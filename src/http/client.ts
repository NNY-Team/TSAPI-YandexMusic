import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { AuthManager } from "../auth/AuthManager";

// CORS proxies for browser environment
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=", // Alternative CORS proxy
  "https://cors-anywhere.herokuapp.com/", // Traditional CORS proxy
];

export class HttpClient {
  private client: AxiosInstance;
  private authManager: AuthManager;
  private useCorsProxy: boolean;

  constructor(authManager: AuthManager, useCorsProxy: boolean = true) {
    this.authManager = authManager;
    this.useCorsProxy = useCorsProxy && typeof window !== 'undefined'; // Only use CORS proxy in browser
    
    const baseURL = this.useCorsProxy 
      ? CORS_PROXIES[0] + encodeURIComponent("https://api.music.yandex.net")
      : "https://api.music.yandex.net";

    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });

    // Добавляем интерцептор для добавления токена
    this.client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      const token = await authManager.getToken();
      if (token) {
        config.headers.Authorization = `OAuth ${token}`;
      }
      return config;
    });

    // Обработчик ошибок для переключения на другой прокси
    this.client.interceptors.response.use(
      response => response,
      async (error) => {
        if (this.useCorsProxy && error.response?.status === 503) {
          console.warn('Primary CORS proxy failed, trying alternative...');
          // Try alternative proxy on next request
          const newBaseURL = CORS_PROXIES[1] + encodeURIComponent("https://api.music.yandex.net");
          this.client.defaults.baseURL = newBaseURL;
        }
        throw error;
      }
    );
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any, params?: Record<string, any>): Promise<T> {
    const response = await this.client.post<T>(url, data, { params });
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}
