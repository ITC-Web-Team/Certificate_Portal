import axios from "axios";
import { fetchSsoUserData } from "@/lib/sso";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const getUserData = (sessionKey: string) => fetchSsoUserData(sessionKey);

export default api; 