import type { ApiResponse } from '../types/api';

export abstract class BaseService {
  protected abstract baseUrl: string;

  protected async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${this.baseUrl}${endpoint}?${this.createQueryString(params)}`
      : `${this.baseUrl}${endpoint}`;
    const response = await fetch(url);
    return response.json();
  }

  protected async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  protected async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  protected createQueryString(params: Record<string, string | number | boolean>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    return searchParams.toString();
  }
}
