export interface User {
  id: number;
  login: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}