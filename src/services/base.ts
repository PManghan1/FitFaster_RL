import type { ApiResponse, ApiError, ResponseMetadata } from '../types/api';

export abstract class BaseService {
  protected async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        const error: ApiError = {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'An unknown error occurred',
          status: response.status,
          details: data.details,
        };
        return { data: null, error };
      }

      return {
        data,
        error: null,
        metadata: this.createResponseMetadata(response),
      };
    } catch (error) {
      return {
        data: null,
        error: this.createError('PARSE_ERROR', 'Failed to parse response', error),
      };
    }
  }

  protected createQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  protected createError(code: string, message: string, details?: unknown): ApiError {
    return {
      code,
      message,
      status: 500,
      details: details ? { error: details } : undefined,
    };
  }

  protected createResponseMetadata(response: Response): ResponseMetadata {
    return {
      timestamp: new Date().toISOString(),
      requestId: response.headers.get('x-request-id') || crypto.randomUUID(),
      processingTime: Number(response.headers.get('x-processing-time')) || undefined,
    };
  }

  protected handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return this.createError('REQUEST_FAILED', error.message, {
        stack: error.stack,
      });
    }
    return this.createError('UNKNOWN_ERROR', 'An unknown error occurred', error);
  }
}
