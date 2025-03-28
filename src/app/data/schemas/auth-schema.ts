export interface AuthLoginHttpResponse {

  data: {
    token: string;
    expires_in: number;
    epoch: number;
    full_name: string;
    role: string;
    username: string;
  };
}
export interface AuthLoginHttpRequest {
  username: string;
  password: string;
}
