export interface AuthLoginHttpResponse {
  epoch: number;
  full_name: string;
  role: string;
  username: string;
  data: {
    token: string;
    expires_in: number;
  };
}
export interface AuthLoginHttpRequest {
  username: string;
  password: string;
}
