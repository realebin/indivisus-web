import {
  AuthLoginHttpRequest,
  AuthLoginHttpResponse,
} from '@schemas/auth-schema';

export interface AuthLoginModelResponse {
  epoch: number;
  full_name: string;
  role: string;
  username: string;
  data: {
    token: string;
    expiresIn: number;
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
    epoch: response.epoch,
    full_name: response.full_name,
    role: response.role,
    username: response.username,
    data: {
      token: response.data.token,
      expiresIn: response.data.expires_in,
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
