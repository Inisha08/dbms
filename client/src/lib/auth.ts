import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  studentId?: string;
  department?: string;
}

export interface AuthState {
  user: AuthUser | null;
  userType: "student" | "teacher" | null;
}

export async function login(email: string, password: string, userType: "student" | "teacher"): Promise<AuthState> {
  const response = await apiRequest("POST", "/api/auth/login", {
    email,
    password,
    userType,
  });

  const data = await response.json();
  return data;
}

export function logout() {
  localStorage.removeItem("auth");
}

export function getStoredAuth(): AuthState {
  const stored = localStorage.getItem("auth");
  if (!stored) return { user: null, userType: null };
  
  try {
    return JSON.parse(stored);
  } catch {
    return { user: null, userType: null };
  }
}

export function setStoredAuth(auth: AuthState) {
  localStorage.setItem("auth", JSON.stringify(auth));
}
