export interface Page {
  _id: string;
  title: string;
  path: string;
  content: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Component {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ErrorResponse {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
