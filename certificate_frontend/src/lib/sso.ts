import axios, { AxiosError } from "axios";

const DEFAULT_SSO_ORIGIN = "https://sso.tech-iitb.org";

function ssoOrigin(): string {
  const raw = import.meta.env.VITE_SSO_AUTH_URL || DEFAULT_SSO_ORIGIN;
  return String(raw).replace(/\/$/, "");
}

export function getSsoProjectId(): string {
  const id = import.meta.env.VITE_SSO_PROJECT_ID;
  if (!id || String(id).trim() === "") {
    throw new Error("VITE_SSO_PROJECT_ID is not set");
  }
  return String(id).trim();
}

export function getSsoLoginUrl(): string {
  return `${ssoOrigin()}/project/${getSsoProjectId()}/ssocall/`;
}

export async function fetchSsoUserData(sessionKey: string) {
  const { data } = await axios.post<{ name?: string; roll?: string }>(
    `${ssoOrigin()}/project/getuserdata`,
    { id: sessionKey },
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
}

export function ssoErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ detail?: string; message?: string }>;
    const status = ax.response?.status;
    if (status === 400) return "Invalid or missing session. Try signing in again.";
    if (status === 403) return "Session expired. Please log in again.";
    if (status === 404) return "Invalid session or project. Check SSO project settings.";
    const body = ax.response?.data;
    if (body && typeof body === "object" && "detail" in body && body.detail) {
      return String(body.detail);
    }
  }
  if (err instanceof Error) return err.message;
  return "Authentication failed";
}
