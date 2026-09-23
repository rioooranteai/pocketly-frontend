import { apiClient } from "@/lib/api-client";
import type {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResponse,
} from "@/types/api";

/**
 * Auth API calls. Note: backend's AuthResponse does not include a user
 * ID — only {name, email, token}. If we need the ID later (e.g. for
 * profile features), it has to be decoded from the JWT payload or added
 * to the backend DTO.
 */
export const authApi = {
  register(data: AuthRegisterRequest) {
    return apiClient.post<AuthResponse>("/api/v1/register", data);
  },

  login(data: AuthLoginRequest) {
    return apiClient.post<AuthResponse>("/api/v1/login", data);
  },
};
