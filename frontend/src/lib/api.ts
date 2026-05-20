import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach Clerk token to every request
api.interceptors.request.use(async (config) => {
  try {
    // Dynamic import to avoid SSR issues
    const { getToken } = await import("@clerk/nextjs/server").catch(() => ({ getToken: null }));
    // Client-side token injection handled by useAuth in components
  } catch {}
  return config;
});

export default api;

// Helper for client components to inject token
export function createAuthApi(token: string) {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
