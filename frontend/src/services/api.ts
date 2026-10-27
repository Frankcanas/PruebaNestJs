const API_BASE_URL = 'http://localhost:3000';

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  customHeaders: Record<string, string> = {},
): Promise<T> {
  const token = localStorage.getItem('fleetcore_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const result = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        (Array.isArray(result?.message) ? result.message.join(', ') : null) ||
        result?.error ||
        `Error ${response.status}: ${response.statusText}`;

      throw new ApiError(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        response.status,
        result,
      );
    }

    // Unpack NestJS standard ResponseTransformInterceptor { data: ... }
    if (result && typeof result === 'object' && 'data' in result && 'timestamp' in result) {
      return result.data as T;
    }

    return result as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Error de conexión con el servidor',
      0,
    );
  }
}
