import { useSsoReturn } from "@/hooks/useSsoReturn";

export default function AuthRedirect() {
  const error = useSsoReturn();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <div>Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-xl">Authenticating...</div>
    </div>
  );
}
