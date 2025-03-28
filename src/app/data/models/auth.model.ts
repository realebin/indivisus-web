import {
  AuthLoginHttpRequest,
  AuthLoginHttpResponse,
} from '@schemas/auth-schema';

export interface AuthLoginModelResponse {
  data: {
    token: string;
    expiresIn: number;
    full_name: string;
    role: string;
    username: string;
  };
}
export interface AuthLoginModelRequest {
  username: string;
  password: string;
}

export function transformToAuthLoginModelResponse(
  response: AuthLoginHttpResponse
): AuthLoginModelResponse {
  const result: AuthLoginModelResponse = {
    data: {
      token: response.data.token,
      expiresIn: response.data.expires_in,
      full_name: response.data.full_name,
      role: response.data.role,
      username: response.data.username,
    },
  };

  return result;
}

export function transformToAuthLoginHttpRequest(
  request: AuthLoginModelRequest
): AuthLoginHttpRequest {
  const result: AuthLoginHttpRequest = {
    password: request.password,
    username: request.username,
  };
  return result;
}
